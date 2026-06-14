"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "./auth";
import { adminAgendamentoSchema, DIAS_SEMANA_MAP } from "@/lib/schemas/agendamento";
import { sendWhatsApp } from "@/lib/zapi";
import { sendConfirmationEmail, sendCancellationEmail } from "@/lib/email";
import { logger, auditLog } from "@/lib/logger";

export interface SlotDisponivel {
  horario: string;
  profissionalId?: string;
  profissionalNome?: string;
}

export async function cancelarAgendamento(id: string) {
  logger.info("agendamento", "Cancelling appointment", { agendamentoId: id });

  const supabase = await createClient();
  const authResult = await supabase.auth.getUser();
  const userId = authResult.data?.user?.id;
  if (!userId) {
    logger.warn("agendamento", "Cancel failed: not authenticated", { agendamentoId: id });
    return { error: "Não autenticado" };
  }

  const { data: agendamento, error: fetchError } = await supabase
    .from("agendamentos")
    .select("cliente_nome, cliente_email, servico_id, profissional_id, inicio")
    .eq("id", id)
    .eq("salao_id", userId)
    .single();

  if (fetchError) {
    logger.error("agendamento", "Failed to fetch appointment for cancellation", {
      agendamentoId: id,
      userId,
      error: fetchError.message,
      code: fetchError.code,
    });
  }

  if (!agendamento) {
    logger.warn("agendamento", "Appointment not found for cancellation", {
      agendamentoId: id,
      userId,
    });
    return { error: "Agendamento não encontrado" };
  }

  const { error } = await supabase
    .from("agendamentos")
    .update({ status: "cancelado" })
    .eq("id", id)
    .eq("salao_id", userId);

  if (error) {
    logger.error("agendamento", "Failed to cancel appointment", {
      agendamentoId: id,
      userId,
      error: error.message,
      code: error.code,
    });
    return { error: error.message };
  }

  logger.info("agendamento", "Appointment cancelled successfully", {
    agendamentoId: id,
    userId,
    clienteNome: agendamento.cliente_nome,
  });

  auditLog("agendamento.cancelado", {
    agendamentoId: id,
    salaoId: userId,
    clienteNome: agendamento.cliente_nome,
  });

  if (agendamento.cliente_email) {
    const { data: servico } = await supabase
      .from("servicos")
      .select("nome")
      .eq("id", agendamento.servico_id)
      .single();

    const { data: profissional } = agendamento.profissional_id
      ? await supabase
          .from("profissionais")
          .select("nome")
          .eq("id", agendamento.profissional_id)
          .single()
      : { data: null };

    const { data: salao } = await supabase
      .from("saloes")
      .select("nome")
      .eq("id", userId)
      .single();

    const inicio = new Date(agendamento.inicio);
    const dataFormatada = inicio.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
    });
    const horarioFormatado = inicio.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    sendCancellationEmail({
      to: agendamento.cliente_email,
      clienteNome: agendamento.cliente_nome,
      servicoNome: servico?.nome || "Serviço",
      profissionalNome: profissional?.nome || "Sem preferência",
      data: dataFormatada,
      horario: horarioFormatado,
      salaoNome: salao?.nome || "Salão",
    }).catch((err) => {
      logger.error("email", "Failed to send cancellation email", {
        error: err instanceof Error ? err.message : String(err),
        agendamentoId: id,
        to: agendamento.cliente_email,
      });
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  return { success: true };
}

export async function getServicosAdmin() {
  const { supabase, user } = await getAuthUser();
  if (!user) return [];

  const { data } = await supabase
    .from("servicos")
    .select("id, nome, duracao_min, preco")
    .eq("salao_id", user.id)
    .order("nome");

  return data ?? [];
}

export async function getProfissionaisAdmin() {
  const { supabase, user } = await getAuthUser();
  if (!user) return [];

  const { data } = await supabase
    .from("profissionais")
    .select("id, nome")
    .eq("salao_id", user.id)
    .eq("ativo", true)
    .order("nome");

  return data ?? [];
}

async function getHorariosProfissionalAdmin(
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

async function calcularSlotsAdmin(
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

export async function getHorariosDisponiveisAdmin(
  profissionalId: string | null,
  servicoId: string,
  data: string
): Promise<SlotDisponivel[]> {
  const { supabase, user } = await getAuthUser();
  if (!user) return [];

  const salaoId = user.id;

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

  const dataObj = new Date(data + "T12:00:00");
  const diaSemana = dataObj.getDay();
  const diaNome = Object.entries(DIAS_SEMANA_MAP).find(
    ([, v]) => v === diaSemana
  )?.[0];
  if (!diaNome) return [];

  if (profissionalId) {
    const profHorarios = await getHorariosProfissionalAdmin(supabase, profissionalId);
    const horariosUsar = profHorarios ?? horariosConf;

    if (!horariosUsar[diaNome] || !horariosUsar[diaNome].aberto) return [];

    return calcularSlotsAdmin(
      supabase, salaoId, profissionalId, servicoId, data,
      horariosUsar, intervalo
    );
  }

  const { data: profissionais } = await supabase
    .from("profissionais")
    .select("id, nome")
    .eq("salao_id", salaoId)
    .eq("ativo", true)
    .order("nome");

  if (!profissionais || profissionais.length === 0) return [];

  const slotMap = new Map<string, { profissionalId: string; profissionalNome: string }>();

  for (const prof of profissionais) {
    const profHorarios = await getHorariosProfissionalAdmin(supabase, prof.id);
    const horariosUsar = profHorarios ?? horariosConf;

    if (!horariosUsar[diaNome] || !horariosUsar[diaNome].aberto) continue;

    const profSlots = await calcularSlotsAdmin(
      supabase, salaoId, prof.id, servicoId, data,
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

export async function createAgendamentoAdmin(formData: FormData) {
  logger.info("agendamento", "Starting admin appointment creation");

  const { supabase, user } = await getAuthUser();
  if (!user) {
    logger.warn("agendamento", "Admin appointment creation failed: not authenticated");
    return { error: { _form: ["Não autenticado"] } };
  }

  const parsed = adminAgendamentoSchema.safeParse({
    nome: formData.get("nome"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email") || undefined,
  });

  if (!parsed.success) {
    logger.warn("agendamento", "Admin client validation failed", {
      errors: parsed.error.flatten().fieldErrors,
      userId: user.id,
    });
    return { error: parsed.error.flatten().fieldErrors };
  }

  const servicoId = formData.get("servico_id") as string;
  const profissionalId = formData.get("profissional_id") as string | null;
  const dataStr = formData.get("data") as string;
  const horario = formData.get("horario") as string;

  logger.debug("agendamento", "Admin form data extracted", {
    userId: user.id,
    servicoId,
    profissionalId,
    data: dataStr,
    horario,
    clienteNome: parsed.data.nome,
  });

  if (!servicoId || !dataStr || !horario) {
    logger.warn("agendamento", "Admin incomplete form data", {
      servicoId: !!servicoId,
      data: !!dataStr,
      horario: !!horario,
      userId: user.id,
    });
    return { error: { _form: ["Dados incompletos para agendamento"] } };
  }

  const { data: servico, error: servicoError } = await supabase
    .from("servicos")
    .select("duracao_min, nome")
    .eq("id", servicoId)
    .single();

  if (servicoError) {
    logger.error("agendamento", "Admin failed to fetch service", {
      servicoId,
      error: servicoError.message,
      code: servicoError.code,
      userId: user.id,
    });
    return { error: { _form: ["Serviço não encontrado"] } };
  }

  if (!servico) {
    logger.warn("agendamento", "Admin service not found", {
      servicoId,
      userId: user.id,
    });
    return { error: { _form: ["Serviço não encontrado"] } };
  }

  const { data: profissional, error: profError } = profissionalId
    ? await supabase
        .from("profissionais")
        .select("nome")
        .eq("id", profissionalId)
        .single()
    : { data: null, error: null };

  if (profError) {
    logger.warn("agendamento", "Admin failed to fetch professional", {
      profissionalId,
      error: profError.message,
      userId: user.id,
    });
  }

  const inicio = new Date(`${dataStr}T${horario}:00`);
  const fim = new Date(inicio.getTime() + servico.duracao_min * 60000);

  logger.debug("agendamento", "Admin checking for conflicts", {
    userId: user.id,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
  });

  const { data: conflito, error: conflitoError } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("salao_id", user.id)
    .eq("status", "confirmado")
    .gte("inicio", inicio.toISOString())
    .lt("inicio", fim.toISOString());

  if (conflitoError) {
    logger.error("agendamento", "Admin failed to check conflicts", {
      error: conflitoError.message,
      code: conflitoError.code,
      userId: user.id,
    });
    return { error: { _form: ["Erro ao verificar horário"] } };
  }

  if (conflito && conflito.length > 0) {
    logger.info("agendamento", "Admin time slot conflict detected", {
      conflitos: conflito.length,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      userId: user.id,
    });
    return { error: { _form: ["Este horário já foi reservado"] } };
  }

  logger.info("agendamento", "Admin inserting appointment", {
    userId: user.id,
    servicoId,
    profissionalId: profissionalId || null,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
  });

  const { error } = await supabase
    .from("agendamentos")
    .insert({
      salao_id: user.id,
      profissional_id: profissionalId || null,
      servico_id: servicoId,
      cliente_nome: parsed.data.nome,
      cliente_whatsapp: parsed.data.whatsapp,
      cliente_email: parsed.data.email || null,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      status: "confirmado",
    });

  if (error) {
    logger.error("agendamento", "Admin failed to insert appointment", {
      error: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      userId: user.id,
      servicoId,
      profissionalId: profissionalId || null,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    });
    return { error: { _form: [error.message] } };
  }

  logger.info("agendamento", "Admin appointment created successfully", {
    salaoId: user.id,
    clienteNome: parsed.data.nome,
    servico: servico.nome,
  });

  auditLog("agendamento.criado", {
    source: "admin",
    salaoId: user.id,
    servicoId,
    profissionalId: profissionalId || null,
    clienteNome: parsed.data.nome,
    clienteWhatsapp: parsed.data.whatsapp,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
  });

  const { data: salao } = await supabase
    .from("saloes")
    .select("nome, whatsapp")
    .eq("id", user.id)
    .single();

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
    `🆕 *Novo Agendamento (Admin)*`,
    ``,
    `👤 Cliente: ${parsed.data.nome}`,
    `📱 WhatsApp: ${parsed.data.whatsapp}`,
    ...(parsed.data.email ? [`📧 E-mail: ${parsed.data.email}`] : []),
    `🛠️ Serviço: ${servico.nome}`,
    `👤 Profissional: ${profissionalNome}`,
    `📅 ${dataFormatada} às ${horarioFormatado}`,
  ].join("\n");

  Promise.all([
    sendWhatsApp(parsed.data.whatsapp, msgCliente),
    ...(salao?.whatsapp ? [sendWhatsApp(salao.whatsapp, msgDono)] : []),
  ]).catch((err) => {
    logger.error("whatsapp", "Admin failed to send WhatsApp messages", {
      error: err instanceof Error ? err.message : String(err),
      userId: user.id,
    });
  });

  if (parsed.data.email) {
    sendConfirmationEmail({
      to: parsed.data.email,
      clienteNome: parsed.data.nome,
      servicoNome: servico.nome,
      profissionalNome,
      data: dataFormatada,
      horario: horarioFormatado,
      salaoNome: salao?.nome || "Salão",
    }).catch((err) => {
      logger.error("email", "Admin failed to send confirmation email", {
        error: err instanceof Error ? err.message : String(err),
        userId: user.id,
        to: parsed.data.email,
      });
    });
  }

  revalidatePath("/dashboard/agenda");
  return { success: true };
}
