"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const features = [
  { icon: "calendar_month", label: "Agendamento ilimitado" },
  { icon: "group", label: "Profissionais ilimitados" },
  { icon: "content_cut", label: "Serviços ilimitados" },
  { icon: "chat", label: "WhatsApp integrado" },
  { icon: "credit_card", label: "Gestão financeira" },
  { icon: "verified", label: "Suporte prioritário" },
];

export default function AssinarPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleCheckout() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Erro ao redirecionar para pagamento");
        setLoading(false);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dynamic bg-background text-on-background">
      <nav className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant h-20">
        <div className="flex justify-between items-center px-margin-desktop h-full max-w-container-max mx-auto">
          <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-widest">AgendaFácil</span>
          <Button 
            variant="primary"
            style={{ color: '#412d00' }}
            size="sm"
            onClick={() => router.push("/login")}
          >
            Entrar
          </Button>
        </div>
      </nav>

      <div className="max-w-container-max mx-auto px-margin-desktop py-stack-lg pt-28">
        <div className="text-center mb-stack-lg">
          <h1 className="font-headline-md text-headline-md text-primary mb-4">Escolha seu plano</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto">
            Experimente grátis por 30 dias. Sem compromisso, cancele quando quiser.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-surface-container-high border border-primary/30 p-stack-md rounded shadow-xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-[0.2em] mb-4">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                Mais popular
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface">AgendaFácil Pro</h2>
              <div className="mt-4 mb-6">
                <span className="font-display-lg text-display-lg text-primary">R$197</span>
                <span className="font-body-md text-body-md text-on-surface-variant">/mês</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-8">
                Teste grátis por 30 dias &bull; Cancele quando quiser
              </p>

              <Button
                size="lg"
                loading={loading}
                onClick={handleCheckout}
                icon={<span className="material-symbols-outlined text-[20px]">auto_awesome</span>}
                className="w-full"
              >
                Começar Teste Grátis
              </Button>

              {error && (
                <p className="mt-3 font-label-sm text-label-sm text-error">{error}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-stack-lg">
          <h2 className="font-headline-md text-headline-md text-on-surface text-center mb-stack-md">
            Tudo que você precisa
          </h2>
          <div className="max-w-lg mx-auto bg-surface-container border border-outline-variant p-stack-md rounded">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feat) => (
                <div key={feat.label} className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[18px]">{feat.icon}</span>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface">{feat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-stack-lg text-center">
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
            Já é assinante?{" "}
            <button
              onClick={() => router.push("/dashboard")}
              className="text-primary underline underline-offset-4 hover:brightness-110 transition-colors"
            >
              Ir para o dashboard
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
