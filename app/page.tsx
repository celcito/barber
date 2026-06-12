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
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero-bg.webp" 
            alt="Barber Shop Interior" 
            fill 
            className="object-cover object-center opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-desktop">
          <h1 className="font-display-lg text-display-lg text-primary max-w-3xl mb-stack-sm leading-tight">
            Schedule Your Ritual
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            Premium grooming is more than a service; it's a dedicated moment of refinement. Secure your seat with our master artisans.
          </p>
          <div className="flex gap-gutter mt-stack-md">
            <Link
              href="/login"
              className="bg-primary text-on-primary px-8 py-4 font-label-md text-label-md uppercase tracking-widest rounded hover:brightness-110 active:scale-[0.98] transition-all shadow-card inline-block"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-container-max mx-auto px-margin-desktop py-stack-lg">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-stack-lg text-center">1. Choose Service</h2>
          <div className="space-y-stack-md">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline flex-grow">
                <span className="font-body-lg text-body-lg text-on-surface">Wash, Cut, & Style</span>
                <div className="dotted-leader mx-4" />
              </div>
              <span className="font-body-lg text-body-lg text-primary">R$ 120</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">45 min</p>

            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline flex-grow">
                <span className="font-body-lg text-body-lg text-on-surface">Cut, Hot Towel Shave, & Scalp Massage</span>
                <div className="dotted-leader mx-4" />
              </div>
              <span className="font-body-lg text-body-lg text-primary">R$ 200</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">90 min</p>

            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline flex-grow">
                <span className="font-body-lg text-body-lg text-on-surface">Razor Edge & Conditioning</span>
                <div className="dotted-leader mx-4" />
              </div>
              <span className="font-body-lg text-body-lg text-primary">R$ 80</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">30 min</p>
          </div>
        </div>
      </section>

      {/* Barbers Section */}
      <section className="bg-surface-container-low border-y border-outline-variant py-stack-lg">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-stack-lg text-center">2. Select Barber</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter max-w-4xl mx-auto">
            <div className="bg-surface-container p-stack-md rounded border border-outline-variant flex items-center gap-stack-md hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-outline group-hover:border-primary transition-colors relative">
                <Image src="/images/barber-1.webp" alt="Julian Rossi" fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Julian Rossi</h3>
                <p className="font-label-md text-label-md text-primary uppercase tracking-wider">Master Artisan</p>
              </div>
            </div>
            
            <div className="bg-surface-container p-stack-md rounded border border-outline-variant flex items-center gap-stack-md hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-outline group-hover:border-primary transition-colors relative">
                <Image src="/images/barber-2.webp" alt="Arthur Vance" fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Arthur Vance</h3>
                <p className="font-label-md text-label-md text-primary uppercase tracking-wider">Senior Barber</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full py-stack-lg mt-stack-lg">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto gap-stack-md">
          <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-widest">AgendaFácil</span>
          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            &copy; 2026 The Grooming Ritual. Handcrafted Grooming.
          </p>
          <div className="flex gap-stack-md">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
