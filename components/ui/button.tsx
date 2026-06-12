"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] shadow-card",
  secondary:
    "border border-outline text-on-surface hover:bg-surface-container-highest",
  ghost:
    "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 font-label-sm text-label-sm gap-2",
  md: "px-6 py-3 font-label-md text-label-md gap-2.5",
  lg: "px-8 py-4 font-label-md text-label-md gap-3 uppercase tracking-[0.05em]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center font-body font-medium transition-all duration-200 transform-gpu will-change-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 rounded",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
        style={{ color: '#412d00' }}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
        {icon && (
          <span className="inline-flex items-center justify-center">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
