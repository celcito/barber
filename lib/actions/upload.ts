"use server";

import { redirect } from "next/navigation";
import { getAuthUser } from "./auth";

const BUCKET = "avatars";
const MAX_SIZE_MB = 5;

export async function uploadAvatar(formData: FormData): Promise<{ url: string } | { error: string }> {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Nenhum arquivo enviado." };
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return { error: `O arquivo deve ter no máximo ${MAX_SIZE_MB}MB.` };
  if (!file.type.startsWith("image/")) return { error: "Envie apenas imagens (JPG, PNG, WebP)." };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
