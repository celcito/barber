import { logger } from "./logger";

const ZAPI_BASE = "https://api.z-api.io/instances";

interface ZApiResponse {
  success?: boolean;
  error?: string;
  zaapId?: string;
}

const MAX_RETRIES = 3;

export async function sendWhatsApp(
  phone: string,
  message: string,
  retryCount = 0
): Promise<{ success: boolean; error?: string }> {
  if (process.env.WHATSAPP_DISABLED === "true") {
    logger.info("whatsapp", "WhatsApp sending is disabled via env var");
    return { success: false, error: "WhatsApp desabilitado" };
  }

  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;

  if (!instanceId || !token) {
    logger.warn("whatsapp", "Z-API not configured - skipping send", {
      hasInstanceId: !!instanceId,
      hasToken: !!token,
      phone,
    });
    return { success: false, error: "Z-API não configurado" };
  }

  if (retryCount >= MAX_RETRIES) {
    logger.error("whatsapp", "Max retries reached", { phone, retryCount });
    return { success: false, error: "Número máximo de tentativas excedido" };
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = `55${cleanPhone}`;

  const url = `${ZAPI_BASE}/${instanceId}/send-text`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": token,
      },
      body: JSON.stringify({
        phone: fullPhone,
        message,
      }),
    });

    if (res.status === 429) {
      logger.warn("whatsapp", "Rate limited, retrying", { phone, retryCount });
      await new Promise((r) => setTimeout(r, 2000));
      return sendWhatsApp(phone, message, retryCount + 1);
    }

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as ZApiResponse;
      logger.error("whatsapp", "Z-API returned error", {
        phone,
        status: res.status,
        error: data.error,
      });
      return { success: false, error: data.error || `HTTP ${res.status}` };
    }

    logger.info("whatsapp", "Message sent successfully", { phone });
    return { success: true };
  } catch (err) {
    logger.error("whatsapp", "Connection error with Z-API", {
      phone,
      error: err instanceof Error ? err.message : String(err),
    });
    return { success: false, error: "Erro de conexão com Z-API" };
  }
}
