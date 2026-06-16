"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface StepDateProps {
  selectedDate: string | null;
  onSelect: (data: string) => void;
}

const DIAS_SEMANA_ABREV = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: { day: number; disabled: boolean; dateStr: string; isCurrentMonth: boolean }[] = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, disabled: true, dateStr: "", isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    const isPast = date < today;
    days.push({ day: d, disabled: isPast, dateStr, isCurrentMonth: true });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
     days.push({ day: i, disabled: true, dateStr: "", isCurrentMonth: false });
  }

  return days;
}

export function StepDate({ selectedDate, onSelect }: StepDateProps) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

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

  return (
    <div className="bg-surface-container p-stack-md rounded-lg border border-outline-variant h-full flex flex-col">
      <div className="flex items-center gap-base mb-stack-md">
        <span className="material-symbols-outlined text-primary">calendar_month</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">3. Escolha a Data</h2>
      </div>

      <div className="mb-stack-md flex-1">
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
                <div key={i} className="min-h-[44px] flex items-center justify-center text-on-surface-variant/30 font-label-sm text-label-sm">
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
                  if (!day.disabled) onSelect(day.dateStr);
                }}
                className={cn(
                  "min-h-[44px] flex items-center justify-center font-label-sm text-label-sm rounded transition-all w-full",
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
    </div>
  );
}
