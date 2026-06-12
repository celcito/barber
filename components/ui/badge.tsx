import { cn } from "@/lib/utils";

type BadgeVariant = "confirmado" | "pendente" | "cancelado" | "default";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  confirmado: "bg-primary/10 text-primary border border-primary/20",
  pendente: "bg-tertiary-container/10 text-tertiary border border-tertiary/20",
  cancelado: "bg-error/10 text-error border border-error/20",
  default: "bg-surface-variant text-on-surface-variant border border-outline-variant",
};

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {variant === "confirmado" && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      )}
      {children}
    </span>
  );
}

export { Badge, type BadgeVariant };
