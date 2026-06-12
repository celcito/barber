"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getServicosPublic } from "@/lib/actions/public";
import { cn } from "@/lib/utils";

interface Servico {
  id: string;
  nome: string;
  duracao_min: number;
  preco: number;
}

interface StepServiceProps {
  salaoId: string;
  selected: Servico | null;
  onSelect: (servico: Servico) => void;
}

export function StepService({ salaoId, selected, onSelect }: StepServiceProps) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServicosPublic(salaoId).then((data) => {
      setServicos(data as Servico[]);
      setLoading(false);
    });
  }, [salaoId]);

  if (loading) {
    return (
      <div className="bg-surface-container p-stack-md rounded-lg border border-outline-variant h-full flex flex-col">
        <div className="flex items-center gap-base mb-stack-md">
          <span className="material-symbols-outlined text-primary">content_cut</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">1. Escolha o Serviço</h2>
        </div>
        <div className="space-y-stack-sm">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (servicos.length === 0) {
    return (
      <div className="bg-surface-container p-stack-md rounded-lg border border-outline-variant h-full flex flex-col">
        <div className="flex items-center gap-base mb-stack-md">
          <span className="material-symbols-outlined text-primary">content_cut</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">1. Escolha o Serviço</h2>
        </div>
        <div className="text-center py-stack-lg">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">content_cut</span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Nenhum serviço disponível no momento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container p-stack-md rounded-lg border border-outline-variant h-full flex flex-col">
      <div className="flex items-center gap-base mb-stack-md">
        <span className="material-symbols-outlined text-primary">content_cut</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">1. Escolha o Serviço</h2>
      </div>
      <div className="space-y-stack-sm">
        {servicos.map((servico) => {
          const isSelected = selected?.id === servico.id;
          return (
            <button
              key={servico.id}
              onClick={() => onSelect(servico)}
              className={cn(
                "group w-full cursor-pointer p-4 transition-all flex items-center justify-between rounded",
                isSelected
                  ? "bg-surface-container-high border border-primary/20"
                  : "hover:bg-surface-container-highest border border-transparent hover:border-outline-variant"
              )}
            >
              <div className="flex-1">
                <div className="flex items-baseline w-full">
                  <span className={cn(
                    "font-label-md text-label-md",
                    isSelected ? "text-primary" : "text-on-surface"
                  )}>
                    {servico.nome}
                  </span>
                  <span className="dotted-leader" />
                  <span className="font-label-md text-label-md text-primary">
                    {servico.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 text-left">
                  {servico.duracao_min} min
                </p>
              </div>
              <div className="ml-4">
                {isSelected ? (
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
