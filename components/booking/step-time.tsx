"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getHorariosDisponiveis, type SlotDisponivel } from "@/lib/actions/public";
import { cn } from "@/lib/utils";

interface StepTimeProps {
  salaoId: string;
  servicoId: string;
  profissionalId: string | null;
  selectedDate: string;
  selectedTime: string | null;
  onSelect: (slot: SlotDisponivel) => void;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatMonthShort(dateStr: string) {
  const parts = dateStr.split("-");
  const monthIdx = parseInt(parts[1], 10) - 1;
  const shortMonth = MESES[monthIdx].substring(0, 3);
  return `${shortMonth} ${parts[2]}`;
}

export function StepTime({
  salaoId,
  servicoId,
  profissionalId,
  selectedDate,
  selectedTime,
  onSelect,
}: StepTimeProps) {
  const [slots, setSlots] = useState<SlotDisponivel[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    setLoadingSlots(true);
    getHorariosDisponiveis(salaoId, profissionalId, servicoId, selectedDate).then(
      (slots) => {
        setSlots(slots);
        setLoadingSlots(false);
      }
    );
  }, [salaoId, profissionalId, servicoId, selectedDate]);

  return (
    <div className="bg-surface-container p-stack-md rounded-lg border border-outline-variant h-full flex flex-col">
      <div className="flex items-center gap-base mb-stack-md">
        <span className="material-symbols-outlined text-primary">schedule</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">4. Escolha o Horário</h2>
      </div>

      <div className="flex-1">
        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-3">
          Horários disponíveis para {formatMonthShort(selectedDate)}
        </p>

        {loadingSlots ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-10 rounded" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant text-center py-6 border border-outline-variant rounded border-dashed">
            Nenhum horário disponível para esta data.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const isSelected = selectedTime === slot.horario;
              return (
                <button
                  key={slot.horario}
                  onClick={() => onSelect(slot)}
                  className={cn(
                    "py-2 rounded font-label-sm text-label-sm transition-all flex flex-col items-center cursor-pointer",
                    isSelected
                      ? "border border-primary bg-primary/10 text-primary"
                      : "border border-outline-variant hover:border-primary hover:text-primary text-on-surface"
                  )}
                >
                  <span>{slot.horario}</span>
                  {slot.profissionalNome && (
                    <span className="text-[10px] opacity-70 mt-0.5">
                      {slot.profissionalNome}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
