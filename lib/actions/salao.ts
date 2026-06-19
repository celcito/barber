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

  const rawData = {
    nome: formData.get("nome"),
    slug: formData.get("slug"),
    whatsapp: formData.get("whatsapp") || "",
  };
  console.log("[updateSalao] rawData:", rawData);

  const parsed = salaoSchema.safeParse(rawData);

  if (!parsed.success) {
    console.log("[updateSalao] validation error:", parsed.error.flatten());
    return { error: parsed.error.flatten().fieldErrors };
  }

  console.log("[updateSalao] parsed OK:", parsed.data);

  const horarios: Record<string, { aberto: boolean; inicio: string; fim: string }> = {};
  for (const dia of DIAS_SEMANA) {
    horarios[dia] = {
      aberto: formData.has(`horario_${dia}_aberto`),
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
      lembretes_ativos: formData.has("lembretes_ativos"),
      lembretes_email_ativos: formData.has("lembretes_email_ativos"),
      intervalo_lembrete: parseInt(formData.get("intervalo_lembrete") as string) || 120,
      template: (formData.get("template") as string) || "Olá {{nome}}, lembrete do seu horário hoje às {{horario}} para {{servico}} no {{salao}}.",
      notificar_dono: formData.has("notificar_dono"),
    },
  };

  const { data, error } = await supabase
    .from("saloes")
    .update({
      nome: parsed.data.nome,
      slug: parsed.data.slug,
      whatsapp: parsed.data.whatsapp || null,
      endereco: endereco,
      config: configFinal,
    })
    .eq("id", user.id)
    .select();

  if (error) {
    console.log("[updateSalao] supabase error:", error.message);
    return { error: { _form: [error.message] } };
  }

  if (!data || data.length === 0) {
    console.log("[updateSalao] no rows affected - user.id mismatch:", user.id);
    return { error: { _form: ["Salão não encontrado para este usuário"] } };
  }

  console.log("[updateSalao] save OK, slug:", parsed.data.slug);
  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/" + parsed.data.slug);
  return { success: true };
}
