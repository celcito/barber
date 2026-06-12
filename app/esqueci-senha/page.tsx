"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function EsqueciSenhaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
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
            Recuperar Senha
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Informe seu email e enviaremos um link para você criar uma nova senha.
          </p>
        </div>

        <div className="bg-surface-container border border-outline-variant p-stack-md rounded">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">E-mail Enviado!</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                Verifique sua caixa de entrada (e a pasta de spam) para o link de redefinição.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Voltar para o Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined">mail</span>
                <input
                  id="email"
                  type="email"
                  placeholder="Email cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 pl-11 transition-all outline-hidden"
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
                Enviar link de recuperação
              </Button>
              
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Voltar para o login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
