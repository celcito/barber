"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "#servicos", label: "Serviços" },
  { href: "#heritage", label: "Barbeiros" },
  { href: "#localizacao", label: "Horários" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface/95 backdrop-blur-md border-b border-outline-variant h-16"
          : "bg-transparent h-20"
      }`}
    >
      <div className="flex justify-between items-center px-margin-desktop md:px-margin-desktop h-full max-w-container-max mx-auto">
        <Link href="/" className="font-display text-headline-sm text-primary uppercase tracking-widest hover:opacity-80 transition-opacity">
          AgendaFácil
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-stack-md">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 uppercase tracking-wider"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/barbearia-teste"
            className="bg-primary text-on-primary px-5 py-2.5 font-label-md text-label-md uppercase tracking-widest rounded hover:brightness-110 active:scale-[0.98] transition-all shadow-card"
          >
            Agendar
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-on-surface transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-on-surface transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-on-surface transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-surface/95 backdrop-blur-md border-b border-outline-variant animate-fade-in">
          <div className="flex flex-col items-center py-stack-md gap-stack-md">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/barbearia-teste"
              className="bg-primary text-on-primary px-6 py-3 font-label-md text-label-md uppercase tracking-widest rounded hover:brightness-110 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              Agendar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
