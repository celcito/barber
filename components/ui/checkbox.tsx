"use client";

import { forwardRef, useId, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type CheckboxSize = "sm" | "md" | "lg";
type CheckboxState = "unchecked" | "checked" | "indeterminate";

interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "defaultChecked" | "checked"> {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  size?: CheckboxSize;
  error?: boolean;
  label?: string;
  description?: string;
  name?: string;
  value?: string;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

const sizeStyles: Record<CheckboxSize, { box: string; icon: number }> = {
  sm: { box: "w-4 h-4", icon: 10 },
  md: { box: "w-5 h-5", icon: 12 },
  lg: { box: "w-6 h-6", icon: 14 },
};

function stateToVisual(checked: boolean, indeterminate: boolean): CheckboxState {
  if (indeterminate) return "indeterminate";
  if (checked) return "checked";
  return "unchecked";
}

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  {
    checked: controlledChecked,
    defaultChecked = false,
    indeterminate = false,
    disabled = false,
    size = "md",
    error = false,
    label,
    description,
    name,
    value,
    onCheckedChange,
    onClick,
    id,
    className,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isControlled = controlledChecked !== undefined;
  const [internalChecked, setInternalChecked] = useState<boolean>(defaultChecked);
  const checked = isControlled ? controlledChecked : internalChecked;
  const visual = stateToVisual(checked, indeterminate);
  const sizing = sizeStyles[size];

  const hiddenRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (hiddenRef.current) {
      hiddenRef.current.value = checked ? (value ?? "true") : "";
    }
  }, [checked, value]);

  const toggle = () => {
    if (disabled) return;
    const next = indeterminate ? true : !checked;
    if (!isControlled) setInternalChecked(next);
    onCheckedChange?.(next);
  };

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    toggle();
    onClick?.(e);
  };

  const handleLabelClick: React.MouseEventHandler<HTMLLabelElement> = (e) => {
    if (disabled) return;
    e.preventDefault();
    toggle();
  };

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <button
        ref={ref}
        id={inputId}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        aria-invalid={error || undefined}
        data-state={visual}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative inline-flex items-center justify-center shrink-0",
          "rounded border-2 transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          sizing.box,
          visual === "unchecked" && [
            "bg-surface-container-highest",
            error ? "border-error" : "border-outline-variant",
            "hover:border-outline",
          ],
          visual === "checked" && [
            "bg-primary border-primary",
            "hover:brightness-110",
          ],
          visual === "indeterminate" && [
            "bg-primary border-primary",
          ],
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer active:scale-95"
        )}
        {...rest}
      >
        {visual === "checked" && (
          <svg
            viewBox="0 0 16 16"
            width={sizing.icon}
            height={sizing.icon}
            aria-hidden="true"
            className="text-on-primary animate-scale-in pointer-events-none"
          >
            <path
              d="M3 8.5l3.2 3.2L13 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {visual === "indeterminate" && (
          <svg
            viewBox="0 0 16 16"
            width={sizing.icon}
            height={sizing.icon}
            aria-hidden="true"
            className="text-on-primary pointer-events-none"
          >
            <path
              d="M3.5 8h9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {name && <input ref={hiddenRef} type="hidden" name={name} defaultValue={checked ? (value ?? "true") : ""} />}

      {(label || description) && (
        <div className="flex flex-col gap-0.5 leading-tight">
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "font-label-md text-label-md cursor-pointer select-none",
                error ? "text-error" : "text-on-surface",
                disabled && "cursor-not-allowed"
              )}
              onClick={handleLabelClick}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="font-body-sm text-body-sm text-on-surface-variant">{description}</p>
          )}
        </div>
      )}
    </div>
  );
});

export { Checkbox, type CheckboxProps, type CheckboxSize, type CheckboxState };
