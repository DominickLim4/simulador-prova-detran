import { z } from "zod";
import { generateExam } from "@/lib/exam";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const requestSchema = z.object({
  nomeCandidato: z.string().trim().min(2).max(80),
  recentQuestionIds: z.array(z.string()).max(60).default([]),
});

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const exam = generateExam(payload.nomeCandidato, payload.recentQuestionIds);

    return Response.json(exam, { headers: corsHeaders });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? "Informe um nome com pelo menos 2 caracteres."
        : "Nao foi possivel gerar a prova.";

    return Response.json(
      { message },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }
}
