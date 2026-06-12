"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { profissionalSchema } from "@/lib/schemas/profissional";
import { getAuthUser } from "./auth";

export async function getProfissionais() {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profissionais")
    .select("id, nome, ativo, foto_url")
    .eq("salao_id", user.id)
    .order("nome");

  return data ?? [];
}

export async function createProfissional(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const parsed = profissionalSchema.safeParse({
    nome: formData.get("nome"),
    ativo: formData.get("ativo") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("profissionais").insert({
    salao_id: user.id,
    nome: parsed.data.nome,
    ativo: parsed.data.ativo,
    foto_url: (formData.get("foto_url") as string) || null,
  });

  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/dashboard/profissionais");
  return { success: true };
}

export async function updateProfissional(id: string, formData: FormData) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const parsed = profissionalSchema.safeParse({
    nome: formData.get("nome"),
    ativo: formData.get("ativo") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("profissionais")
    .update({
      nome: parsed.data.nome,
      ativo: parsed.data.ativo,
      foto_url: (formData.get("foto_url") as string) || null,
    })
    .eq("id", id)
    .eq("salao_id", user.id);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath("/dashboard/profissionais");
  return { success: true };
}

export async function deleteProfissional(id: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profissionais")
    .delete()
    .eq("id", id)
    .eq("salao_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/profissionais");
  return { success: true };
}
