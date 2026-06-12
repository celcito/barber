import { cn } from "@/lib/utils";

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number;
  gap?: string;
}

function BentoGrid({ className, children, ...props }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-gutter", className)} {...props}>
      {children}
    </div>
  );
}

interface BentoItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: string;
  rowSpan?: string;
}

function BentoItem({ className, children, ...props }: BentoItemProps) {
  return (
    <div className={cn("bg-surface-container border border-outline-variant p-stack-md rounded", className)} {...props}>
      {children}
    </div>
  );
}

export { BentoGrid, BentoItem };
