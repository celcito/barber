import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-dynamic bg-background text-on-background flex items-center justify-center px-margin-mobile">
      <div className="text-center max-w-sm">
        <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">search</span>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Página não encontrada</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md">
          A página que você procura não existe ou foi removida.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-primary text-on-primary rounded font-label-md text-label-md uppercase tracking-wider hover:brightness-110 transition-all"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
