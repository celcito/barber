"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clienteSchema, DIAS_SEMANA_MAP } from "@/lib/schemas/agendamento";
import { sendWhatsApp } from "@/lib/zapi";
import { sendConfirmationEmail } from "@/lib/email";
import { z } from "zod";

const slugSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/);
const uuidSchema = z.string().uuid();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);


export async function getSalaoBySlug(slug: string) {
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return null;

  const supabase = await createClient();

  const { data: salao } = await supabase
    .from("saloes")
    .select("id, nome, slug, whatsapp, config")
    .eq("slug", parsed.data)
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
  const parsed = uuidSchema.safeParse(salaoId);
  if (!parsed.success) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from("servicos")
    .select("id, nome, duracao_min, preco")
    .eq("salao_id", parsed.data)
    .order("nome");

  return data ?? [];
}

export interface SlotDisponivel {
  horario: string;
  profissionalId?: string;
  profissionalNome?: string;
}

export async function getProfissionaisPublic(salaoId: string) {
  const parsed = uuidSchema.safeParse(salaoId);
  if (!parsed.success) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from("profissionais")
    .select("id, nome")
    .eq("salao_id", parsed.data)
    .eq("ativo", true)
    .order("nome");

  return data ?? [];
}

async function getHorariosProfissional(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profissionalId: string
) {
  const { data: profHorarios } = await supabase
    .from("profissional_horarios")
    .select("dia_semana, aberto, inicio, fim")
    .eq("profissional_id", profissionalId);

  if (profHorarios && profHorarios.length > 0) {
    const map: Record<string, { aberto: boolean; inicio: string; fim: string }> = {};
    for (const h of profHorarios) {
      map[h.dia_semana] = { aberto: h.aberto, inicio: h.inicio, fim: h.fim };
    }
    return map;
  }

  return null;
}

async function calcularSlotsParaProfissional(
  supabase: Awaited<ReturnType<typeof createClient>>,
  salaoId: string,
  profissionalId: string | null,
  servicoId: string,
  data: string,
  horariosConf: Record<string, { aberto: boolean; inicio: string; fim: string }>,
  intervalo: number
): Promise<SlotDisponivel[]> {
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

  const slots: string[] = [];
  let current = abertura;
  while (current + duracaoMin * 60000 <= fechamento) {
    const slotFim = current + duracaoMin * 60000;
    if (!slotIsBloqueado(current, slotFim)) {
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
    }
    current += intervalo * 60000;
  }

  return Array.from(new Set(slots)).sort().map((horario) => ({ horario }));
}

export async function getHorariosDisponiveis(
  salaoId: string,
  profissionalId: string | null,
  servicoId: string,
  data: string
): Promise<SlotDisponivel[]> {
  const parsedSalaoId = uuidSchema.safeParse(salaoId);
  const parsedServicoId = uuidSchema.safeParse(servicoId);
  const parsedData = dateSchema.safeParse(data);
  const parsedProfissionalId = profissionalId ? uuidSchema.safeParse(profissionalId) : null;

  if (!parsedSalaoId.success || !parsedServicoId.success || !parsedData.success) return [];
  if (parsedProfissionalId && !parsedProfissionalId.success) return [];

  const supabase = await createClient();

  const { data: salaoConfig } = await supabase
    .from("saloes")
    .select("config")
    .eq("id", parsedSalaoId.data)
    .single();

  const config = (salaoConfig?.config ?? {}) as Record<string, unknown>;
  const horariosConf = (config.horarios ?? {}) as Record<
    string,
    { aberto: boolean; inicio: string; fim: string }
  >;
  const intervalo = (config.intervalo ?? 30) as number;

  const dataObj = new Date(parsedData.data + "T12:00:00");
  const diaSemana = dataObj.getDay();
  const diaNome = Object.entries(DIAS_SEMANA_MAP).find(
    ([, v]) => v === diaSemana
  )?.[0];
  if (!diaNome) return [];

  if (parsedProfissionalId) {
    const profHorarios = await getHorariosProfissional(supabase, parsedProfissionalId.data);
    const horariosUsar = profHorarios ?? horariosConf;

    if (!horariosUsar[diaNome] || !horariosUsar[diaNome].aberto) return [];

    return calcularSlotsParaProfissional(
      supabase, parsedSalaoId.data, parsedProfissionalId.data, parsedServicoId.data, parsedData.data,
      horariosUsar, intervalo
    );
  }

  const { data: profissionais } = await supabase
    .from("profissionais")
    .select("id, nome")
    .eq("salao_id", parsedSalaoId.data)
    .eq("ativo", true)
    .order("nome");

  if (!profissionais || profissionais.length === 0) return [];

  const slotMap = new Map<string, { profissionalId: string; profissionalNome: string }>();

  for (const prof of profissionais) {
    const profHorarios = await getHorariosProfissional(supabase, prof.id);
    const horariosUsar = profHorarios ?? horariosConf;

    if (!horariosUsar[diaNome] || !horariosUsar[diaNome].aberto) continue;

    const profSlots = await calcularSlotsParaProfissional(
      supabase, parsedSalaoId.data, prof.id, parsedServicoId.data, parsedData.data,
      horariosUsar, intervalo
    );

    for (const slot of profSlots) {
      if (!slotMap.has(slot.horario)) {
        slotMap.set(slot.horario, {
          profissionalId: prof.id,
          profissionalNome: prof.nome,
        });
      }
    }
  }

  return Array.from(slotMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([horario, info]) => ({
      horario,
      profissionalId: info.profissionalId,
      profissionalNome: info.profissionalNome,
    }));
}

