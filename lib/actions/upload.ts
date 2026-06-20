"use server";

import { redirect } from "next/navigation";
import { getAuthUser } from "./auth";

const BUCKET = "avatars";
const MAX_SIZE_MB = 5;

type DetectedFormat = "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "image/heif";

function detectFormat(buffer: ArrayBuffer): DetectedFormat | null {
  const b = new Uint8Array(buffer);
  if (b.length < 12) return null;

  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";

  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) return "image/png";

  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) return "image/webp";

  if (
    b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70
  ) {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]).toLowerCase();
    if (["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand)) return "image/heic";
    if (["heim", "heis", "hevm", "hevs", "avif", "avis"].includes(brand)) return "image/heif";
  }

  return null;
}

export async function uploadAvatar(formData: FormData): Promise<{ url: string } | { error: string }> {
  const { supabase, user } = await getAuthUser();
  if (!user) redirect("/login");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Nenhum arquivo enviado." };
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return { error: `O arquivo deve ter no máximo ${MAX_SIZE_MB}MB.` };
  if (!file.type.startsWith("image/")) return { error: "Envie apenas imagens (JPG, PNG, WebP)." }

  const buffer = await file.arrayBuffer();
  const format = detectFormat(buffer);

  if (format === "image/heic" || format === "image/heif") {
    return { error: "Formato HEIC/HEIF não suportado. No iPhone, vá em Ajustes → Câmera → Formatos e escolha 'Mais Compatível', ou converta a foto para JPG antes de enviar." };
  }

  if (format !== "image/jpeg" && format !== "image/png" && format !== "image/webp") {
    return { error: "Formato não suportado. Use JPG, PNG ou WebP." };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
