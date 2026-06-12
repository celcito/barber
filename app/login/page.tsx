"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const action = isSignUp
      ? supabase.auth.signUp({ email, password })
      : supabase.auth.signInWithPassword({ email, password });

    const { error: authError } = await action;

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!isSignUp) {
      router.push("/dashboard");
    }

    setLoading(false);
    if (isSignUp) {
      setSuccessMessage("Cadastro realizado! Enviamos um link de confirmação para seu email.");
    }
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
            {isSignUp ? "Criar Conta" : "Acesso Admin"}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isSignUp ? "Crie sua conta para começar" : "Acesse seu painel administrativo"}
          </p>
        </div>

        <div className="bg-surface-container border border-outline-variant p-stack-md rounded">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined">mail</span>
              <input
                id="email"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 pl-11 transition-all outline-hidden"
              />
            </div>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined">lock</span>
              <input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 pl-11 transition-all outline-hidden"
              />
            </div>

            {!isSignUp && (
              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={() => router.push("/esqueci-senha")}
                  className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {successMessage && (
              <p className="font-label-sm text-label-sm text-success">{successMessage}</p>
            )}
            {error && !successMessage && (
              <p className="font-label-sm text-label-sm text-error">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              {isSignUp ? "Criar conta" : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMessage(null);
              }}
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors duration-300"
            >
              {isSignUp ? "Já tenho conta" : "Não tenho conta"}
            </button>
          </div>
        </div>

        {!isSignUp && process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 rounded bg-surface-container-high border border-outline-variant text-center">
            <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-2">Teste</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Email: <span className="text-on-surface font-mono">teste@barbearia.com</span><br />
              Senha: <span className="text-on-surface font-mono">123456</span>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
