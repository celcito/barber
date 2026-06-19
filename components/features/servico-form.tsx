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
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded bg-error/10 border border-error/30">
          <p className="font-label-md text-label-md text-error flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            Corrija os erros antes de salvar.
          </p>
          <ul className="mt-2 space-y-1">
            {Object.entries(errors).map(([field, msgs]) => (
              <li key={field} className="font-body-sm text-body-sm text-error/80">
                {field === "_form" ? msgs[0] : `${field}: ${msgs[0]}`}
              </li>
            ))}
          </ul>
        </div>
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
