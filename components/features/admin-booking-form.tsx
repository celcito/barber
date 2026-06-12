"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Stepper, type Step } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createAgendamentoAdmin } from "@/lib/actions/agendamentos";
import type { SlotDisponivel } from "@/lib/actions/agendamentos";

interface Servico {
  id: string;
  nome: string;
  duracao_min: number;
  preco: number;
}

interface Profissional {
  id: string;
  nome: string;
}

interface AdminBookingFormProps {
  servicos: Servico[];
  profissionais: Profissional[];
}

const steps: Step[] = [
  { id: "servico", label: "Serviço" },
  { id: "profissional", label: "Profissional" },
  { id: "data", label: "Data" },
  { id: "horario", label: "Horário" },
  { id: "cliente", label: "Dados" },
];

function formatDateBR(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2)}`;
}

export function AdminBookingForm({ servicos, profissionais }: AdminBookingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(null);
  const [selectedData, setSelectedData] = useState<string>("");
  const [selectedHorario, setSelectedHorario] = useState<string>("");
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<SlotDisponivel | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<SlotDisponivel[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const today = new Date();
  const weekStart = getWeekStart(today);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    weekDates.push(iso);
  }

  const isToday = (dateStr: string) => dateStr === today.toISOString().slice(0, 10);
  const isPast = (dateStr: string) => dateStr < today.toISOString().slice(0, 10);

  function handleSelectServico(servico: Servico) {
    setSelectedServico(servico);
    setSelectedProfissional(null);
    setSelectedData("");
    setSelectedHorario("");
    setHorariosDisponiveis([]);
    setCurrentStep(1);
  }

  function handleSelectProfissional(prof: Profissional | null) {
    setSelectedProfissional(prof);
    setSelectedData("");
    setSelectedHorario("");
    setHorariosDisponiveis([]);
    setCurrentStep(2);
  }

  async function handleSelectData(dateStr: string) {
    if (isPast(dateStr)) return;
    setSelectedData(dateStr);
    setSelectedHorario("");
    setSelectedSlotInfo(null);
    setLoadingHorarios(true);

    try {
      const formData = new FormData();
      formData.append("profissional_id", selectedProfissional?.id || "");
      formData.append("servico_id", selectedServico!.id);
      formData.append("data", dateStr);

      const res = await fetch("/api/horarios", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setHorariosDisponiveis(data.slots || []);
      }
    } catch {
      setHorariosDisponiveis([]);
    } finally {
      setLoadingHorarios(false);
      setCurrentStep(3);
    }
  }

  function handleSelectHorario(slot: SlotDisponivel) {
    setSelectedHorario(slot.horario);
    setSelectedSlotInfo(slot);
    if (slot.profissionalId && !selectedProfissional) {
      setSelectedProfissional({
        id: slot.profissionalId,
        nome: slot.profissionalNome ?? "",
      });
    }
    setCurrentStep(4);
  }

  async function handleSubmit() {
    setErrors({});
    setFormError(null);

    if (!nome.trim()) {
      setErrors({ nome: ["Nome é obrigatório"] });
      return;
    }
    if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(whatsapp)) {
      setErrors({ whatsapp: ["WhatsApp inválido (use (99) 99999-9999)"] });
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: ["E-mail inválido"] });
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("nome", nome.trim());
    formData.append("whatsapp", whatsapp);
    formData.append("email", email);
    formData.append("servico_id", selectedServico!.id);
    const profId = selectedProfissional?.id || selectedSlotInfo?.profissionalId || "";
    formData.append("profissional_id", profId);
    formData.append("data", selectedData);
    formData.append("horario", selectedHorario);

    const result = await createAgendamentoAdmin(formData);

    if (result?.error) {
      const fieldErrors = result.error as Record<string, string[]>;
      if (fieldErrors._form) {
        setFormError(fieldErrors._form[0]);
      } else {
        setErrors(fieldErrors);
      }
      setSubmitting(false);
      return;
    }

    startTransition(() => {
      router.push("/dashboard/agenda");
      router.refresh();
    });
  }

  function formatWhatsApp(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  return (
    <div className="space-y-stack-lg">
      <Stepper steps={steps} currentStep={currentStep} />

      {/* Step 0: Serviço */}
      {currentStep === 0 && (
        <div className="space-y-stack-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Escolha o serviço</h2>
          <div className="space-y-3">
            {servicos.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectServico(s)}
                  className="w-full text-left cursor-pointer"
                >
                  <Card hover className="transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-label-lg text-label-lg text-on-surface">{s.nome}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        {s.duracao_min} min
                      </p>
                    </div>
                    <p className="font-headline-sm text-headline-sm text-primary">
                      {formatCurrency(s.preco)}
                    </p>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Profissional */}
      {currentStep === 1 && (
        <div className="space-y-stack-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Escolha o profissional</h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)}>
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            </Button>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => handleSelectProfissional(null)}
              className="w-full text-left cursor-pointer"
            >
              <Card hover className="transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">person</span>
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface">Sem preferência</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Qualquer profissional disponível</p>
                  </div>
                </div>
              </Card>
            </button>
            {profissionais.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectProfissional(p)}
                className="w-full text-left cursor-pointer"
              >
                <Card hover className="transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">badge</span>
                    </div>
                    <p className="font-label-lg text-label-lg text-on-surface">{p.nome}</p>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Data */}
      {currentStep === 2 && (
        <div className="space-y-stack-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Escolha a data</h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
              <span className="material-symbols-outlined">chevron_left</span>
            </Button>
            <span className="font-label-md text-label-md text-on-surface">
              {weekDates[0] && new Date(weekDates[0] + "T12:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
              <span className="material-symbols-outlined">chevron_right</span>
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((d) => {
              const date = new Date(d + "T12:00:00");
              const past = isPast(d);
              const today = isToday(d);
              return (
                <button
                  key={d}
                  onClick={() => handleSelectData(d)}
                  disabled={past}
                  className={`flex flex-col items-center p-3 rounded transition-all ${
                    past
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:bg-surface-container-highest cursor-pointer"
                  } ${selectedData === d ? "bg-primary text-on-primary" : ""}`}
                >
                  <span className={`font-label-xs text-label-xs uppercase ${
                    selectedData === d ? "text-on-primary" : "text-on-surface-variant"
                  }`}>
                    {date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                  </span>
                  <span className={`font-headline-sm text-headline-sm mt-1 ${
                    today ? "text-primary" : selectedData === d ? "text-on-primary" : "text-on-surface"
                  }`}>
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Horário */}
      {currentStep === 3 && (
        <div className="space-y-stack-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Escolha o horário</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {formatDateBR(selectedData)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            </Button>
          </div>

          {loadingHorarios ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-surface-container-highest rounded animate-shimmer" />
              ))}
            </div>
          ) : horariosDisponiveis.length === 0 ? (
            <Card>
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant">schedule_off</span>
                <p className="font-body-md text-body-md text-on-surface-variant mt-3">
                  Nenhum horário disponível nesta data
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {horariosDisponiveis.map((slot) => (
                <button
                  key={slot.horario}
                  onClick={() => handleSelectHorario(slot)}
                  className={`py-3 px-4 rounded font-label-md text-label-md transition-all flex flex-col items-center cursor-pointer ${
                    selectedHorario === slot.horario
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container border border-outline-variant hover:border-primary text-on-surface"
                  }`}
                >
                  <span>{slot.horario}</span>
                  {slot.profissionalNome && (
                    <span className="text-[10px] opacity-70 mt-0.5">
                      {slot.profissionalNome}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Dados do Cliente */}
      {currentStep === 4 && (
        <div className="space-y-stack-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Dados do cliente</h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            </Button>
          </div>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-surface-container-high rounded">
                <span className="material-symbols-outlined text-primary">content_cut</span>
                <span className="font-label-md text-label-md text-on-surface">{selectedServico?.nome}</span>
                <span className="ml-auto font-label-md text-label-md text-primary">
                  {selectedServico && formatCurrency(selectedServico.preco)}
                </span>
              </div>
              {selectedProfissional && (
                <div className="flex items-center gap-3 p-3 bg-surface-container-high rounded">
                  <span className="material-symbols-outlined text-primary">badge</span>
                  <span className="font-label-md text-label-md text-on-surface">{selectedProfissional.nome}</span>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-surface-container-high rounded">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                <span className="font-label-md text-label-md text-on-surface">
                  {formatDateBR(selectedData)} às {selectedHorario}
                </span>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Input
              id="nome"
              label="Nome do cliente"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              error={errors.nome?.[0]}
            />
            <Input
              id="whatsapp"
              label="WhatsApp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
              error={errors.whatsapp?.[0]}
              placeholder="(99) 99999-9999"
            />
            <Input
              id="email"
              label="E-mail (opcional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email?.[0]}
            />
          </div>

          {formError && (
            <div className="p-3 bg-error/10 border border-error/30 rounded">
              <p className="font-body-sm text-body-sm text-error text-center">{formError}</p>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={submitting || isPending}
            onClick={handleSubmit}
          >
            Confirmar Agendamento
          </Button>
        </div>
      )}
    </div>
  );
}
