"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function cancelarAgendamento(id: string) {
  const supabase = await createClient();
  const authResult = await supabase.auth.getUser();
  const userId = authResult.data?.user?.id;
  if (!userId) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("agendamentos")
    .update({ status: "cancelado" })
    .eq("id", id)
    .eq("salao_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  return { success: true };
}
