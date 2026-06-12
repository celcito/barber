"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="relative">
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-[20px]">
            {props.type === "tel" ? "call" : props.type === "email" ? "mail" : "edit"}
          </span>
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-3 pl-11 transition-all outline-none",
              error && "border-error",
              className
            )}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              "absolute left-11 transition-all duration-300 pointer-events-none font-label-sm text-label-sm",
              focused || props.value
                ? "-top-3 text-primary text-[11px]"
                : "top-1/2 -translate-y-1/2 text-on-surface-variant/50"
            )}
          >
            {label}
          </label>
        </div>
        {helperText && !error && (
          <p className="mt-1.5 text-label-sm text-on-surface-variant px-1">{helperText}</p>
        )}
        {error && (
          <p className="mt-1.5 text-label-sm text-error px-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
