import { questionById, questions, parseOptionId } from "@/lib/questions";
import {
  CATEGORY_VALUES,
  EXAM_DURATION_SECONDS,
  PASSING_SCORE,
  type Category,
  type CategoryResult,
  type ExamOption,
  type ExamQuestion,
  type ExamSession,
  type OptionKey,
  type Question,
  type ReviewQuestion,
  type StoredExamResult,
} from "@/lib/types";

const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"];

export const EXAM_BLUEPRINT: Record<Category, number> = {
  LEGISLACAO: 12,
  DIRECAO_DEFENSIVA: 10,
  PRIMEIROS_SOCORROS: 3,
  MEIO_AMBIENTE_CIDADANIA: 3,
  MECANICA: 2,
};

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[randomIndex];
    copy[randomIndex] = current;
  }

  return copy;
}

function createOptionId(questionId: string, optionKey: OptionKey): string {
  return `${questionId}:${optionKey}`;
}

function toExamQuestion(question: Question): ExamQuestion {
  const shuffledKeys = shuffle(OPTION_KEYS);
  const alternativas: ExamOption[] = shuffledKeys.map((sourceOptionKey, index) => ({
    id: createOptionId(question.id, sourceOptionKey),
    label: OPTION_KEYS[index],
    text: question.alternativas[sourceOptionKey],
  }));

  return {
    id: question.id,
    enunciado: question.enunciado,
    categoria: question.categoria,
    assunto: question.assunto,
    imagem_url: question.imagem_url,
    alternativas,
  };
}

function getQuestionFamilyKey(question: Question): string {
  return `${question.categoria}:${question.assunto.trim().toLowerCase()}`;
}

function countUniqueFamilies(pool: Question[]): number {
  return new Set(pool.map(getQuestionFamilyKey)).size;
}

function pickDiverseQuestions(pool: Question[], amount: number): Question[] {
  const shuffledPool = shuffle(pool);
  const selected: Question[] = [];
  const selectedIds = new Set<string>();
  const selectedFamilies = new Set<string>();

  for (const question of shuffledPool) {
    const familyKey = getQuestionFamilyKey(question);

    if (selectedFamilies.has(familyKey)) {
      continue;
    }

    selected.push(question);
    selectedIds.add(question.id);
    selectedFamilies.add(familyKey);

    if (selected.length === amount) {
      return selected;
    }
  }

  for (const question of shuffledPool) {
    if (selectedIds.has(question.id)) {
      continue;
    }

    selected.push(question);
    selectedIds.add(question.id);

    if (selected.length === amount) {
      return selected;
    }
  }

  return selected;
}

function pickCategoryQuestions(
  category: Category,
  amount: number,
  recentQuestionIds: Set<string>
): Question[] {
  const pool = questions.filter((question) => question.categoria === category);
  const lessRecentPool = pool.filter((question) => !recentQuestionIds.has(question.id));
  const source =
    countUniqueFamilies(lessRecentPool) >= amount ? lessRecentPool : pool;

  return pickDiverseQuestions(source, amount);
}

export function generateExam(
  nomeCandidato: string,
  recentQuestionIds: string[] = []
): ExamSession {
  const recentSet = new Set(recentQuestionIds);
  const selectedQuestions = CATEGORY_VALUES.flatMap((category) =>
    pickCategoryQuestions(category, EXAM_BLUEPRINT[category], recentSet)
  );
  const orderedQuestions = shuffle(selectedQuestions);

  return {
    id: crypto.randomUUID(),
    nomeCandidato,
    dataInicio: new Date().toISOString(),
    tempoLimiteSegundos: EXAM_DURATION_SECONDS,
    questoesIds: orderedQuestions.map((question) => question.id),
    questoes: orderedQuestions.map(toExamQuestion),
  };
}

function buildCategoryResults(revisao: ReviewQuestion[]): CategoryResult[] {
  return CATEGORY_VALUES.map((categoria) => {
    const questionsInCategory = revisao.filter(
      (question) => question.categoria === categoria
    );
    const acertos = questionsInCategory.filter((question) => question.correta).length;
    const total = questionsInCategory.length;

    return {
      categoria,
      total,
      acertos,
      percentual: total === 0 ? 0 : Math.round((acertos / total) * 100),
    };
  });
}

export function gradeExam(input: {
  examId?: string;
  nomeCandidato: string;
  dataInicio: string;
  questoesIds: string[];
  respostas: Record<string, string | null>;
  tempoGastoSegundos: number;
}): StoredExamResult {
  const revisao: ReviewQuestion[] = input.questoesIds.map((questionId) => {
    const question = questionById.get(questionId);

    if (!question) {
      throw new Error(`Questao nao encontrada: ${questionId}`);
    }

    const alternativaMarcada = parseOptionId(input.respostas[questionId] ?? null);
    const respostaCorreta = question.resposta_correta;

    return {
      id: question.id,
      enunciado: question.enunciado,
      categoria: question.categoria,
      assunto: question.assunto,
      alternativas: OPTION_KEYS.map((optionKey) => ({
        label: optionKey,
        text: question.alternativas[optionKey],
      })),
      alternativaMarcada,
      textoAlternativaMarcada: alternativaMarcada
        ? question.alternativas[alternativaMarcada]
        : null,
      respostaCorreta,
      textoRespostaCorreta: question.alternativas[respostaCorreta],
      correta: alternativaMarcada === respostaCorreta,
      explicacao: question.explicacao,
      linkEstudo: question.link_estudo,
      imagemUrl: question.imagem_url,
    };
  });
  const totalAcertos = revisao.filter((question) => question.correta).length;

  return {
    id: input.examId ?? crypto.randomUUID(),
    nomeCandidato: input.nomeCandidato,
    dataInicio: input.dataInicio,
    dataFim: new Date().toISOString(),
    tempoGastoSegundos: Math.max(0, Math.round(input.tempoGastoSegundos)),
    totalAcertos,
    aprovado: totalAcertos >= PASSING_SCORE,
    questoesIds: input.questoesIds,
    respostas: input.respostas,
    revisao,
    desempenhoPorCategoria: buildCategoryResults(revisao),
  };
}
