"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { createAgendamento } from "@/lib/actions/public";

interface StepClientProps {
  salaoId: string;
  slug: string;
  servicoId: string;
  profissionalId: string | null;
  data: string;
  horario: string;
  clienteNome: string;
  clienteWhatsapp: string;
  clienteEmail: string;
  onUpdateCliente: (nome: string, whatsapp: string, email?: string) => void;
  onConfirmed: (agendamentoId: string) => void;
}

function formatWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7)
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function StepClient({
  salaoId,
  slug,
  servicoId,
  profissionalId,
  data,
  horario,
  clienteNome,
  clienteWhatsapp,
  clienteEmail,
  onUpdateCliente,
  onConfirmed,
}: StepClientProps) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError("");

    const formData = new FormData(e.currentTarget);
    formData.set("salao_id", salaoId);
    formData.set("servico_id", servicoId);
    if (profissionalId) {
      formData.set("profissional_id", profissionalId);
    } else {
      formData.delete("profissional_id");
    }
    formData.set("data", data);
    formData.set("horario", horario);
    formData.set("slug", slug);

    const result = await createAgendamento(formData);

    if (result?.error) {
      if (typeof result.error === "object" && "_form" in result.error) {
        setFormError((result.error as { _form: string[] })._form[0]);
      } else {
        setErrors(result.error as Record<string, string[]>);
      }
      setSubmitting(false);
      return;
    }

    if (result.success && result.agendamento) {
      onConfirmed(result.agendamento.id);
    }
  }

  return (
    <div className="bg-surface-container p-stack-md rounded-lg border border-outline-variant h-full flex flex-col">
      <div className="flex items-center gap-base mb-stack-md">
        <span className="material-symbols-outlined text-primary">person</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">5. Seus Dados</h2>
      </div>

      {formError && (
        <div className="mb-6 p-4 rounded bg-error-container/20 border border-error/50 text-body-md text-error text-center">
          {formError}
        </div>
      )}

      <form id="cliente-form" onSubmit={handleSubmit} className="space-y-stack-sm w-full max-w-full">
        <Input
          label="Seu nome"
          name="nome"
          id="nome"
          value={clienteNome}
          onChange={(e) =>
            onUpdateCliente(e.target.value, clienteWhatsapp, clienteEmail)
          }
          error={errors.nome?.[0]}
          required
        />
        <Input
          label="WhatsApp"
          name="whatsapp"
          id="whatsapp"
          type="tel"
          value={clienteWhatsapp}
          onChange={(e) => {
            const formatted = formatWhatsApp(e.target.value);
            onUpdateCliente(clienteNome, formatted, clienteEmail);
          }}
          error={errors.whatsapp?.[0]}
          helperText="Informe seu WhatsApp para receber a confirmação"
          required
        />
        <Input
          label="E-mail (opcional)"
          name="email"
          id="email"
          type="email"
          value={clienteEmail}
          onChange={(e) =>
            onUpdateCliente(clienteNome, clienteWhatsapp, e.target.value)
          }
          error={errors.email?.[0]}
        />

        <div className="flex items-start gap-3 pt-4">
          <input 
            type="checkbox" 
            id="lgpd-consent" 
            name="lgpd-consent" 
            required 
            className="mt-0.5 w-4 h-4 rounded border-outline bg-transparent text-primary focus:ring-primary focus:ring-offset-surface cursor-pointer shrink-0"
          />
          <label htmlFor="lgpd-consent" className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed cursor-pointer select-none">
            Concordo com o uso dos meus dados (Nome, WhatsApp e E-mail) para fins de agendamento, comunicação sobre o serviço e gestão de atendimento, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
          </label>
        </div>
      </form>
    </div>
  );
}
