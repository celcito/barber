import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card" | "circle" | "rect";
}

function Skeleton({ className, variant = "text", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-container-highest rounded",
        variant === "text" && "h-4 w-full",
        variant === "card" && "h-48 w-full rounded",
        variant === "circle" && "h-10 w-10 rounded-full",
        variant === "rect" && "h-32 w-full rounded",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export { Skeleton };
