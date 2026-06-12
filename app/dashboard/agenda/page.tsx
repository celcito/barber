"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlideOver } from "@/components/ui/slide-over";
import { EmptyState } from "@/components/ui/empty-state";
import { AgendamentoDetalhes } from "@/components/features/agendamento-detalhes";
import { getAgendamentosSemana, getProfissionais } from "@/lib/actions/agendamentos-semana";

interface Agendamento {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  inicio: string;
  fim: string;
  status: "confirmado" | "pendente" | "cancelado";
  profissional_id: string | null;
  servicos: { nome: string; preco: number; duracao_min: number } | null;
  profissionais: { nome: string } | null;
}

interface Profissional {
  id: string;
  nome: string;
}

function getWeekDates(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return { start, dates };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

export default function AgendaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay());
    return start;
  });
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);

  const profissionalFiltro = searchParams.get("profissional") || "";

  const weekDates = getWeekDates(currentDate);
  const weekStart = weekDates.start;

  async function loadData() {
    setLoading(true);
    const [agData, profData] = await Promise.all([
      getAgendamentosSemana(weekStart.toISOString(), profissionalFiltro || undefined),
      getProfissionais(),
    ]);
    setAgendamentos(agData as Agendamento[]);
    setProfissionais(profData as Profissional[]);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart.getTime(), profissionalFiltro]);

  function prevWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  }

  function nextWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  }

  function handleFilterChange(profId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (profId) {
      params.set("profissional", profId);
    } else {
      params.delete("profissional");
    }
    router.push(`/dashboard/agenda?${params.toString()}`);
  }

  const handleSelectAgendamento = useCallback((ag: Agendamento) => {
    setSelectedAgendamento(ag);
    setSlideOpen(true);
  }, []);

  const weekLabel = weekDates.dates[0].toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
    + " - "
    + weekDates.dates[6].toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });

  const horas = Array.from({ length: 12 }, (_, i) => `${String(i + 7).padStart(2, "0")}:00`);

  return (
    <div className="p-margin-desktop pt-24 lg:pt-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <header className="flex items-center justify-between mb-stack-lg">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface">Schedule</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Visão semanal dos agendamentos</p>
          </div>
          <div className="flex items-center gap-stack-sm">
            <div className="flex items-center gap-2 bg-surface-container border border-outline-variant rounded px-4 py-2">
              <button onClick={prevWeek} className="p-1 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="font-label-md text-label-md text-on-surface min-w-[180px] text-center font-medium">
                {weekLabel}
              </span>
              <button onClick={nextWeek} className="p-1 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex gap-2 mb-stack-md overflow-x-auto pb-2">
          <button
            onClick={() => handleFilterChange("")}
            className={`px-4 py-2 rounded-full font-label-sm text-label-sm transition-all duration-300 whitespace-nowrap ${
              !profissionalFiltro
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            Todos
          </button>
          {profissionais.map((p) => (
            <button
              key={p.id}
              onClick={() => handleFilterChange(p.id)}
              className={`px-4 py-2 rounded-full font-label-sm text-label-sm transition-all duration-300 whitespace-nowrap ${
                profissionalFiltro === p.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {p.nome}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-surface-container border border-outline-variant rounded p-stack-md">
                <div className="h-6 w-full bg-surface-container-highest rounded animate-shimmer" />
              </div>
            ))}
          </div>
        ) : agendamentos.length === 0 ? (
          <EmptyState
            icon={<span className="material-symbols-outlined text-[64px]">calendar_month</span>}
            title="Nenhum agendamento nesta semana"
            description="Não há agendamentos para o período selecionado."
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-2 min-w-[800px]">
              <div className="col-span-1" />
              {weekDates.dates.map((date, i) => {
                const today = isSameDay(date, new Date());
                return (
                  <div key={i} className="text-center">
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      {date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                    </p>
                    <p className={`font-headline-sm text-headline-sm mt-1 ${today ? "text-primary" : "text-on-surface"}`}>
                      {date.getDate()}
                    </p>
                  </div>
                );
              })}

              {horas.map((hora) => (
                <div key={hora} className="contents">
                  <div className="col-span-1 text-right pr-3 py-4">
                    <span className="font-label-sm text-label-sm text-on-surface-variant tabular-nums">{hora}</span>
                  </div>
                  {weekDates.dates.map((date, di) => {
                    const ags = agendamentos.filter((ag) => {
                      const agDate = new Date(ag.inicio);
                      const agHour = agDate.getHours();
                      const hourNum = parseInt(hora.split(":")[0]);
                      return isSameDay(agDate, date) && agHour === hourNum;
                    });
                    return (
                      <div key={di} className="col-span-1 min-h-[60px] py-1">
                        {ags.map((ag) => (
                          <button
                            key={ag.id}
                            onClick={() => handleSelectAgendamento(ag)}
                            className="w-full text-left p-2 rounded mb-1 transition-all duration-300 hover:scale-[1.02]"
                            style={{
                              backgroundColor:
                                ag.status === "cancelado" ? "rgba(255, 180, 171, 0.2)" :
                                ag.status === "pendente" ? "rgba(233, 193, 118, 0.2)" :
                                "rgba(233, 193, 118, 0.3)",
                              borderLeft: `3px solid ${
                                ag.status === "cancelado" ? "#ffb4ab" :
                                ag.status === "pendente" ? "#e9c176" :
                                "#e9c176"
                              }`,
                            }}
                          >
                            <p className="font-label-sm text-label-sm text-on-surface font-medium truncate">
                              {formatTime(ag.inicio)} - {ag.cliente_nome}
                            </p>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SlideOver
        open={slideOpen}
        onClose={() => { setSlideOpen(false); setSelectedAgendamento(null); loadData(); }}
        title="Detalhes do Agendamento"
      >
        {selectedAgendamento && (
          <AgendamentoDetalhes
            agendamento={selectedAgendamento}
            onClose={() => { setSlideOpen(false); setSelectedAgendamento(null); loadData(); }}
          />
        )}
      </SlideOver>
    </div>
  );
}
