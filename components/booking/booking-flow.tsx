"use client";

import { useState, useCallback } from "react";
import { Stepper, type Step } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { StepService } from "./step-service";
import { StepProfessional } from "./step-professional";
import { StepDate } from "./step-date";
import { StepTime } from "./step-time";
import { StepClient } from "./step-client";
import { BookingConfirmation } from "./booking-confirmation";

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

interface SalaoData {
  id: string;
  nome: string;
  slug: string;
  whatsapp: string | null;
  config: Record<string, unknown>;
}

interface BookingData {
  servico: Servico | null;
  profissional: Profissional | null;
  data: string | null;
  horario: string | null;
  clienteNome: string;
  clienteWhatsapp: string;
}

const steps: Step[] = [
  { id: "servico", label: "Choose Service" },
  { id: "profissional", label: "Select Barber" },
  { id: "data", label: "Date" },
  { id: "horario", label: "Time" },
  { id: "cliente", label: "Details" },
];

export function BookingFlow({ salao }: { salao: SalaoData }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [booking, setBooking] = useState<BookingData>({
    servico: null,
    profissional: null,
    data: null,
    horario: null,
    clienteNome: "",
    clienteWhatsapp: "",
  });
  const [confirmed, setConfirmed] = useState(false);
  const [agendamentoId, setAgendamentoId] = useState<string | null>(null);

  const updateBooking = useCallback(<K extends keyof BookingData>(
    key: K,
    value: BookingData[K]
  ) => {
    setBooking((prev) => ({ ...prev, [key]: value }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleConfirmed = useCallback((id: string) => {
    setAgendamentoId(id);
    setConfirmed(true);
  }, []);

  if (confirmed) {
    return (
      <BookingConfirmation
        booking={booking}
        salaoNome={salao.nome}
        agendamentoId={agendamentoId}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-dynamic">
      <div className="px-margin-desktop py-stack-md">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="flex-1 px-margin-desktop pb-stack-md overflow-hidden">
        <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div key={currentStep} className="lg:col-span-7 h-full animate-fade-in" style={{ animationDuration: "400ms" }}>
            {currentStep === 0 && (
              <StepService
                salaoId={salao.id}
                selected={booking.servico}
                onSelect={(s) => {
                  updateBooking("servico", s);
                  updateBooking("profissional", null);
                  updateBooking("data", null);
                  updateBooking("horario", null);
                  setTimeout(nextStep, 400);
                }}
              />
            )}
            {currentStep === 1 && (
              <StepProfessional
                salaoId={salao.id}
                selected={booking.profissional}
                onSelect={(p) => {
                  updateBooking("profissional", p);
                  updateBooking("data", null);
                  updateBooking("horario", null);
                  setTimeout(nextStep, 400);
                }}
                onSkip={() => {
                  updateBooking("profissional", null);
                  setTimeout(nextStep, 400);
                }}
              />
            )}
            {currentStep === 2 && (
              <StepDate
                selectedDate={booking.data}
                onSelect={(data) => {
                  updateBooking("data", data);
                  updateBooking("horario", null); // reset time if date changes
                  setTimeout(nextStep, 400);
                }}
              />
            )}
            {currentStep === 3 && (
              <StepTime
                salaoId={salao.id}
                servicoId={booking.servico?.id ?? ""}
                profissionalId={booking.profissional?.id ?? null}
                selectedDate={booking.data ?? ""}
                selectedTime={booking.horario}
                onSelect={(horario) => {
                  updateBooking("horario", horario);
                  setTimeout(nextStep, 400);
                }}
              />
            )}
            {currentStep === 4 && (
              <StepClient
                salaoId={salao.id}
                slug={salao.slug}
                servicoId={booking.servico?.id ?? ""}
                profissionalId={booking.profissional?.id ?? null}
                data={booking.data ?? ""}
                horario={booking.horario ?? ""}
                clienteNome={booking.clienteNome}
                clienteWhatsapp={booking.clienteWhatsapp}
                onUpdateCliente={(nome, whatsapp) => {
                  updateBooking("clienteNome", nome);
                  updateBooking("clienteWhatsapp", whatsapp);
                }}
                onConfirmed={handleConfirmed}
              />
            )}
          </div>

          <div className="lg:col-span-5 h-full">
            <div className="bg-surface-container-high p-stack-md rounded-lg border border-primary/30 shadow-xl h-full flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-stack-sm">Ritual Summary</h3>
              <div className="space-y-3 mb-stack-md">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Service</span>
                  <span key={booking.servico?.id || 'empty'} className="font-label-md text-label-md text-on-surface text-right animate-fade-in">
                    {booking.servico?.nome || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Barber</span>
                  <span key={booking.profissional?.id || 'empty'} className="font-label-md text-label-md text-on-surface text-right animate-fade-in">
                    {booking.profissional?.nome || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Date & Time</span>
                  <span key={`${booking.data}-${booking.horario}`} className="font-label-md text-label-md text-on-surface text-right animate-fade-in">
                    {booking.data && booking.horario
                      ? `${new Date(booking.data).toLocaleDateString("pt-BR")} ${booking.horario}`
                      : "—"}
                  </span>
                </div>
                <div className="pt-3 border-t border-outline-variant flex justify-between items-center">
                  <span className="font-headline-sm text-headline-sm text-on-surface">Total</span>
                  <span key={booking.servico?.preco || 0} className="font-headline-sm text-headline-sm text-primary animate-fade-in">
                    {booking.servico ? `R$ ${booking.servico.preco.toFixed(2)}` : "—"}
                  </span>
                </div>
              </div>

              {currentStep === 4 ? (
                <button
                  type="submit"
                  form="cliente-form"
                  className="w-full py-4 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest rounded-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-card"
                >
                  Confirm Agendamento
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-4 bg-surface-container-highest text-on-surface-variant font-label-md text-label-md uppercase tracking-widest rounded-sm opacity-50 cursor-not-allowed"
                >
                  Complete Details
                </button>
              )}

              <p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-4 italic">
                No payment required now. Pay after your ritual.
              </p>

              <div className="flex-1 min-h-[150px] relative mt-6 rounded overflow-hidden">
                <img
                  src="/images/hero-bg.webp"
                  alt="Grooming Ritual"
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 mix-blend-luminosity hover:opacity-80 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentStep > 0 && (
        <div className="px-margin-desktop py-stack-md">
          <div className="max-w-container-max mx-auto">
            <Button variant="ghost" onClick={prevStep} icon={<span className="material-symbols-outlined text-[18px]">arrow_back</span>}>
              Voltar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
