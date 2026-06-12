"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clienteSchema, DIAS_SEMANA_MAP } from "@/lib/schemas/agendamento";
import { sendWhatsApp } from "@/lib/zapi";

export async function getSalaoBySlug(slug: string) {
  const supabase = await createClient();

  const { data: salao } = await supabase
    .from("saloes")
    .select("id, nome, slug, whatsapp, config")
    .eq("slug", slug)
    .single();

  return salao as {
    id: string;
    nome: string;
    slug: string;
    whatsapp: string | null;
    config: Record<string, unknown>;
  } | null;
}

export async function getServicosPublic(salaoId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("servicos")
    .select("id, nome, duracao_min, preco")
    .eq("salao_id", salaoId)
    .order("nome");

  return data ?? [];
}

export async function getProfissionaisPublic(salaoId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profissionais")
    .select("id, nome")
    .eq("salao_id", salaoId)
    .eq("ativo", true)
    .order("nome");

  return data ?? [];
}

export async function getHorariosDisponiveis(
  salaoId: string,
  profissionalId: string | null,
  servicoId: string,
  data: string
) {
  const supabase = await createClient();

  const { data: salao } = await supabase
    .from("saloes")
    .select("config")
    .eq("id", salaoId)
    .single();

  const config = (salao?.config ?? {}) as Record<string, unknown>;
  const horariosConf = (config.horarios ?? {}) as Record<
    string,
    { aberto: boolean; inicio: string; fim: string }
  >;
  const intervalo = (config.intervalo ?? 30) as number;

  const { data: servico } = await supabase
    .from("servicos")
    .select("duracao_min")
    .eq("id", servicoId)
    .single();

  if (!servico) return [];

  const duracaoMin = servico.duracao_min;

  const dataObj = new Date(data + "T12:00:00");
  const diaSemana = dataObj.getDay();

  const diaNome = Object.entries(DIAS_SEMANA_MAP).find(
    ([, v]) => v === diaSemana
  )?.[0];
  if (!diaNome) return [];

  const configDia = horariosConf[diaNome];
  if (!configDia || !configDia.aberto) return [];

  const dataInicioDia = `${data}T00:00:00`;
  const dataFimDia = `${data}T23:59:59`;

  const { data: excessos } = await supabase
    .from("horario_excessoes")
    .select("data_inicio, data_fim, tipo")
    .eq("salao_id", salaoId)
    .or(`and(data_inicio.lte.${dataFimDia}),and(data_fim.gte.${dataInicioDia})`);

  const excessosBloqueio = (excessos ?? []).filter(
    (e: { tipo: string }) => e.tipo === "bloqueado"
  );
  const excessosAbertos = (excessos ?? []).filter(
    (e: { tipo: string }) => e.tipo === "aberto_excessao"
  );

  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("inicio, fim, profissional_id")
    .eq("salao_id", salaoId)
    .eq("status", "confirmado")
    .gte("inicio", `${data}T00:00:00`)
    .lt("inicio", `${data}T23:59:59`);

  const ocupados = (agendamentos ?? [])
    .filter((a: { profissional_id: string | null }) => !profissionalId || a.profissional_id === profissionalId)
    .map((a: { inicio: string; fim: string }) => ({
      inicio: new Date(a.inicio).getTime(),
      fim: new Date(a.fim).getTime(),
    }));

  const abertura = new Date(`${data}T${configDia.inicio}:00`).getTime();
  const fechamento = new Date(`${data}T${configDia.fim}:00`).getTime();

  function slotIsBloqueado(slotInicio: number, slotFim: number) {
    return excessosBloqueio.some((exc: { data_inicio: string; data_fim: string }) => {
      const excInicio = new Date(exc.data_inicio).getTime();
      const excFim = new Date(exc.data_fim).getTime();
      return slotInicio < excFim && slotFim > excInicio;
    });
  }

  const periodosAbertura = [{ inicio: abertura, fim: fechamento }];
  for (const exc of excessosAbertos) {
    const excInicio = new Date(exc.data_inicio).getTime();
    const excFim = new Date(exc.data_fim).getTime();
    if (new Date(exc.data_inicio).toISOString().slice(0, 10) === data) {
      periodosAbertura.push({ inicio: excInicio, fim: excFim });
    }
  }

  const slots: string[] = [];

  for (const periodo of periodosAbertura) {
    let current = periodo.inicio;
    while (current + duracaoMin * 60000 <= periodo.fim) {
      const slotFim = current + duracaoMin * 60000;
      if (slotIsBloqueado(current, slotFim)) {
        current += intervalo * 60000;
        continue;
      }
      const conflito = ocupados.some(
        (o) => current < o.fim && slotFim > o.inicio
      );
      if (!conflito) {
        const d = new Date(current);
        slots.push(
          d.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        );
      }
      current += intervalo * 60000;
    }
  }

  return slots.filter((s, i, a) => a.indexOf(s) === i).sort();
}

