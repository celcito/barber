import { NextResponse } from "next/server";
import { getHorariosDisponiveisAdmin } from "@/lib/actions/agendamentos";

export async function POST(request: Request) {
  const formData = await request.formData();

  const profissionalId = formData.get("profissional_id") as string | null;
  const servicoId = formData.get("servico_id") as string;
  const data = formData.get("data") as string;

  if (!servicoId || !data) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const slots = await getHorariosDisponiveisAdmin(
    profissionalId || null,
    servicoId,
    data
  );

  return NextResponse.json({ slots });
}
