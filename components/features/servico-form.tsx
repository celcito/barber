"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createServico, updateServico } from "@/lib/actions/servicos";

interface ServicoFormProps {
  onClose: () => void;
  initialData?: {
    id: string;
    nome: string;
    duracao_min: number;
    preco: number;
  };
}

export function ServicoForm({ onClose, initialData }: ServicoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = initialData
      ? await updateServico(initialData.id, formData)
      : await createServico(formData);

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
      <Input
        id="nome"
        label="Nome do Serviço"
        defaultValue={initialData?.nome}
        error={errors.nome?.[0]}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="duracao_min"
          label="Duração (min)"
          type="number"
          min={5}
          max={480}
          defaultValue={initialData?.duracao_min}
          error={errors.duracao_min?.[0]}
          required
        />
        <Input
          id="preco"
          label="Preço (R$)"
          type="number"
          step="0.01"
          min={0}
          defaultValue={initialData?.preco}
          error={errors.preco?.[0]}
          required
        />
      </div>
      {errors._form && (
        <p className="font-label-sm text-label-sm text-error">{errors._form[0]}</p>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} icon={<span className="material-symbols-outlined text-[18px]">add</span>}>
          {initialData ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
