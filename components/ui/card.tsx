"use client";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

function Card({ className, hover, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-container border border-outline-variant p-stack-md rounded",
        hover && "hover:border-primary/50 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-outline-variant", className)} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent, CardFooter };
