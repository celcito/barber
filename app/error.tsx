"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[Error]", error);
  return (
    <div className="min-h-dynamic bg-background text-on-background flex items-center justify-center px-margin-mobile">
      <div className="text-center max-w-sm">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">error</span>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Algo deu errado</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-primary text-on-primary rounded font-label-md text-label-md uppercase tracking-wider hover:brightness-110 transition-all"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
