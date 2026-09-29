import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface StepBillingSettingsProps {
  billingType: string;
  setBillingType: (val: string) => void;
  invoicePrefix: string;
  setInvoicePrefix: (val: string) => void;
  billSeries: string;
  setBillSeries: (val: string) => void;
  stockType: string;
  setStockType: (val: string) => void;
  returnDays: string;
  setReturnDays: (val: string) => void;
  maxDiscount: string;
  setMaxDiscount: (val: string) => void;
}

export const StepBillingSettings: React.FC<StepBillingSettingsProps> = ({
  billingType,
  setBillingType,
  invoicePrefix,
  setInvoicePrefix,
  billSeries,
  setBillSeries,
  stockType,
  setStockType,
  returnDays,
  setReturnDays,
  maxDiscount,
  setMaxDiscount,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Billing Type</Label>
        <RadioGroup value={billingType} onValueChange={setBillingType}>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { value: 'retail', label: 'Retail Only' },
              { value: 'wholesale', label: 'Wholesale Only' },
              { value: 'both', label: 'Both' },
            ].map((option) => (
              <div
                key={option.value}
                className={cn(
                  'flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-colors',
                  billingType === option.value && 'border-primary bg-primary/5'
                )}
                onClick={() => setBillingType(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer font-medium">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
          <Input
            id="invoicePrefix"
            placeholder="INV"
            value={invoicePrefix}
            onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
            maxLength={5}
          />
          <p className="text-xs text-muted-foreground">
            Example: {invoicePrefix}-{billSeries}-0001
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="billSeries">Bill Series / Year</Label>
          <Input
            id="billSeries"
            placeholder="2024"
            value={billSeries}
            onChange={(e) => setBillSeries(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Jewelry Stock Type</Label>
        <RadioGroup value={stockType} onValueChange={setStockType}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className={cn(
                'rounded-lg border p-4 cursor-pointer transition-colors',
                stockType === 'unique' && 'border-primary bg-primary/5'
              )}
              onClick={() => setStockType('unique')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unique" id="unique" />
                <Label htmlFor="unique" className="cursor-pointer font-medium">
                  Unique (1 Piece)
                </Label>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Each jewelry item has a unique barcode
              </p>
            </div>
            <div
              className={cn(
                'rounded-lg border p-4 cursor-pointer transition-colors',
                stockType === 'bulk' && 'border-primary bg-primary/5'
              )}
              onClick={() => setStockType('bulk')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bulk" id="bulk" />
                <Label htmlFor="bulk" className="cursor-pointer font-medium">
                  Bulk Quantity
                </Label>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Same barcode, track quantity
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="returnDays">Default Return Days</Label>
          <Select value={returnDays} onValueChange={setReturnDays}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="3">3 Days</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="15">15 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxDiscount">Max Discount (%)</Label>
          <Input
            id="maxDiscount"
            type="number"
            placeholder="20"
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            max={50}
          />
        </div>
      </div>
    </div>
  );
};
