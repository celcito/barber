import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/booking/booking-flow";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient();

  const { data: salao } = await supabase
    .from("saloes")
    .select("nome")
    .eq("slug", params.slug)
    .single();

  if (!salao) return { title: "Página não encontrada" };

  return {
    title: `${salao.nome} — Agende seu horário`,
    description: `Agende seu horário na ${salao.nome} de forma prática e rápida. Escolha o serviço, profissional e horário ideal.`,
    openGraph: {
      title: `${salao.nome} — AgendaFácil`,
      description: `Agende seu horário na ${salao.nome}`,
      type: "website",
    },
  };
}

export default async function PublicBookingPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: salao } = await supabase
    .from("saloes")
    .select("id, nome, slug, whatsapp, config")
    .eq("slug", params.slug)
    .single();

  if (!salao) {
    notFound();
  }

  const salaoData = {
    id: salao.id,
    nome: salao.nome,
    slug: salao.slug,
    whatsapp: salao.whatsapp,
    config: (salao.config ?? {}) as Record<string, unknown>,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: salao.nome,
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://agendafacil.com.br"}/${salao.slug}`,
    description: `Agende seu horário na ${salao.nome}`,
    offers: {
      "@type": "AggregateOffer",
      offer: [
        {
          "@type": "Offer",
          name: "Agendamento online",
          url: `${process.env.NEXT_PUBLIC_APP_URL || "https://agendafacil.com.br"}/${salao.slug}`,
          availability: "https://schema.org/OnlineOnly",
        },
      ],
    },
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || "https://agendafacil.com.br"}/${salao.slug}`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-dynamic text-on-background relative flex flex-col">
        {/* Background Image Layer */}
        <div className="fixed inset-0 z-0">
          <Image 
            src="/images/hero-bg.webp" 
            alt="Barber Shop Interior" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-background/85" />
        </div>

        <nav className="fixed top-0 w-full z-50 bg-surface/50 backdrop-blur-md border-b border-outline-variant h-20">
          <div className="flex justify-between items-center px-margin-desktop h-full max-w-container-max mx-auto">
            <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-widest">{salao.nome}</span>
          </div>
        </nav>
        
        <main className="relative z-10 pt-32 flex-1">
          <div className="max-w-container-max mx-auto px-margin-desktop mb-stack-lg">
            <h1 className="font-display-lg text-display-lg text-primary max-w-2xl mb-base">Schedule Your Ritual</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Premium grooming is more than a service; it's a dedicated moment of refinement. Secure your seat with our master artisans.
            </p>
          </div>

          <div className="max-w-container-max mx-auto px-margin-desktop pb-stack-lg">
            <BookingFlow salao={salaoData} />
          </div>
        </main>

        <footer className="relative z-10 bg-surface-container-lowest/80 backdrop-blur-md border-t border-outline-variant w-full py-stack-lg mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto gap-stack-md">
            <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-widest">{salao.nome}</span>
            <p className="font-body-md text-body-md text-on-surface-variant text-center md:text-left">
              © 2024 The Grooming Ritual. Handcrafted Grooming.
            </p>
            <div className="flex gap-stack-md">
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
