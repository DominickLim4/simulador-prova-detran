import { PrismaClient, type QuestionCategory } from "@prisma/client";
import questions from "../../frontend/src/data/questions.json" with { type: "json" };

const prisma = new PrismaClient();

type SeedQuestion = {
  id: string;
  enunciado: string;
  alternativas: Record<"A" | "B" | "C" | "D", string>;
  resposta_correta: "A" | "B" | "C" | "D";
  categoria: QuestionCategory;
  assunto: string;
  explicacao: string;
  link_estudo: string;
  imagem_url: string | null;
};

async function main() {
  const seedQuestions = questions as SeedQuestion[];

  for (const question of seedQuestions) {
    await prisma.question.upsert({
      where: { id: question.id },
      update: {
        enunciado: question.enunciado,
        alternativas: question.alternativas,
        respostaCorreta: question.resposta_correta,
        categoria: question.categoria,
        assunto: question.assunto,
        explicacao: question.explicacao,
        linkEstudo: question.link_estudo,
        imagemUrl: question.imagem_url,
      },
      create: {
        id: question.id,
        enunciado: question.enunciado,
        alternativas: question.alternativas,
        respostaCorreta: question.resposta_correta,
        categoria: question.categoria,
        assunto: question.assunto,
        explicacao: question.explicacao,
        linkEstudo: question.link_estudo,
        imagemUrl: question.imagem_url,
      },
    });
  }

  console.log(`Seeded ${seedQuestions.length} questions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
