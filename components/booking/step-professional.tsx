"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfissionaisPublic } from "@/lib/actions/public";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Profissional {
  id: string;
  nome: string;
  foto_url?: string | null;
}

interface StepProfessionalProps {
  salaoId: string;
  selected: Profissional | null;
  onSelect: (profissional: Profissional) => void;
  onSkip: () => void;
}

export function StepProfessional({
  salaoId,
  selected,
  onSelect,
  onSkip,
}: StepProfessionalProps) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfissionaisPublic(salaoId).then((data) => {
      setProfissionais(data as Profissional[]);
      setLoading(false);
    });
  }, [salaoId]);

  if (loading) {
    return (
      <div className="bg-surface-container p-stack-md rounded-lg border border-outline-variant h-full flex flex-col">
        <div className="flex items-center gap-base mb-stack-md">
          <span className="material-symbols-outlined text-primary">group</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">2. Escolha o Barbeiro</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-stack-md">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (profissionais.length === 0) {
    return (
      <div className="bg-surface-container p-stack-md rounded-lg border border-outline-variant h-full flex flex-col">
        <div className="flex items-center gap-base mb-stack-md">
          <span className="material-symbols-outlined text-primary">group</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">2. Escolha o Barbeiro</h2>
        </div>
        <div className="text-center py-stack-lg">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">group</span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Nenhum profissional disponível
          </p>
        </div>
      </div>
    );
  }

  // "Sem preferência" é tratado como selected === null quando já há profissionais
  const noPreferenceSelected = selected === null;

  return (
    <div className="bg-surface-container p-stack-md rounded-lg border border-outline-variant h-full flex flex-col">
      <div className="flex items-center gap-base mb-stack-md">
        <span className="material-symbols-outlined text-primary">group</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">2. Escolha o Barbeiro</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-stack-md">
        {/* Sem preferência */}
        <button
          onClick={onSkip}
          className="text-center group cursor-pointer"
        >
          <div className="relative mb-base mx-auto w-24 h-24">
            <div className={cn(
              "w-full h-full rounded-full border-2 transition-all p-1 flex items-center justify-center bg-surface-container-highest",
              noPreferenceSelected ? "border-primary" : "border-transparent group-hover:border-primary"
            )}>
              <span className="material-symbols-outlined text-primary text-[32px]">auto_awesome</span>
            </div>
            {noPreferenceSelected && (
              <div className="absolute bottom-0 right-0 bg-primary w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface shadow-xs">
                <span className="material-symbols-outlined text-surface text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
            )}
          </div>
          <p className={cn(
            "font-label-md text-label-md",
            noPreferenceSelected ? "text-primary" : "text-on-surface"
          )}>Sem preferência</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Qualquer disponível</p>
        </button>

        {/* Profissionais */}
        {profissionais.map((prof) => {
          const isSelected = selected?.id === prof.id;
          const iniciais = prof.nome
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <button
              key={prof.id}
              onClick={() => onSelect(prof)}
              className={cn(
                "text-center group cursor-pointer transition-all",
                !isSelected && "grayscale hover:grayscale-0"
              )}
            >
              <div className="relative mb-base mx-auto w-24 h-24">
                {prof.foto_url ? (
                  <Image
                    src={prof.foto_url}
                    alt={prof.nome}
                    fill
                    className={cn(
                      "object-cover rounded-full border-2 transition-all p-1",
                      isSelected ? "border-primary" : "border-transparent group-hover:border-primary"
                    )}
                  />
                ) : (
                  <div className={cn(
                    "w-full h-full rounded-full border-2 transition-all p-1 flex items-center justify-center bg-surface-container-highest",
                    isSelected ? "border-primary" : "border-transparent group-hover:border-primary"
                  )}>
                    <span className="font-headline-sm text-headline-sm text-primary/60">{iniciais}</span>
                  </div>
                )}
                {isSelected && (
                  <div className="absolute bottom-0 right-0 bg-primary w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface shadow-xs">
                    <span className="material-symbols-outlined text-surface text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                )}
              </div>
              <p className={cn(
                "font-label-md text-label-md",
                isSelected ? "text-primary" : "text-on-surface"
              )}>{prof.nome}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Profissional</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
