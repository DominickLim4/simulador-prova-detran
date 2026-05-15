export const CATEGORY_VALUES = [
  "LEGISLACAO",
  "DIRECAO_DEFENSIVA",
  "PRIMEIROS_SOCORROS",
  "MEIO_AMBIENTE_CIDADANIA",
  "MECANICA",
] as const;

export type Category = (typeof CATEGORY_VALUES)[number];

export type OptionKey = "A" | "B" | "C" | "D";

export type Question = {
  id: string;
  enunciado: string;
  alternativas: Record<OptionKey, string>;
  resposta_correta: OptionKey;
  categoria: Category;
  assunto: string;
  explicacao: string;
  link_estudo: string;
  imagem_url: string | null;
};

export type ExamOption = {
  id: string;
  label: OptionKey;
  text: string;
};

export type ExamQuestion = {
  id: string;
  enunciado: string;
  categoria: Category;
  assunto: string;
  imagem_url: string | null;
  alternativas: ExamOption[];
};

export type ExamSession = {
  id: string;
  nomeCandidato: string;
  dataInicio: string;
  tempoLimiteSegundos: number;
  questoesIds: string[];
  questoes: ExamQuestion[];
};

export type ReviewQuestion = {
  id: string;
  enunciado: string;
  categoria: Category;
  assunto: string;
  alternativas: Array<{
    label: OptionKey;
    text: string;
  }>;
  alternativaMarcada: OptionKey | null;
  textoAlternativaMarcada: string | null;
  respostaCorreta: OptionKey;
  textoRespostaCorreta: string;
  correta: boolean;
  explicacao: string;
  linkEstudo: string;
  imagemUrl: string | null;
};

export type CategoryResult = {
  categoria: Category;
  total: number;
  acertos: number;
  percentual: number;
};

export type StoredExamResult = {
  id: string;
  nomeCandidato: string;
  dataInicio: string;
  dataFim: string;
  tempoGastoSegundos: number;
  totalAcertos: number;
  aprovado: boolean;
  questoesIds: string[];
  respostas: Record<string, string | null>;
  revisao: ReviewQuestion[];
  desempenhoPorCategoria: CategoryResult[];
};

export const CATEGORY_LABELS: Record<Category, string> = {
  LEGISLACAO: "Legislação",
  DIRECAO_DEFENSIVA: "Direção Defensiva",
  PRIMEIROS_SOCORROS: "Primeiros Socorros",
  MEIO_AMBIENTE_CIDADANIA: "Cidadania e Meio Ambiente",
  MECANICA: "Mecânica Básica",
};

export const CATEGORY_SHORT_LABELS: Record<Category, string> = {
  LEGISLACAO: "Legislação",
  DIRECAO_DEFENSIVA: "Defensiva",
  PRIMEIROS_SOCORROS: "Socorros",
  MEIO_AMBIENTE_CIDADANIA: "Cidadania",
  MECANICA: "Mecânica",
};

export const CATEGORY_STYLES: Record<Category, string> = {
  LEGISLACAO: "border-sky-200 bg-sky-50 text-sky-800",
  DIRECAO_DEFENSIVA: "border-emerald-200 bg-emerald-50 text-emerald-800",
  PRIMEIROS_SOCORROS: "border-rose-200 bg-rose-50 text-rose-800",
  MEIO_AMBIENTE_CIDADANIA: "border-teal-200 bg-teal-50 text-teal-800",
  MECANICA: "border-amber-200 bg-amber-50 text-amber-900",
};

export const PASSING_SCORE = 21;
export const TOTAL_EXAM_QUESTIONS = 30;
export const EXAM_DURATION_SECONDS = 60 * 60;
