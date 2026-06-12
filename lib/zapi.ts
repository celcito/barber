const ZAPI_BASE = "https://api.z-api.io/instances";

interface ZApiResponse {
  success?: boolean;
  error?: string;
  zaapId?: string;
}

export async function sendWhatsApp(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;

  if (!instanceId || !token) {
    console.warn("[Z-API] Instance ID or token not configured");
    return { success: false, error: "Z-API não configurado" };
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = `55${cleanPhone}`;

  const url = `${ZAPI_BASE}/${instanceId}/token/${token}/send-text`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: fullPhone,
        message,
      }),
    });

    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 2000));
      return sendWhatsApp(phone, message);
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
