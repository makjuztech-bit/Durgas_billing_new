import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface StepPrintLanguageProps {
  printType: string;
  setPrintType: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
}

export const StepPrintLanguage: React.FC<StepPrintLanguageProps> = ({
  printType,
  setPrintType,
  language,
  setLanguage,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Print Type</Label>
        <RadioGroup value={printType} onValueChange={setPrintType}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className={cn(
                'rounded-lg border p-4 cursor-pointer transition-colors',
                printType === 'thermal' && 'border-primary bg-primary/5'
              )}
              onClick={() => setPrintType('thermal')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="thermal" id="thermal" />
                <Label htmlFor="thermal" className="cursor-pointer font-medium">
                  Thermal (80mm)
                </Label>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Receipt printer, compact bills
              </p>
            </div>
            <div
              className={cn(
                'rounded-lg border p-4 cursor-pointer transition-colors',
                printType === 'a4' && 'border-primary bg-primary/5'
              )}
              onClick={() => setPrintType('a4')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="a4" id="a4" />
                <Label htmlFor="a4" className="cursor-pointer font-medium">
                  A4 Paper
                </Label>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Full page invoice</p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>Invoice Language</Label>
        <RadioGroup value={language} onValueChange={setLanguage}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div
              className={cn(
                'rounded-lg border p-4 cursor-pointer transition-colors',
                language === 'english' && 'border-primary bg-primary/5'
              )}
              onClick={() => setLanguage('english')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="english" id="english" />
                <Label htmlFor="english" className="cursor-pointer font-medium">
                  English Only
                </Label>
              </div>
            </div>
            <div
              className={cn(
                'rounded-lg border p-4 cursor-pointer transition-colors',
                language === 'tamil' && 'border-primary bg-primary/5'
              )}
              onClick={() => setLanguage('tamil')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tamil" id="tamil" />
                <Label htmlFor="tamil" className="cursor-pointer font-medium font-tamil">
                  தமிழ் மட்டும்
                </Label>
              </div>
            </div>
            <div
              className={cn(
                'rounded-lg border p-4 cursor-pointer transition-colors',
                language === 'both' && 'border-primary bg-primary/5'
              )}
              onClick={() => setLanguage('both')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="cursor-pointer font-medium">
                  Tamil + English
                </Label>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
