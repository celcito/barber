"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthUser } from "./auth";

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

  const dataInicio = `${formData.get("data_inicio")}T${formData.get("hora_inicio") || "08:00"}:00`;
  const dataFim = `${formData.get("data_fim")}T${formData.get("hora_fim") || "19:00"}:00`;

  const { error } = await supabase.from("horario_excessoes").insert({
    salao_id: user.id,
    data_inicio: new Date(dataInicio).toISOString(),
    data_fim: new Date(dataFim).toISOString(),
    tipo: formData.get("tipo") as "bloqueado" | "aberto_excessao",
    descricao: (formData.get("descricao") as string) || "",
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}

export async function deleteHorarioExcesso(id: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("horario_excessoes")
    .delete()
    .eq("id", id)
    .eq("salao_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}
