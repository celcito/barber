"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError("Não foi possível redefinir a senha. O link pode ter expirado.");
      setLoading(false);
      return;
    }

    // Senha redefinida com sucesso, redireciona para o dashboard
    router.push("/dashboard");
  }

  return (
    <main className="min-h-dynamic flex items-center justify-center px-6 py-24 bg-background text-on-background">
      <nav className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant h-20">
        <div className="flex justify-between items-center px-margin-desktop h-full max-w-container-max mx-auto">
          <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-widest">AgendaFácil</span>
        </div>
      </nav>

      <div className="w-full max-w-md pt-20">
        <div className="text-center mb-10">
          <h1 className="font-headline-md text-headline-md text-primary mb-2">
            Nova Senha
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Crie uma nova senha segura para sua conta.
          </p>
        </div>

        <div className="bg-surface-container border border-outline-variant p-stack-md rounded">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined">lock</span>
              <input
                id="password"
                type="password"
                placeholder="Nova Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 pl-11 transition-all outline-none"
              />
            </div>
            
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined">lock_reset</span>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirme a Nova Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 pl-11 transition-all outline-none"
              />
            </div>

            {error && (
              <p className="font-label-sm text-label-sm text-error text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Salvar Nova Senha
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
