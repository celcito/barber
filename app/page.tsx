import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/features/hero-section";
import { ServicesSection } from "@/components/features/services-section";
import { HeritageSection } from "@/components/features/heritage-section";
import { LocationSection } from "@/components/features/location-section";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "AgendaFácil — Agendamento premium",
  description:
    "A Arte do Grooming Tradicional. Experiência premium de barbearia para quem busca precisão e presença.",
};

export default function Home() {
  return (
    <main className="min-h-dynamic bg-background text-on-background noise-overlay">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <HeritageSection />
      
      <LocationSection />
      <Footer />
    </main>
  );
}
