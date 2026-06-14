type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

function formatLog(level: LogLevel, category: string, message: string, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
  };
  return JSON.stringify(entry);
}

export const logger = {
  info(category: string, message: string, context?: LogContext) {
    console.log(formatLog("info", category, message, context));
  },

  warn(category: string, message: string, context?: LogContext) {
    console.warn(formatLog("warn", category, message, context));
  },

  error(category: string, message: string, context?: LogContext) {
    console.error(formatLog("error", category, message, context));
  },

  debug(category: string, message: string, context?: LogContext) {
    if (process.env.NODE_ENV === "development" || process.env.LOG_DEBUG === "true") {
      console.log(formatLog("debug", category, message, context));
    }
  },
};

export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error("env", "Missing required environment variables", {
      missing,
    });
    return false;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url && !url.startsWith("http")) {
    logger.error("env", "NEXT_PUBLIC_SUPABASE_URL appears invalid", {
      value: url.substring(0, 30) + "...",
    });
    return false;
  }

  const envStatus = {
    supabaseUrl: url?.substring(0, 30) + "...",
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    whatsappConfigured: !!(process.env.ZAPI_INSTANCE_ID && process.env.ZAPI_TOKEN),
    whatsappDisabled: process.env.WHATSAPP_DISABLED === "true",
    emailConfigured: !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM),
    emailDisabled: process.env.EMAIL_DISABLED === "true",
  };

  logger.info("env", "Environment variables validated", envStatus);

  if (!envStatus.whatsappConfigured && !envStatus.whatsappDisabled) {
    logger.warn("env", "WhatsApp not configured - appointments will work but no WhatsApp notifications", {
      hint: "Set ZAPI_INSTANCE_ID and ZAPI_TOKEN, or set WHATSAPP_DISABLED=true to suppress this warning",
    });
  }

  if (!envStatus.emailConfigured && !envStatus.emailDisabled) {
    logger.warn("env", "Email not configured - appointments will work but no email notifications", {
      hint: "Set RESEND_API_KEY and RESEND_FROM, or set EMAIL_DISABLED=true to suppress this warning",
    });
  }

  return true;
}

type AuditAction =
  | "agendamento.criado"
  | "agendamento.cancelado"
  | "horario_excessao.criado"
  | "horario_excessao.deletado"
  | "upload.avatar"
  | "auth.login"
  | "auth.logout"
  | "auth.signup";

export type { AuditAction };

export function auditLog(action: AuditAction, metadata?: Record<string, unknown>) {
  logger.info("audit", action, metadata);
}
