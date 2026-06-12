"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarPickerProps {
  /** URL atual da foto (do banco de dados) */
  currentUrl?: string | null;
  /** Nome do input hidden que vai receber a URL final */
  name?: string;
  /** Callback chamado quando o upload termina com a URL pública */
  onUploaded?: (url: string) => void;
}

export function AvatarPicker({ currentUrl, name = "foto_url", onUploaded }: AvatarPickerProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalUrl, setFinalUrl] = useState<string>(currentUrl ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview local imediato
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError(null);
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload-avatar", { method: "POST", body: fd });
      const json = await res.json();

      if (json.error) {
        setError(json.error);
        setPreview(currentUrl ?? null);
        setFinalUrl(currentUrl ?? "");
      } else {
        setFinalUrl(json.url);
        onUploaded?.(json.url);
      }
    } catch {
      setError("Erro ao enviar a imagem. Tente novamente.");
      setPreview(currentUrl ?? null);
      setFinalUrl(currentUrl ?? "");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* hidden input que vai junto no FormData do form pai */}
      <input type="hidden" name={name} value={finalUrl} />

      {/* Área clicável */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative w-28 h-28 rounded-full border-2 overflow-hidden transition-all",
          "bg-surface-container-highest flex items-center justify-center",
          uploading
            ? "border-primary/40 cursor-wait"
            : "border-outline-variant hover:border-primary cursor-pointer group"
        )}
        aria-label="Selecionar foto de perfil"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Foto de perfil"
            fill
            className="object-cover"
            unoptimized={preview.startsWith("blob:")}
          />
        ) : (
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">person</span>
        )}

        {/* overlay de hover */}
        {!uploading && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[28px]">photo_camera</span>
          </div>
        )}

        {/* overlay de loading */}
        {uploading && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[28px] animate-spin">progress_activity</span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
        {uploading ? "Enviando..." : "Clique para alterar a foto"}
      </p>

      {error && (
        <p className="font-label-sm text-label-sm text-error flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
