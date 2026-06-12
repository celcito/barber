"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { servicoSchema } from "@/lib/schemas/servico";
import { getAuthUser } from "./auth";

export async function getServicos() {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("servicos")
    .select("*")
    .eq("salao_id", user.id)
    .order("nome");

  return data ?? [];
}

export async function createServico(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const parsed = servicoSchema.safeParse({
    nome: formData.get("nome"),
    duracao_min: formData.get("duracao_min"),
    preco: formData.get("preco"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("servicos").insert({
    salao_id: user.id,
    nome: parsed.data.nome,
    duracao_min: parsed.data.duracao_min,
    preco: parsed.data.preco,
  });

  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/dashboard/servicos");
  return { success: true };
}

export async function updateServico(id: string, formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const parsed = servicoSchema.safeParse({
    nome: formData.get("nome"),
    duracao_min: formData.get("duracao_min"),
    preco: formData.get("preco"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("servicos")
    .update({
      nome: parsed.data.nome,
      duracao_min: parsed.data.duracao_min,
      preco: parsed.data.preco,
    })
    .eq("id", id)
    .eq("salao_id", user.id);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/dashboard/servicos");
  return { success: true };
}

export async function deleteServico(id: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("servicos")
    .delete()
    .eq("id", id)
    .eq("salao_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/servicos");
  return { success: true };
}
