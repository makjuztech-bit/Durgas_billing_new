import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface StepGstSettingsProps {
  gstEnabled: boolean;
  setGstEnabled: (val: boolean) => void;
  gstNumber: string;
  setGstNumber: (val: string) => void;
  gstType: string;
  setGstType: (val: string) => void;
}

export const StepGstSettings: React.FC<StepGstSettingsProps> = ({
  gstEnabled,
  setGstEnabled,
  gstNumber,
  setGstNumber,
  gstType,
  setGstType,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium">Enable GST</p>
          <p className="text-sm text-muted-foreground">Turn on if you have GST registration</p>
        </div>
        <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} />
      </div>

      {gstEnabled && (
        <>
          <div className="space-y-2">
            <Label htmlFor="gstNumber">GST Number *</Label>
            <Input
              id="gstNumber"
              placeholder="Enter 15-digit GSTIN"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              maxLength={15}
            />
          </div>

          <div className="space-y-3">
            <Label>GST Type</Label>
            <RadioGroup value={gstType} onValueChange={setGstType}>
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="regular" id="regular" />
                <Label htmlFor="regular" className="flex-1 cursor-pointer">
                  <span className="font-medium">Regular</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    GST invoice with tax breakup
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="composition" id="composition" />
                <Label htmlFor="composition" className="flex-1 cursor-pointer">
                  <span className="font-medium">Composition</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    No tax breakup, limited turnover
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </>
      )}
    </div>
  );
};
