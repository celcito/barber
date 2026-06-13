"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function HeroSection() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;

    const onScroll = () => {
      const y = window.scrollY;
      el.style.transform = `translateY(${y * 0.3}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative h-[90vh] min-h-[640px] flex items-center overflow-hidden">
      <div ref={parallaxRef} className="absolute inset-0 z-0 will-change-transform">
        <Image
          src="/images/hero-bg.webp"
          alt="Interior da Barbearia"
          fill
          className="object-cover object-center opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-background/30" />
      </div>

      <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop">
        <p className="font-label-md text-label-md text-primary uppercase tracking-[0.2em] mb-stack-sm">
          Fundado em MMXXIV
        </p>
        <h1 className="font-display text-display-lg text-on-surface max-w-3xl mb-stack-sm leading-[1.05]">
          A Arte do Grooming Tradicional
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-stack-md">
          Um corte premium é mais que um serviço; é um momento dedicado ao seu cuidado. Garanta seu horário com nossos mestres artesãos.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-primary text-on-primary px-8 py-4 font-label-md text-label-md uppercase tracking-widest rounded hover:brightness-110 active:scale-[0.98] transition-all shadow-card"
          >
            Agende Seu Ritual
          </Link>
          <Link
            href="#servicos"
            className="inline-flex items-center justify-center text-on-surface border border-outline-variant px-8 py-4 font-label-md text-label-md uppercase tracking-widest rounded hover:border-primary hover:text-primary transition-all"
          >
            Conheça os Serviços
          </Link>
        </div>
      </div>
    </section>
  );
}
