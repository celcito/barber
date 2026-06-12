"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface BookingData {
  servico: { nome: string; duracao_min: number; preco: number } | null;
  profissional: { nome: string } | null;
  data: string | null;
  horario: string | null;
  clienteNome: string;
  clienteWhatsapp: string;
}

interface BookingConfirmationProps {
  booking: BookingData;
  salaoNome: string;
  agendamentoId: string | null;
}

function formatDateBR(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  return `${d} de ${meses[m - 1]} de ${y}`;
}

export function BookingConfirmation({
  booking,
  salaoNome,
}: BookingConfirmationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const googleCalUrl = booking.data && booking.horario && booking.servico
    ? (() => {
        const [h, m] = booking.horario.split(":").map(Number);
        const [y, mo, d] = booking.data.split("-").map(Number);
        const start = new Date(y, mo - 1, d, h, m);
        const end = new Date(start.getTime() + booking.servico.duracao_min * 60000);

        const fmt = (date: Date) =>
          date
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}/, "");

        const params = new URLSearchParams({
          action: "TEMPLATE",
          text: `${booking.servico.nome} - ${salaoNome}`,
          dates: `${fmt(start)}/${fmt(end)}`,
          details: `Agendamento em ${salaoNome}\nServiço: ${booking.servico.nome}\nProfissional: ${booking.profissional?.nome || "Sem preferência"}`,
        });
        return `https://calendar.google.com/calendar/render?${params.toString()}`;
      })()
    : "#";

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center min-h-dynamic py-stack-md w-full">
      <div className="max-w-[600px] w-full mx-auto bg-surface-container-lowest vintage-border shadow-2xl overflow-hidden animate-fade-in relative z-10">
        {/* Header */}
        <header className="pt-stack-lg pb-stack-md flex flex-col items-center justify-center border-b border-outline-variant/30">
          <h1 className="font-headline-md text-headline-md text-primary uppercase tracking-[0.3em] mb-2 text-center px-4">
            {salaoNome}
          </h1>
          <div className="h-px w-24 bg-primary/40"></div>
        </header>

        {/* Main Content */}
        <main className="px-stack-lg py-stack-lg">
          {/* Hero Image */}
          <div className="mb-stack-md relative h-48 w-full overflow-hidden rounded-sm group">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxuE0GrvUrccuvIkBcnWU5bKKLkbIjlmk0igXEnQrJLwDgMdRhiBOGZDXD7PKF43VDFwVwgxXgNW9vguV_jcmNNumBiEE1pK39_zRgff8WZS-vxEav14tinBrbAmVnwHs1Rq61vRfNSqgCUHZde6K0pSHTgsmvSC1AB69GM1Dd1UX01BfZpMVq63Yl2PUO5mVCjNIocBV73M41Um9D0GuMmBSCTjEheIqUS2zPCTGDYyWAHfyexNzDIFRAyKtGrl1Ei3HwA6uUFtiV"
              alt="The Grooming Ritual Atmosphere" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent opacity-60"></div>
          </div>

          {/* Greeting */}
          <div className="text-center mb-stack-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
              Olá, {booking.clienteNome.split(' ')[0]}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant italic">
              Seu Ritual está confirmado.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-surface-container p-stack-md rounded-sm border border-outline-variant/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-6xl text-primary">content_cut</span>
            </div>
            
            <div className="space-y-stack-sm relative z-10">
              <div className="dotted-leader">
                <span className="font-label-md text-label-md text-primary uppercase mr-2">Serviço</span>
                <span className="font-body-md text-on-surface ml-2">{booking.servico?.nome}</span>
              </div>
              <div className="dotted-leader">
                <span className="font-label-md text-label-md text-primary uppercase mr-2">Barbeiro</span>
                <span className="font-body-md text-on-surface ml-2">{booking.profissional?.nome || "Sem preferência"}</span>
              </div>
              <div className="dotted-leader">
                <span className="font-label-md text-label-md text-primary uppercase mr-2">Data</span>
                <span className="font-body-md text-on-surface ml-2">
                  {booking.data ? formatDateBR(booking.data) : ""} às {booking.horario}
                </span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-stack-lg flex flex-col gap-stack-sm">
            <a 
              href={googleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary text-on-primary py-4 rounded-sm font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">calendar_add_on</span>
              Adicionar ao Calendário
            </a>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-transparent border border-outline-variant text-on-surface-variant py-4 rounded-sm font-label-md text-label-md uppercase tracking-widest hover:border-primary hover:text-primary transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              Fazer novo agendamento
            </button>
          </div>

          {/* Personal Note */}
          <div className="mt-stack-lg text-center">
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Estamos ansiosos para recebê-lo. Prepare-se para uma experiência de cuidado sem pressa, onde a tradição encontra a excelência.
            </p>
          </div>
        </main>
      </div>

      <style jsx>{`
        .dotted-leader {
            display: flex;
            align-items: baseline;
        }
        .dotted-leader::after {
            content: "";
            flex-grow: 1;
            border-bottom: 1px dotted #9a8f80;
            margin: 0 8px;
            opacity: 0.3;
            order: 0;
        }
        .dotted-leader span:last-child {
            order: 1;
        }
        .vintage-border {
            border: 1px solid rgba(233, 193, 118, 0.2);
            position: relative;
        }
        .vintage-border::before {
            content: '';
            position: absolute;
            top: 4px;
            left: 4px;
            right: 4px;
            bottom: 4px;
            border: 1px solid rgba(233, 193, 118, 0.1);
            pointer-events: none;
            z-index: 20;
        }
      `}</style>
    </div>
  );
}
