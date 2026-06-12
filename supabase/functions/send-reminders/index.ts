import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface Agendamento {
  id: string;
  salao_id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  cliente_email: string | null;
  inicio: string;
  servico_id: string;
  profissional_id: string | null;
}

interface NotificacoesConfig {
  lembretes_ativos: boolean;
  lembretes_email_ativos?: boolean;
  intervalo_lembrete: number;
  template: string;
  notificar_dono: boolean;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendEmailReminder(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM") || "Agenda Fácil <onboarding@resend.dev>";
  if (!apiKey) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) console.error("[Reminder] Resend error:", await res.text());
}

function buildEmailHtml(
  clienteNome: string,
  servicoNome: string,
  profissionalNome: string,
  data: string,
  horario: string,
  salaoNome: string,
) {
  const safe = {
    clienteNome: escapeHtml(clienteNome),
    servicoNome: escapeHtml(servicoNome),
    profissionalNome: escapeHtml(profissionalNome),
    data: escapeHtml(data),
    horario: escapeHtml(horario),
    salaoNome: escapeHtml(salaoNome),
  };

  const cardStyle =
    "background-color:#0d0e0f;border-radius:6px;padding:24px;margin-bottom:24px;";
  const rowStyle =
    "display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2a2c2e;";
  const labelStyle =
    "font-size:13px;color:#9a8f80;text-transform:uppercase;letter-spacing:0.06em;";
  const valueStyle = "font-size:14px;color:#e8e4df;font-weight:600;";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background-color:#121414;font-family:'Hanken Grotesk',Arial,sans-serif;padding:40px 0;margin:0">
  <table align="center" role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#1a1c1e;border-radius:8px;overflow:hidden;">
    <tr>
      <td style="background-color:#0d0e0f;padding:32px 40px 24px;text-align:center;">
        <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;color:#c5a059;margin:0 0 4px;letter-spacing:0.02em;">${safe.salaoNome}</h1>
        <p style="font-size:12px;color:#9a8f80;letter-spacing:0.15em;text-transform:uppercase;margin:0;">Lembrete de Agendamento</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 40px;">
        <p style="font-size:16px;color:#e8e4df;margin:0 0 20px;line-height:1.5;">Ol\u00e1 ${safe.clienteNome},</p>
        <p style="font-size:16px;color:#e8e4df;margin:0 0 20px;line-height:1.5;">Passando para lembrar que voc\u00ea tem um hor\u00e1rio marcado conosco:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="${cardStyle}width:100%;">
          <tr><td style="${rowStyle}"><span style="${labelStyle}">Servi\u00e7o</span><span style="${valueStyle}">${safe.servicoNome}</span></td></tr>
          <tr><td style="${rowStyle}"><span style="${labelStyle}">Profissional</span><span style="${valueStyle}">${safe.profissionalNome}</span></td></tr>
          <tr><td style="${rowStyle}"><span style="${labelStyle}">Data</span><span style="${valueStyle}">${safe.data}</span></td></tr>
          <tr><td style="display:flex;justify-content:space-between;padding:8px 0;"><span style="${labelStyle}">Hor\u00e1rio</span><span style="${valueStyle}">${safe.horario}</span></td></tr>
        </table>
        <p style="font-size:14px;color:#9a8f80;margin:0;line-height:1.5;">Chegue no hor\u00e1rio para aproveitar ao m\u00e1ximo seu atendimento.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #2a2c2e;"></td>
    </tr>
    <tr>
      <td style="padding:24px 40px 32px;text-align:center;">
        <p style="font-size:12px;color:#6b655c;margin:0 0 4px;line-height:1.6;">${safe.salaoNome}</p>
        <p style="font-size:12px;color:#6b655c;margin:0;line-height:1.6;">Esperamos por voc\u00ea!</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendWhatsApp(phone: string, message: string) {
  const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
  const token = Deno.env.get("ZAPI_TOKEN");
  if (!instanceId || !token) return;

  const cleanPhone = phone.replace(/\D/g, "");
  const url = `https://api.z-api.io/instances/${instanceId}/send-text`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Client-Token": token,
    },
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
    .select("id, salao_id, cliente_nome, cliente_whatsapp, cliente_email, inicio, servico_id, profissional_id")
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

    if (notifConfig.lembretes_email_ativos && agendamento.cliente_email) {
      const emailHtml = buildEmailHtml(
        agendamento.cliente_nome,
        (servico as unknown as { nome: string })?.nome || "Serviço",
        "",
        dataFormatada,
        horarioFormatado,
        (salao as unknown as { nome: string })?.nome || "Salão",
      );
      await sendEmailReminder(
        agendamento.cliente_email,
        "⏰ Lembrete do seu horário",
        emailHtml,
      );
    }

    sent++;

    await supabase
      .from("agendamentos")
      .update({ lembrete_enviado: true })
      .eq("id", agendamento.id);
  }

  return new Response(JSON.stringify({ sent }));
});
