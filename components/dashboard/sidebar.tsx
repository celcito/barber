"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface DashboardSidebarProps {
  salaoNome: string;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Agenda", href: "/dashboard/agenda", icon: "calendar_month" },
  { label: "Horários", href: "/dashboard/agenda-profissionais", icon: "schedule" },
  { label: "Serviços", href: "/dashboard/servicos", icon: "content_cut" },
  { label: "Profissionais", href: "/dashboard/profissionais", icon: "group" },
  { label: "Clientes", href: "/dashboard/clientes", icon: "contacts" },
  { label: "Configurações", href: "/dashboard/configuracoes", icon: "settings" },
];

export function DashboardSidebar({ salaoNome }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleClose = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen, handleClose]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <nav className="flex flex-col h-full py-base px-stack-sm">
      <div className="flex items-center gap-stack-sm px-base py-stack-md">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-container-low flex items-center justify-center">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
        </div>
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface tracking-wide">{salaoNome}</h2>
          <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest mt-1">Administração</p>
        </div>
      </div>

      <div className="mt-stack-sm space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={handleClose}
              className={cn(
                "flex items-center gap-stack-sm px-stack-sm py-2.5 rounded-lg transition-all duration-200 font-label-md text-label-md",
                isActive
                  ? "bg-primary-container text-[#4e3700]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          );
        })}
      </div>

      <div className="mt-auto border-t border-outline-variant pt-stack-sm space-y-1 mb-base">
        <button
          onClick={() => { router.push("/dashboard/agenda/novo"); handleClose(); }}
          className="w-full py-3 px-base bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:brightness-110 active:scale-95 transform-gpu will-change-transform transition-all"
        >
          <span className="material-symbols-outlined text-[18px] mr-2" style={{ verticalAlign: "middle" }}>add</span>
          Novo Agendamento
        </button>
        <a
          href="#"
          className="flex items-center gap-stack-sm px-stack-sm py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-all font-label-md text-label-md"
        >
          <span className="material-symbols-outlined">help</span>
          Suporte
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-stack-sm w-full px-stack-sm py-3 text-on-surface-variant hover:text-error hover:bg-surface-container-highest rounded-lg transition-all font-label-md text-label-md"
        >
          <span className="material-symbols-outlined">logout</span>
Sair
        </button>
      </div>
    </nav>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden w-11 h-11 rounded bg-surface-container border border-outline-variant flex items-center justify-center"
        aria-label="Abrir menu"
      >
        <span className="material-symbols-outlined text-on-surface">menu</span>
      </button>

      <aside className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 bg-surface-container border-r border-outline-variant z-30">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xs"
            onClick={handleClose}
          />
          <div className="relative w-64 h-full bg-surface-container border-r border-outline-variant animate-slide-in-right">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Fechar menu"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
