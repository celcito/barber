"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cancelarAgendamento } from "@/lib/actions/agendamentos";

interface AgendamentoDetalhesProps {
  agendamento: {
    id: string;
    cliente_nome: string;
    cliente_whatsapp: string;
    cliente_email: string | null;
    inicio: string;
    fim: string;
    status: "confirmado" | "pendente" | "cancelado" | "atendido";
    servicos: { nome: string; preco: number; duracao_min: number } | null;
    profissionais: { nome: string } | null;
  };
  onClose: () => void;
}

export function AgendamentoDetalhes({ agendamento, onClose }: AgendamentoDetalhesProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function handleCancel() {
    setLoading(true);
    const result = await cancelarAgendamento(agendamento.id);
    if (result?.error) {
      alert(result.error);
      setLoading(false);
      return;
    }
    router.refresh();
    onClose();
  }

  const data = new Date(agendamento.inicio);
  const dataFormatada = data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const horaInicio = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const horaFim = new Date(agendamento.fim).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const whatsappUrl = agendamento.cliente_whatsapp
    ? `https://wa.me/55${agendamento.cliente_whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <div className="space-y-stack-md">
      <div className="text-center">
        <Badge variant={agendamento.status}>
          {agendamento.status === "confirmado" ? "Confirmado" :
           agendamento.status === "pendente" ? "Pendente" :
           agendamento.status === "atendido" ? "Atendido" : "Cancelado"}
        </Badge>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Cliente</p>
              <p className="font-body-md text-body-md font-medium text-on-surface">{agendamento.cliente_nome}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">content_cut</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Serviço</p>
              <p className="font-body-md text-body-md font-medium text-on-surface">
                {agendamento.servicos?.nome}
                {agendamento.servicos && (
                  <span className="text-on-surface-variant font-normal">
                    {" "}· R$ {agendamento.servicos.preco.toFixed(2)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {agendamento.profissionais && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">badge</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Profissional</p>
                <p className="font-body-md text-body-md font-medium text-on-surface">{agendamento.profissionais.nome}</p>
              </div>
            </div>
          )}

          {agendamento.cliente_email && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">mail</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">E-mail</p>
                <p className="font-body-md text-body-md font-medium text-on-surface">{agendamento.cliente_email}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Data</p>
              <p className="font-body-md text-body-md font-medium text-on-surface">{dataFormatada}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">schedule</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Horário</p>
              <p className="font-body-md text-body-md font-medium text-on-surface tabular-nums">
                {horaInicio} - {horaFim}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="secondary" size="lg" className="w-full" icon={<span className="material-symbols-outlined text-[18px]">chat</span>}>
              WhatsApp
            </Button>
          </a>
        )}

        {agendamento.status !== "cancelado" && agendamento.status !== "atendido" && (
          <>
            {confirmCancel ? (
              <div className="space-y-3 p-4 rounded bg-error/10 border border-error/30">
                <p className="font-body-md text-body-md text-error text-center">
                  Tem certeza que deseja cancelar este agendamento?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="flex-1"
                    onClick={() => setConfirmCancel(false)}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    loading={loading}
                    onClick={handleCancel}
                    icon={<span className="material-symbols-outlined text-[18px]">cancel</span>}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="lg"
                className="w-full text-error"
                onClick={() => setConfirmCancel(true)}
                icon={<span className="material-symbols-outlined text-[18px]">cancel</span>}
              >
                Cancelar Agendamento
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
