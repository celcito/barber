"use server";

import { redirect } from "next/navigation";
import { getAuthUser } from "./auth";

export async function getAgendamentosSemana(dataInicio: string, profissionalId?: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const inicio = new Date(dataInicio);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 7);

  let query = supabase
    .from("agendamentos")
    .select("*, servicos(nome, preco, duracao_min), profissionais(nome)")
    .eq("salao_id", user.id)
    .gte("inicio", inicio.toISOString())
    .lt("inicio", fim.toISOString())
    .order("inicio");

  if (profissionalId) {
    query = query.eq("profissional_id", profissionalId);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getProfissionais() {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profissionais")
    .select("id, nome")
    .eq("salao_id", user.id)
    .eq("ativo", true)
    .order("nome");

  return data ?? [];
}
