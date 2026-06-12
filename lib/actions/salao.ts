"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { salaoSchema, DIAS_SEMANA } from "@/lib/schemas/salao";
import { getAuthUser } from "./auth";

export async function getSalao() {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("saloes")
    .select("id, nome, slug, whatsapp, endereco, config")
    .eq("id", user.id)
    .single();

  return data as {
    id: string;
    nome: string;
    slug: string;
    whatsapp: string | null;
    endereco: Record<string, string> | null;
    config: Record<string, unknown>;
  } | null;
}

export async function updateSalao(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const parsed = salaoSchema.safeParse({
    nome: formData.get("nome"),
    slug: formData.get("slug"),
    whatsapp: formData.get("whatsapp"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const horarios: Record<string, { aberto: boolean; inicio: string; fim: string }> = {};
  for (const dia of DIAS_SEMANA) {
    horarios[dia] = {
      aberto: formData.get(`horario_${dia}_aberto`) === "true",
      inicio: (formData.get(`horario_${dia}_inicio`) as string) || "08:00",
      fim: (formData.get(`horario_${dia}_fim`) as string) || "19:00",
    };
  }

  const intervalo = parseInt(formData.get("intervalo") as string) || 30;

  const { data: salaoAtual } = await supabase
    .from("saloes")
    .select("config")
    .eq("id", user.id)
    .single();

  const configAtual = (salaoAtual?.config ?? {}) as Record<string, unknown>;

  const endereco = {
    logradouro: (formData.get("endereco_logradouro") as string) || "",
    numero: (formData.get("endereco_numero") as string) || "",
    complemento: (formData.get("endereco_complemento") as string) || "",
    bairro: (formData.get("endereco_bairro") as string) || "",
    cidade: (formData.get("endereco_cidade") as string) || "",
    estado: (formData.get("endereco_estado") as string) || "",
    cep: (formData.get("endereco_cep") as string) || "",
  };

  const redes_sociais = {
    instagram: (formData.get("rede_instagram") as string) || "",
    facebook: (formData.get("rede_facebook") as string) || "",
    tiktok: (formData.get("rede_tiktok") as string) || "",
    website: (formData.get("rede_website") as string) || "",
  };

  const configFinal = {
    ...configAtual,
    horarios,
    intervalo,
    redes_sociais,
    notificacoes: {
      lembretes_ativos: formData.get("lembretes_ativos") === "true",
      lembretes_email_ativos: formData.get("lembretes_email_ativos") === "true",
      intervalo_lembrete: parseInt(formData.get("intervalo_lembrete") as string) || 120,
      template: (formData.get("template") as string) || "Olá {{nome}}, lembrete do seu horário hoje às {{horario}} para {{servico}} no {{salao}}.",
      notificar_dono: formData.get("notificar_dono") === "true",
    },
  };

  const { error } = await supabase
    .from("saloes")
    .update({
      nome: parsed.data.nome,
      slug: parsed.data.slug,
      whatsapp: parsed.data.whatsapp || null,
      endereco: endereco,
      config: configFinal,
    })
    .eq("id", user.id);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}
