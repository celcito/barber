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

export interface ProfissionalHorario {
  dia_semana: string;
  aberto: boolean;
  inicio: string;
  fim: string;
}

export async function getProfissionalHorarios(profissionalId: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profissional_horarios")
    .select("dia_semana, aberto, inicio, fim")
    .eq("profissional_id", profissionalId);

  return (data ?? []) as ProfissionalHorario[];
}

export async function updateProfissionalHorarios(
  profissionalId: string,
  horarios: ProfissionalHorario[]
) {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const { data: prof } = await supabase
    .from("profissionais")
    .select("salao_id")
    .eq("id", profissionalId)
    .single();

  if (!prof || prof.salao_id !== user.id) {
    return { error: "Profissional não encontrado" };
  }

  const { error: deleteError } = await supabase
    .from("profissional_horarios")
    .delete()
    .eq("profissional_id", profissionalId);

  if (deleteError) return { error: deleteError.message };

  if (horarios.length > 0) {
    const { error: insertError } = await supabase
      .from("profissional_horarios")
      .insert(
        horarios.map((h) => ({
          profissional_id: profissionalId,
          dia_semana: h.dia_semana,
          aberto: h.aberto,
          inicio: h.inicio,
          fim: h.fim,
        }))
      );

    if (insertError) return { error: insertError.message };
  }

  revalidatePath("/dashboard/profissionais");
  return { success: true };
}

export interface ProfissionalComHorarios {
  id: string;
  nome: string;
  ativo: boolean;
  foto_url?: string | null;
  usar_horarios_salao: boolean;
  horarios: ProfissionalHorario[];
}

export async function getAllProfissionaisComHorarios() {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const { data: profissionais } = await supabase
    .from("profissionais")
    .select("id, nome, ativo, foto_url")
    .eq("salao_id", user.id)
    .order("nome");

  if (!profissionais) return [];

  const { data: todosHorarios } = await supabase
    .from("profissional_horarios")
    .select("profissional_id, dia_semana, aberto, inicio, fim");

  const horariosMap = new Map<string, ProfissionalHorario[]>();
  for (const h of todosHorarios ?? []) {
    const list = horariosMap.get(h.profissional_id) ?? [];
    list.push({
      dia_semana: h.dia_semana,
      aberto: h.aberto,
      inicio: h.inicio,
      fim: h.fim,
    });
    horariosMap.set(h.profissional_id, list);
  }

  return profissionais.map((p) => ({
    id: p.id,
    nome: p.nome,
    ativo: p.ativo,
    foto_url: p.foto_url,
    usar_horarios_salao: !horariosMap.has(p.id),
    horarios: horariosMap.get(p.id) ?? [],
  })) as ProfissionalComHorarios[];
}

export async function getSalaoHorariosConfig() {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const { data: salao } = await supabase
    .from("saloes")
    .select("config")
    .eq("id", user.id)
    .single();

  const config = (salao?.config ?? {}) as Record<string, unknown>;
  return (config.horarios ?? {}) as Record<
    string,
    { aberto: boolean; inicio: string; fim: string }
  >;
}
