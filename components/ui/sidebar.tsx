"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: NavItem[];
  activeHref?: string;
  brandName?: string;
  onLogout?: () => void;
}

function Sidebar({ items, activeHref, brandName = "AgendaFácil", onLogout }: SidebarProps) {
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

  const sidebarContent = (
    <nav className="flex flex-col h-full py-6">
      <div className="px-6 mb-8">
        <h2 className="font-display text-heading text-brand">{brandName}</h2>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {items.map((item, i) => (
          <li
            key={item.href}
            className="animate-fade-in"
            style={{ animationDelay: `${80 + i * 60}ms` }}
          >
            <a
              href={item.href}
              onClick={handleClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-body transition-all duration-300 ease-spring",
                activeHref === item.href
                  ? "bg-brand/10 text-brand font-medium"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
              )}
            >
              {item.icon && (
                <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
              )}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      {onLogout && (
        <div className="px-3 mt-auto">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-body text-neutral-400 hover:bg-neutral-100 hover:text-danger transition-all duration-300"
          >
            Sair
          </button>
        </div>
      )}
    </nav>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5 text-neutral-700" />
      </button>

      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-neutral-100">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/80 backdrop-blur-2xl"
            onClick={handleClose}
          />
          <div className="relative w-72 h-full bg-white shadow-elevated animate-slide-in-right">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center"
              aria-label="Fechar menu"
            >
              <div className="relative w-5 h-5">
                <span className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-600 -translate-y-1/2 rotate-45" />
                <span className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-600 -translate-y-1/2 -rotate-45" />
              </div>
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export { Sidebar, type NavItem };
