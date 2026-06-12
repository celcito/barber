"use server";

import { getAuthUser } from "./auth";

export interface ClienteAgregado {
  whatsapp: string;
  nome: string;
  total_agendamentos: number;
  ultimo_agendamento: string;
}

export async function getClientesAgregados(): Promise<ClienteAgregado[]> {
  const { supabase, user } = await getAuthUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("agendamentos")
    .select("cliente_nome, cliente_whatsapp, inicio")
    .eq("salao_id", user.id)
    .order("inicio", { ascending: false });

  if (error || !data) return [];

  const map = new Map<string, ClienteAgregado>();

  for (const row of data) {
    if (!row.cliente_whatsapp) continue;
    
    const wpp = row.cliente_whatsapp;
    
    if (!map.has(wpp)) {
      map.set(wpp, {
        whatsapp: wpp,
        nome: row.cliente_nome || "Desconhecido",
        total_agendamentos: 1,
        ultimo_agendamento: row.inicio,
      });
    } else {
      const cli = map.get(wpp)!;
      cli.total_agendamentos += 1;
    }
  }

  return Array.from(map.values());
}
