"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function addSalaoAdmin(email: string, role: "admin" | "owner" = "admin") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const isAdmin = await checkIsSalaoAdmin(supabase, user.id, user.id);
  if (!isAdmin) {
    return { error: "Sem permissão para adicionar admins" };
  }

  const { data: newUser, error: userError } = await supabase
    .from("auth.users")
    .select("id, email")
    .eq("email", email)
    .single();

  if (userError || !newUser) {
    return { error: "Usuário não encontrado com este email" };
  }

  const { data, error } = await supabase
    .from("salao_admins")
    .insert({
      salao_id: user.id,
      user_id: newUser.id,
      role,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Este usuário já é admin deste salão" };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard/configuracoes");
  return { success: true, data };
}

export async function removeSalaoAdmin(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const isAdmin = await checkIsSalaoAdmin(supabase, user.id, user.id);
  if (!isAdmin) {
    return { error: "Sem permissão para remover admins" };
  }

  if (userId === user.id) {
    return { error: "Você não pode remover a si mesmo" };
  }

  const { error } = await supabase
    .from("salao_admins")
    .delete()
    .eq("salao_id", user.id)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}

export async function listSalaoAdmins() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { data, error } = await supabase
    .from("salao_admins")
    .select(`
      id,
      role,
      criado_em,
      user:user_id (
        id,
        email
      )
    `)
    .eq("salao_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

async function checkIsSalaoAdmin(supabase: SupabaseClient, salaoId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("salao_admins")
    .select("id")
    .eq("salao_id", salaoId)
    .eq("user_id", userId)
    .single();
  return !!data;
}
