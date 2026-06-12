"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { createProfissional, updateProfissional } from "@/lib/actions/profissionais";

interface ProfissionalFormProps {
  onClose: () => void;
  initialData?: {
    id: string;
    nome: string;
    ativo: boolean;
    foto_url?: string | null;
  };
}

export function ProfissionalForm({ onClose, initialData }: ProfissionalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = initialData
      ? await updateProfissional(initialData.id, formData)
      : await createProfissional(formData);

    if (result?.error) {
      setErrors(result.error as Record<string, string[]>);
      setLoading(false);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-stack-md">
      {/* Avatar */}
      <div className="flex justify-center py-2">
        <AvatarPicker
          name="foto_url"
          currentUrl={initialData?.foto_url}
        />
      </div>

      <Input
        id="nome"
        name="nome"
        label="Nome do Profissional"
        defaultValue={initialData?.nome}
        error={errors.nome?.[0]}
        required
      />

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="ativo"
          value="true"
          defaultChecked={initialData?.ativo ?? true}
          className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
        />
        <span className="font-body-md text-body-md text-on-surface">Profissional ativo</span>
      </label>

      {errors._form && (
        <p className="font-label-sm text-label-sm text-error">{errors._form[0]}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} icon={<span className="material-symbols-outlined text-[18px]">save</span>}>
          {initialData ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
