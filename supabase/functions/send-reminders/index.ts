import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface Agendamento {
  id: string;
  salao_id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  inicio: string;
  servico_id: string;
  profissional_id: string | null;
}

interface NotificacoesConfig {
  lembretes_ativos: boolean;
  intervalo_lembrete: number;
  template: string;
  notificar_dono: boolean;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function sendWhatsApp(phone: string, message: string) {
  const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
  const token = Deno.env.get("ZAPI_TOKEN");
  if (!instanceId || !token) return;

  const cleanPhone = phone.replace(/\D/g, "");
  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: `55${cleanPhone}`, message }),
  });

  if (!res.ok) console.error("[Reminder] Z-API error:", await res.text());
}

function buildMessage(template: string, vars: Record<string, string>): string {
  let msg = template;
  for (const [key, value] of Object.entries(vars)) {
    msg = msg.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return msg;
}

Deno.serve(async () => {
  const now = new Date();

  const { data: agendamentos, error } = await supabase
    .from("agendamentos")
    .select("id, salao_id, cliente_nome, cliente_whatsapp, inicio, servico_id, profissional_id")
    .eq("status", "confirmado")
    .eq("lembrete_enviado", false)
    .gte("inicio", now.toISOString());

  if (error) {
    console.error("[Reminder] Query error:", error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  if (!agendamentos || agendamentos.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }));
  }

  let sent = 0;

  for (const agendamento of agendamentos as unknown as Agendamento[]) {
    const { data: salao } = await supabase
      .from("saloes")
      .select("nome, whatsapp, config")
      .eq("id", agendamento.salao_id)
      .single();

    const config = (salao?.config as Record<string, unknown>) ?? {};
    const notifConfig = (config.notificacoes ?? {}) as NotificacoesConfig;
    const intervalo = notifConfig.intervalo_lembrete || 120;

    if (!notifConfig.lembretes_ativos && notifConfig.lembretes_ativos !== undefined) {
      continue;
    }

    const inicio = new Date(agendamento.inicio);
    const diffMs = inicio.getTime() - now.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    const tolerance = 15;
    if (diffMin < intervalo - tolerance || diffMin > intervalo + tolerance) {
      continue;
    }

    const { data: servico } = await supabase
      .from("servicos")
      .select("nome")
      .eq("id", agendamento.servico_id)
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

    const template = notifConfig.template ||
      "Olá {{nome}}, lembrete do seu horário hoje às {{horario}} para {{servico}} no {{salao}}.";

    const message = buildMessage(template, {
      nome: agendamento.cliente_nome,
      horario: horarioFormatado,
      data: dataFormatada,
      servico: (servico as unknown as { nome: string })?.nome || "Serviço",
      salao: (salao as unknown as { nome: string })?.nome || "Salão",
    });

    await sendWhatsApp(agendamento.cliente_whatsapp, message);
    sent++;

    await supabase
      .from("agendamentos")
      .update({ lembrete_enviado: true })
      .eq("id", agendamento.id);
  }

  return new Response(JSON.stringify({ sent }));
});