export async function createAgendamento(formData: FormData) {
  const supabase = await createClient();

  const parsed = clienteSchema.safeParse({
    nome: formData.get("nome"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email") || undefined,
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

  const parsedSalaoId = uuidSchema.safeParse(salaoId);
  const parsedServicoId = uuidSchema.safeParse(servicoId);
  const parsedProfissionalId = profissionalId ? uuidSchema.safeParse(profissionalId) : null;
  const parsedData = dateSchema.safeParse(dataStr);

  if (!parsedSalaoId.success || !parsedServicoId.success || !parsedData.success) {
    return { error: { _form: ["Dados inválidos"] } };
  }

  const { data: servico } = await supabase
    .from("servicos")
    .select("duracao_min, nome")
    .eq("id", parsedServicoId.data)
    .single();

  if (!servico) {
    return { error: { _form: ["Serviço não encontrado"] } };
  }

  const { data: profissional } = parsedProfissionalId
    ? await supabase
        .from("profissionais")
        .select("nome")
        .eq("id", parsedProfissionalId.data)
        .single()
    : { data: null };

  const { data: salao } = await supabase
    .from("saloes")
    .select("nome, whatsapp")
    .eq("id", parsedSalaoId.data)
    .single();

  const inicio = new Date(`${parsedData.data}T${horario}:00`);
  const fim = new Date(inicio.getTime() + servico.duracao_min * 60000);

  const { data: conflito } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("salao_id", parsedSalaoId.data)
    .eq("status", "confirmado")
    .gte("inicio", inicio.toISOString())
    .lt("inicio", fim.toISOString());

  if (conflito && conflito.length > 0) {
    return { error: { _form: ["Este horário já foi reservado"] } };
  }

  const { data: novoAgendamento, error } = await supabase
    .from("agendamentos")
    .insert({
      salao_id: parsedSalaoId.data,
      profissional_id: parsedProfissionalId?.data || null,
      servico_id: parsedServicoId.data,
      cliente_nome: parsed.data.nome,
      cliente_whatsapp: parsed.data.whatsapp,
      cliente_email: parsed.data.email || null,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      status: "confirmado",
    })
    .select()
    .single();

  if (error) {
    console.error("[Agendamento] Error:", error.message, error.details, error.hint);
    return { error: { _form: [`Erro ao criar agendamento: ${error.message}`] } };
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

  if (parsed.data.email) {
    sendConfirmationEmail({
      to: parsed.data.email,
      clienteNome: parsed.data.nome,
      servicoNome: servico.nome,
      profissionalNome,
      data: dataFormatada,
      horario: horarioFormatado,
      salaoNome: salao?.nome || "Salão",
    }).catch((err) => console.error("[Email] Send error:", err));
  }

  revalidatePath(`/${formData.get("slug")}`);
  return { success: true, agendamento: novoAgendamento };
}
