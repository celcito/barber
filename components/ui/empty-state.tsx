import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {icon && (
        <div className="w-16 h-16 mb-6 text-on-surface-variant opacity-50">
          {icon}
        </div>
      )}
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary text-on-primary px-6 py-3 font-label-md text-label-md rounded hover:brightness-110 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export { EmptyState };
