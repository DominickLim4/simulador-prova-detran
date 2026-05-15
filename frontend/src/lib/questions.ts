import { z } from "zod";
import questionsData from "@/data/questions.json";
import { CATEGORY_VALUES, type OptionKey, type Question } from "@/lib/types";

const optionKeySchema = z.enum(["A", "B", "C", "D"]);

const questionSchema = z.object({
  id: z.string().min(1),
  enunciado: z.string().min(1),
  alternativas: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
    C: z.string().min(1),
    D: z.string().min(1),
  }),
  resposta_correta: optionKeySchema,
  categoria: z.enum(CATEGORY_VALUES),
  assunto: z.string().min(1),
  explicacao: z.string().min(1),
  link_estudo: z.url(),
  imagem_url: z.string().nullable(),
});

export const questions = z.array(questionSchema).parse(questionsData) satisfies Question[];

export const questionById = new Map<string, Question>(
  questions.map((question) => [question.id, question])
);

export function parseOptionId(optionId: string | null): OptionKey | null {
  if (!optionId) {
    return null;
  }

  const optionKey = optionId.split(":").at(-1);

  if (optionKey === "A" || optionKey === "B" || optionKey === "C" || optionKey === "D") {
    return optionKey;
  }

  return null;
}
