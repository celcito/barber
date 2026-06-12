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
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;

  if (!instanceId || !token) {
    console.warn("[Z-API] Instance ID or token not configured");
    return { success: false, error: "Z-API não configurado" };
  }

  if (retryCount >= MAX_RETRIES) {
    console.error("[Z-API] Max retries reached");
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
      await new Promise((r) => setTimeout(r, 2000));
      return sendWhatsApp(phone, message, retryCount + 1);
    }

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as ZApiResponse;
      return { success: false, error: data.error || `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error("[Z-API] Error:", err);
    return { success: false, error: "Erro de conexão com Z-API" };
  }
}
