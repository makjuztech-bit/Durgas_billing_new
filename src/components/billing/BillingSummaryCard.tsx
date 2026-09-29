import React from 'react';
import { Save, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface BillingSummaryCardProps {
  itemCount: number;
  totalQty: number;
  subTotal: number;
  totalDiscountAmount: number;
  totalTaxAmount: number;
  roundOff: number;
  grandTotal: number;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onSaveBill: (print: boolean) => void;
  disabled?: boolean;
}

export const BillingSummaryCard: React.FC<BillingSummaryCardProps> = ({
  itemCount,
  totalQty,
  subTotal,
  totalDiscountAmount,
  totalTaxAmount,
  roundOff,
  grandTotal,
  paymentMethod,
  onPaymentMethodChange,
  onSaveBill,
  disabled = false,
}) => {
  return (
    <Card className="shadow-sm border-primary/20">
      <CardHeader className="py-2.5 px-4 bg-primary/5 border-b">
        <CardTitle className="text-xs font-semibold flex items-center justify-between">
          <span>Billing Summary</span>
          <Badge variant="outline" className="text-[10px]">
            {itemCount} Items | {totalQty} Qty
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3.5 space-y-3">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Gross Subtotal</span>
            <span className="font-mono font-medium text-foreground">₹{subTotal.toFixed(2)}</span>
          </div>

          {totalDiscountAmount > 0 && (
            <div className="flex justify-between text-amber-600 font-medium">
              <span>Total Item Discounts</span>
              <span className="font-mono">-₹{totalDiscountAmount.toFixed(2)}</span>
            </div>
          )}

          {totalTaxAmount > 0 && (
            <div className="flex justify-between text-sky-600 font-medium">
              <span>Total Item GST</span>
              <span className="font-mono">+₹{totalTaxAmount.toFixed(2)}</span>
            </div>
          )}

          {roundOff !== 0 && (
            <div className="flex justify-between text-muted-foreground text-[11px]">
              <span>Round-off</span>
              <span className="font-mono">
                {roundOff > 0 ? `+₹${roundOff}` : `-₹${Math.abs(roundOff)}`}
              </span>
            </div>
          )}

          <div className="border-t pt-2 flex justify-between items-baseline font-bold">
            <span className="text-sm text-primary uppercase">Grand Total</span>
            <span className="text-xl font-extrabold text-primary font-mono">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Label className="text-[11px] font-semibold text-muted-foreground">Payment Mode</Label>
          <div className="grid grid-cols-4 gap-1 mt-1.5">
            {['Cash', 'UPI', 'Card', 'Credit'].map((mode) => (
              <Button
                key={mode}
                type="button"
                variant={paymentMethod === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPaymentMethodChange(mode)}
                className="h-7 text-[11px] px-1.5"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSaveBill(false)}
            disabled={disabled}
            className="h-9 text-xs gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Save Only
          </Button>

          <Button
            type="button"
            onClick={() => onSaveBill(true)}
            disabled={disabled}
            className="h-9 text-xs gap-1.5 bg-primary hover:bg-primary/90 font-bold"
          >
            <Printer className="h-3.5 w-3.5" />
            Save & Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
