import { z } from "zod";
import { gradeExam } from "@/lib/exam";
import { TOTAL_EXAM_QUESTIONS } from "@/lib/types";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const requestSchema = z.object({
  examId: z.string().optional(),
  nomeCandidato: z.string().trim().min(2).max(80),
  dataInicio: z.iso.datetime(),
  questoesIds: z.array(z.string()).length(TOTAL_EXAM_QUESTIONS),
  respostas: z.record(z.string(), z.string().nullable()),
  tempoGastoSegundos: z.number().int().min(0).max(60 * 60),
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
    const result = gradeExam(payload);

    return Response.json(result, { headers: corsHeaders });
  } catch {
    return Response.json(
      { message: "Nao foi possivel corrigir a prova." },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }
}