export async function createAgendamento(formData: FormData) {
  const supabase = await createClient();

  const parsed = clienteSchema.safeParse({
    nome: formData.get("nome"),
    whatsapp: formData.get("whatsapp"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const salaoId = formData.get("salao_id") as string;
  const servicoId = formData.get("servico_id") as string;
  const profissionalId = formData.get("profissional_id") as string | null;
  const dataStr = formData.get("data") as string;
  const horario = formData.get("horario") as string;

  if (!salaoId || !servicoId || !dataStr || !horario) {
    return { error: { _form: ["Dados incompletos para agendamento"] } };
  }

  const { data: servico } = await supabase
    .from("servicos")
    .select("duracao_min, nome")
    .eq("id", servicoId)
    .single();

  if (!servico) {
    return { error: { _form: ["Serviço não encontrado"] } };
  }

  const { data: profissional } = profissionalId
    ? await supabase
        .from("profissionais")
        .select("nome")
        .eq("id", profissionalId)
        .single()
    : { data: null };

  const { data: salao } = await supabase
    .from("saloes")
    .select("nome, whatsapp")
    .eq("id", salaoId)
    .single();

  const inicio = new Date(`${dataStr}T${horario}:00`);
  const fim = new Date(inicio.getTime() + servico.duracao_min * 60000);

  const { data: conflito } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("salao_id", salaoId)
    .eq("status", "confirmado")
    .gte("inicio", inicio.toISOString())
    .lt("inicio", fim.toISOString());

  if (conflito && conflito.length > 0) {
    return { error: { _form: ["Este horário já foi reservado"] } };
  }

  const { data: novoAgendamento, error } = await supabase
    .from("agendamentos")
    .insert({
      salao_id: salaoId,
      profissional_id: profissionalId || null,
      servico_id: servicoId,
      cliente_nome: parsed.data.nome,
      cliente_whatsapp: parsed.data.whatsapp,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      status: "confirmado",
    })
    .select()
    .single();

  if (error) {
    return { error: { _form: [error.message] } };
  }

  const dataFormatada = inicio.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
  const horarioFormatado = inicio.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const profissionalNome = profissional?.nome || "Sem preferência";

  const msgCliente = [
    `✅ *Agendamento Confirmado!*`,
    ``,
    `🛠️ *${servico.nome}*`,
    `👤 ${profissionalNome}`,
    `📅 ${dataFormatada} às ${horarioFormatado}`,
    `📍 ${salao?.nome || "Salão"}`,
    ``,
    `Obrigado por agendar!`,
  ].join("\n");

  const msgDono = [
    `🆕 *Novo Agendamento*`,
    ``,
    `👤 Cliente: ${parsed.data.nome}`,
    `📱 WhatsApp: ${parsed.data.whatsapp}`,
    `🛠️ Serviço: ${servico.nome}`,
    `👤 Profissional: ${profissionalNome}`,
    `📅 ${dataFormatada} às ${horarioFormatado}`,
  ].join("\n");

  Promise.all([
    sendWhatsApp(parsed.data.whatsapp, msgCliente),
    ...(salao?.whatsapp ? [sendWhatsApp(salao.whatsapp, msgDono)] : []),
  ]).catch((err) => console.error("[WhatsApp] Send error:", err));

  revalidatePath(`/${formData.get("slug")}`);
  return { success: true, agendamento: novoAgendamento };
}
