"use client";

import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-label-sm text-label-sm transition-all duration-500 ease-spring",
                    isCompleted && "bg-primary text-on-primary",
                    isCurrent && "bg-primary text-on-primary ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-surface-container-highest text-on-surface-variant"
                  )}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 font-label-sm text-label-sm whitespace-nowrap transition-colors duration-300",
                    isCurrent && "text-primary font-medium",
                    isCompleted && "text-primary",
                    !isCompleted && !isCurrent && "text-on-surface-variant"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 h-px mx-4 relative">
                  <div className="absolute inset-0 bg-outline-variant" />
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 bg-primary transition-all duration-700 ease-spring",
                      isCompleted ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { Stepper, type Step };
