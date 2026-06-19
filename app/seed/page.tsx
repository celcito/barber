"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SeedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  async function handleSeed() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      setResult(data);

      if (data.success) {
        setTimeout(() => router.push("/dashboard/profissionais"), 2000);
      }
    } catch {
      setResult({ error: "Erro ao conectar com o servidor" });
    }

    setLoading(false);
  }

  return (
    <div className="min-h-dynamic flex items-center justify-center px-6 py-24 bg-background">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-on-surface mb-4">Inicializar Dados do Salão</h1>
        <p className="text-on-surface-variant mb-8">
          Clique no botão abaixo para criar profissionais, horários e serviços para o seu salão.
          <br/>
          <strong>Você precisa estar logado!</strong>
        </p>

        {loading && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-on-surface-variant">Criando dados...</p>
          </div>
        )}

        {result && !loading && (
          <div className={`p-4 rounded mb-6 ${result.success ? "bg-green-100" : "bg-red-100"}`}>
            <p className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
              {result.success ? "✓ " + result.message : "✗ " + result.error}
            </p>
            {result.success && (
              <p className="text-green-600 text-sm mt-2">Redirecionando...</p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {!loading && !result && (
            <button
              onClick={handleSeed}
              className="w-full bg-primary text-on-primary px-6 py-3 rounded font-medium hover:brightness-110"
            >
              Inicializar Dados
            </button>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-surface-container text-on-surface px-6 py-3 rounded font-medium hover:bg-surface-container-high"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
