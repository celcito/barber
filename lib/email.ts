import { Resend } from "resend";
import { logger } from "./logger";

interface SendEmailParams {
  to: string;
  subject: string;
  react: React.ReactNode;
}

export async function sendEmail({ to, subject, react }: SendEmailParams) {
  if (process.env.EMAIL_DISABLED === "true") {
    logger.info("email", "Email sending is disabled via env var");
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    logger.warn("email", "Resend not configured - skipping send", {
      hasApiKey: !!apiKey,
      hasFrom: !!from,
      to,
      subject,
    });
    return;
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from,
    to,
    subject,
    react,
  });
}

interface EmailData {
  to: string;
  clienteNome: string;
  servicoNome: string;
  profissionalNome: string;
  data: string;
  horario: string;
  salaoNome: string;
}

export async function sendConfirmationEmail(data: EmailData) {
  const { ConfirmationEmail } = await import("./emails/confirmation");
  await sendEmail({
    to: data.to,
    subject: "✅ Agendamento Confirmado!",
    react: ConfirmationEmail(data),
  });
}

export async function sendReminderEmail(data: EmailData) {
  const { ReminderEmail } = await import("./emails/reminder");
  await sendEmail({
    to: data.to,
    subject: "⏰ Lembrete do seu horário",
    react: ReminderEmail(data),
  });
}

export async function sendCancellationEmail(data: EmailData) {
  const { CancellationEmail } = await import("./emails/cancellation");
  await sendEmail({
    to: data.to,
    subject: "❌ Agendamento Cancelado",
    react: CancellationEmail(data),
  });
}
