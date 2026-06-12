"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthUser } from "./auth";
import { z } from "zod";

const createHorarioExcessoSchema = z.object({
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de início inválida"),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de fim inválida"),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora de início inválida").optional().default("08:00"),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/, "Hora de fim inválida").optional().default("19:00"),
  tipo: z.enum(["bloqueado", "aberto_excessao"]),
  descricao: z.string().max(500, "Descrição muito longa").optional().default(""),
});

const uuidSchema = z.string().uuid();

export async function getHorarioExcessoes() {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("horario_excessoes")
    .select("*")
    .eq("salao_id", user.id)
    .order("data_inicio", { ascending: true });

  return data ?? [];
}

export async function createHorarioExcesso(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const parsed = createHorarioExcessoSchema.safeParse({
    data_inicio: formData.get("data_inicio"),
    data_fim: formData.get("data_fim"),
    hora_inicio: formData.get("hora_inicio") || "08:00",
    hora_fim: formData.get("hora_fim") || "19:00",
    tipo: formData.get("tipo"),
    descricao: formData.get("descricao") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const dataInicio = `${parsed.data.data_inicio}T${parsed.data.hora_inicio}:00`;
  const dataFim = `${parsed.data.data_fim}T${parsed.data.hora_fim}:00`;

  const { error } = await supabase.from("horario_excessoes").insert({
    salao_id: user.id,
    data_inicio: new Date(dataInicio).toISOString(),
    data_fim: new Date(dataFim).toISOString(),
    tipo: parsed.data.tipo,
    descricao: parsed.data.descricao || "",
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}

export async function deleteHorarioExcesso(id: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return { error: "ID inválido" };

  const { error } = await supabase
    .from("horario_excessoes")
    .delete()
    .eq("id", parsed.data)
    .eq("salao_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}
