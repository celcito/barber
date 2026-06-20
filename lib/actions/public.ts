"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clienteSchema, DIAS_SEMANA_MAP } from "@/lib/schemas/agendamento";
import { sendWhatsApp } from "@/lib/zapi";
import { sendConfirmationEmail } from "@/lib/email";
import { logger, auditLog } from "@/lib/logger";
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
    .select("id, nome, foto_url")
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

  const abertura = new Date(`${data}T${configDia.inicio}`).getTime();
  const fechamento = new Date(`${data}T${configDia.fim}`).getTime();

  function slotIsBloqueado(slotInicio: number, slotFim: number) {
    return excessosBloqueio.some((exc: { data_inicio: string; data_fim: string }) => {
      const excInicio = new Date(exc.data_inicio).getTime();
      const excFim = new Date(exc.data_fim).getTime();
      return slotInicio < excFim && slotFim > excInicio;
    });
  }

  const agora = Date.now();
  const hoje = new Date().toISOString().split("T")[0];

  const slots: string[] = [];
  let current = abertura;
  while (current + duracaoMin * 60000 <= fechamento) {
    const slotFim = current + duracaoMin * 60000;

    if (data === hoje && current <= agora) {
      current += intervalo * 60000;
      continue;
    }

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
  const requestMeta = {
    userAgent: formData.get("_ua") as string | null,
    timestamp: new Date().toISOString(),
  };

  logger.info("agendamento", "Starting public appointment creation", requestMeta);

  let supabase;
  try {
    supabase = await createClient();
  } catch (err) {
    logger.error("agendamento", "Failed to create Supabase client", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return { error: { _form: ["Erro de conexão com o servidor"] } };
  }

  const parsed = clienteSchema.safeParse({
    nome: formData.get("nome"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email") || undefined,
  });

  if (!parsed.success) {
    logger.warn("agendamento", "Client validation failed", {
      errors: parsed.error.flatten().fieldErrors,
    });
    return { error: parsed.error.flatten().fieldErrors };
  }

  const salaoId = formData.get("salao_id") as string;
  const servicoId = formData.get("servico_id") as string;
  const profissionalIdRaw = formData.get("profissional_id");
  const profissionalId = profissionalIdRaw && profissionalIdRaw !== "null" ? profissionalIdRaw as string : null;
  const dataStr = formData.get("data") as string;
  const horario = formData.get("horario") as string;

  logger.debug("agendamento", "Form data extracted", {
    salaoId,
    servicoId,
    profissionalId,
    data: dataStr,
    horario,
    clienteNome: parsed.data.nome,
    whatsappFormatado: parsed.data.whatsapp,
  });

  if (!salaoId || !servicoId || !dataStr || !horario) {
    logger.warn("agendamento", "Incomplete form data", {
      salaoId: !!salaoId,
      servicoId: !!servicoId,
      data: !!dataStr,
      horario: !!horario,
    });
    return { error: { _form: ["Dados incompletos para agendamento"] } };
  }

  const parsedSalaoId = uuidSchema.safeParse(salaoId);
  const parsedServicoId = uuidSchema.safeParse(servicoId);
  const parsedProfissionalId = profissionalId ? uuidSchema.safeParse(profissionalId) : null;
  const parsedData = dateSchema.safeParse(dataStr);

  if (!parsedSalaoId.success || !parsedServicoId.success || !parsedData.success) {
    logger.warn("agendamento", "UUID/date validation failed", {
      salaoIdValid: parsedSalaoId.success,
      servicoIdValid: parsedServicoId.success,
      dataValid: parsedData.success,
    });
    return { error: { _form: ["Dados inválidos"] } };
  }

  const { data: servico, error: servicoError } = await supabase
    .from("servicos")
    .select("duracao_min, nome")
    .eq("id", parsedServicoId.data)
    .single();

  if (servicoError) {
    logger.error("agendamento", "Failed to fetch service", {
      servicoId: parsedServicoId.data,
      error: servicoError.message,
      code: servicoError.code,
    });
    return { error: { _form: ["Serviço não encontrado"] } };
  }

  if (!servico) {
    logger.warn("agendamento", "Service not found", {
      servicoId: parsedServicoId.data,
    });
    return { error: { _form: ["Serviço não encontrado"] } };
  }

  const { data: profissional, error: profError } = parsedProfissionalId
    ? await supabase
        .from("profissionais")
        .select("nome")
        .eq("id", parsedProfissionalId.data)
        .single()
    : { data: null, error: null };

  if (profError) {
    logger.warn("agendamento", "Failed to fetch professional", {
      profissionalId: parsedProfissionalId?.data,
      error: profError.message,
    });
  }

  const { data: salao, error: salaoError } = await supabase
    .from("saloes")
    .select("nome, whatsapp")
    .eq("id", parsedSalaoId.data)
    .single();

  if (salaoError) {
    logger.error("agendamento", "Failed to fetch salon", {
      salaoId: parsedSalaoId.data,
      error: salaoError.message,
      code: salaoError.code,
    });
    return { error: { _form: ["Salão não encontrado"] } };
  }

  const inicio = new Date(`${parsedData.data}T${horario}:00`);
  const fim = new Date(inicio.getTime() + servico.duracao_min * 60000);

  logger.debug("agendamento", "Checking for conflicts", {
    salaoId: parsedSalaoId.data,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
  });

  const { data: conflito, error: conflitoError } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("salao_id", parsedSalaoId.data)
    .eq("status", "confirmado")
    .gte("inicio", inicio.toISOString())
    .lt("inicio", fim.toISOString());

  if (conflitoError) {
    logger.error("agendamento", "Failed to check conflicts", {
      error: conflitoError.message,
      code: conflitoError.code,
    });
    return { error: { _form: ["Erro ao verificar horário"] } };
  }

  if (conflito && conflito.length > 0) {
    logger.info("agendamento", "Time slot conflict detected", {
      conflitos: conflito.length,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    });
    return { error: { _form: ["Este horário já foi reservado"] } };
  }

  logger.info("agendamento", "Inserting appointment into database", {
    salaoId: parsedSalaoId.data,
    servicoId: parsedServicoId.data,
    profissionalId: parsedProfissionalId?.data || null,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
  });

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const insertResponse = await fetch(
    `${supabaseUrl}/rest/v1/agendamentos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        salao_id: parsedSalaoId.data,
        profissional_id: parsedProfissionalId?.data || null,
        servico_id: parsedServicoId.data,
        cliente_nome: parsed.data.nome,
        cliente_whatsapp: parsed.data.whatsapp,
        cliente_email: parsed.data.email || null,
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
        status: "confirmado",
      }),
    }
  );

  if (!insertResponse.ok) {
    const errorData = await insertResponse.json().catch(() => ({}));
    logger.error("agendamento", "Failed to insert appointment", {
      error: errorData.message || "Insert failed",
      code: insertResponse.status,
    });
    return { error: { _form: [`Erro ao criar agendamento: ${errorData.message || "Erro desconhecido"}`] } };
  }

  const location = insertResponse.headers.get("Location");
  const extractedId = (location?.split("/").pop() ?? "unknown") as string;
  const novoAgendamento: { id: string } = { id: extractedId };

  logger.info("agendamento", "Appointment created successfully", {
    agendamentoId: novoAgendamento?.id,
    salaoId: parsedSalaoId.data,
    clienteNome: parsed.data.nome,
    servico: servico.nome,
  });

  auditLog("agendamento.criado", {
    agendamentoId: novoAgendamento?.id,
    salaoId: parsedSalaoId.data,
    servicoId: parsedServicoId.data,
    profissionalId: parsedProfissionalId?.data || null,
    clienteNome: parsed.data.nome,
    clienteWhatsapp: parsed.data.whatsapp,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
  });

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
  ]).catch((err) => {
    logger.error("whatsapp", "Failed to send WhatsApp messages", {
      error: err instanceof Error ? err.message : String(err),
      agendamentoId: novoAgendamento?.id,
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
      logger.error("email", "Failed to send confirmation email", {
        error: err instanceof Error ? err.message : String(err),
        agendamentoId: novoAgendamento?.id,
        to: parsed.data.email,
      });
    });
  }

  revalidatePath(`/${formData.get("slug")}`);
  return { success: true, agendamento: novoAgendamento };
}
