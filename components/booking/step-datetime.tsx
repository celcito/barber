"use client";

import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getHorariosDisponiveis, type SlotDisponivel } from "@/lib/actions/public";
import { cn } from "@/lib/utils";

interface StepDatetimeProps {
  salaoId: string;
  servicoId: string;
  profissionalId: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  onSelect: (data: string, horario: string) => void;
}

const DIAS_SEMANA_ABREV = ["S", "M", "T", "W", "T", "F", "S"];
const MESES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: { day: number; disabled: boolean; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Previous month days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, disabled: true, dateStr: "", isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    // Format YYYY-MM-DD correctly avoiding timezone shifts
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    const isPast = date < today;
    days.push({ day: d, disabled: isPast, dateStr, isCurrentMonth: true });
  }

  // Next month days to complete grid (42 cells total for 6 rows)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
     days.push({ day: i, disabled: true, dateStr: "", isCurrentMonth: false });
  }

  return days;
}

function formatMonthShort(dateStr: string) {
  const parts = dateStr.split("-");
  const monthIdx = parseInt(parts[1], 10) - 1;
  const shortMonth = MESES[monthIdx].substring(0, 3);
  return `${shortMonth} ${parts[2]}`;
}

export function StepDatetime({
  salaoId,
  servicoId,
  profissionalId,
  selectedDate,
  selectedTime,
  onSelect,
}: StepDatetimeProps) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [slots, setSlots] = useState<SlotDisponivel[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const calendarDays = useMemo(
    () => generateCalendarDays(year, month),
    [year, month]
  );

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  useEffect(() => {
    if (!selectedDate) return;
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
        <span className="material-symbols-outlined text-primary">calendar_month</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">3. Escolha Data e Hora</h2>
      </div>

      <div className="mb-stack-md">
        <div className="flex justify-between items-center mb-4">
          <p className="font-label-md text-label-md text-on-surface">
            {MESES[month]} {year}
          </p>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-1 hover:text-primary transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={nextMonth}
              className="p-1 hover:text-primary transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DIAS_SEMANA_ABREV.map((d, i) => (
            <span key={i} className="font-label-sm text-label-sm text-on-surface-variant">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (!day.isCurrentMonth) {
              return (
                <div key={i} className="h-10 flex items-center justify-center text-on-surface-variant/30 font-label-sm text-label-sm">
                  {day.day}
                </div>
              );
            }

            const isSelected = selectedDate === day.dateStr;
            return (
              <button
                key={i}
                disabled={day.disabled}
                onClick={() => {
                  if (!day.disabled) onSelect(day.dateStr, selectedTime ?? "");
                }}
                className={cn(
                  "h-10 flex items-center justify-center font-label-sm text-label-sm rounded transition-all",
                  isSelected
                    ? "bg-primary text-on-primary font-bold"
                    : day.disabled 
                      ? "text-on-surface-variant/30 cursor-not-allowed" 
                      : "text-on-surface hover:bg-surface-container-highest cursor-pointer"
                )}
              >
                {day.day}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-3">
            Available slots for {formatMonthShort(selectedDate)}
          </p>

          {loadingSlots ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 rounded" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant text-center py-6 border border-outline-variant rounded border-dashed">
              Nenhum horário disponível
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedTime === slot.horario;
                return (
                  <button
                    key={slot.horario}
                    onClick={() => onSelect(selectedDate, slot.horario)}
                    className={cn(
                      "py-2 rounded font-label-sm text-label-sm transition-all flex flex-col items-center cursor-pointer",
                      isSelected
                        ? "border border-primary bg-primary/10 text-primary"
                        : "border border-outline-variant hover:border-primary hover:text-primary text-on-surface"
                    )}
                  >
                    <span>{slot.horario}</span>
                    {slot.profissionalNome && (
                      <span className="text-[10px] opacity-70 mt-0.5">{slot.profissionalNome}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
