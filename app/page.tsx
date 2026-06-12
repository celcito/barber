import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "AgendaFácil — Agendamento premium",
};

export default function Home() {
  return (
    <main className="min-h-dynamic bg-background text-on-background">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant h-20">
        <div className="flex justify-between items-center px-margin-desktop h-full max-w-container-max mx-auto">
          <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-widest">AgendaFácil</span>
          <div className="flex items-center gap-stack-md">
            <Link href="/login" className="font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-highest transition-all duration-300 px-4 py-2 rounded">
              Acesso Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero-bg.webp" 
            alt="Interior da Barbearia" 
            fill 
            className="object-cover object-center opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-background/30" />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-desktop">
<h1 className="font-display-lg text-display-lg text-primary max-w-3xl mb-stack-sm leading-tight">
            Agende Seu Ritual
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            Um corte premium é mais que um serviço; é um momento dedicado ao seu cuidado. Garanta seu horário com nossos mestres artesãos.
          </p>
          <div className="flex gap-gutter mt-stack-md">
            <Link
              href="/login"
              className="bg-primary text-on-primary px-8 py-4 font-label-md text-label-md uppercase tracking-widest rounded hover:brightness-110 active:scale-[0.98] transition-all shadow-card inline-block"
            >
              Agendar Agora
            </Link>
          </div>
        </div>
      </section>
   
      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full py-stack-lg mt-stack-lg">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto gap-stack-md">
          <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-widest">AgendaFácil</span>
          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            &copy; 2026 AgendaFácil. Cuidado Artesanal.
          </p>
          <div className="flex gap-stack-md">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Política de Privacidade</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Termos de Uso</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
