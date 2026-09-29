import React from 'react';
import { RotateCcw, Receipt as ReceiptIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BillingHeaderProps {
  itemCount: number;
  paperType: 'thermal' | 'a4';
  onPaperTypeChange: (type: 'thermal' | 'a4') => void;
  onClearForm: () => void;
  onHoldBill?: () => void;
}

export const BillingHeader: React.FC<BillingHeaderProps> = ({
  itemCount,
  paperType,
  onPaperTypeChange,
  onClearForm,
  onHoldBill,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-xs">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Durgas POS Billing</h1>
          {itemCount > 0 && (
            <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Draft Saved ({itemCount} items)
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time stock deduction, item-level discounts, GST tax calculation & print support.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center border rounded-md p-1 bg-muted/40">
          <Button
            type="button"
            variant={paperType === 'thermal' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPaperTypeChange('thermal')}
            className="h-7 text-xs px-2.5"
          >
            <ReceiptIcon className="h-3.5 w-3.5 mr-1" />
            Thermal 80mm
          </Button>
          <Button
            type="button"
            variant={paperType === 'a4' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPaperTypeChange('a4')}
            className="h-7 text-xs px-2.5"
          >
            A4 Invoice
          </Button>
        </div>

        {onHoldBill && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onHoldBill}
            disabled={itemCount === 0}
            className="h-8 text-xs text-amber-600 hover:bg-amber-600/10 border-amber-600/30"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Hold Bill
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClearForm}
          className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Clear Form
        </Button>
      </div>
    </div>
  );
};
