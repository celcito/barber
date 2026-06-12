"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

function SlideOver({ open, onClose, title, children, className }: SlideOverProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => onClose(), 400);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, handleClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={cn(
          "absolute inset-0 bg-background/80 backdrop-blur-xs transition-opacity duration-500",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />
      <div
        className={cn(
          "relative w-full max-w-lg bg-surface-container h-full shadow-elevated transition-transform duration-500 ease-spring overflow-y-auto border-l border-outline-variant",
          visible ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export { SlideOver };
