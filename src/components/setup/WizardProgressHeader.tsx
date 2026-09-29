import React from 'react';
import { LucideIcon, Check, Store, Building2, FileText, Printer, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: number;
  title: string;
  icon: LucideIcon;
}

export const SETUP_STEPS: WizardStep[] = [
  { id: 1, title: 'Company Info', icon: Store },
  { id: 2, title: 'GST Settings', icon: FileText },
  { id: 3, title: 'Billing Settings', icon: Settings },
  { id: 4, title: 'Print & Language', icon: Printer },
  { id: 5, title: 'Branch Setup', icon: Building2 },
  { id: 6, title: 'Finish', icon: Check },
];


interface WizardProgressHeaderProps {
  steps: WizardStep[];
  currentStep: number;
}

export const WizardProgressHeader: React.FC<WizardProgressHeaderProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  currentStep > step.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : currentStep === step.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className="mt-1 hidden text-xs sm:block">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-2',
                  currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
