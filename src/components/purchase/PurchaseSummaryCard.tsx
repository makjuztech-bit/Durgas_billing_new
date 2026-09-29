import React from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PurchaseItem } from '@/types';

interface PurchaseSummaryCardProps {
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  setPaidAmount: (val: number) => void;
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  onSavePurchase: () => void;
}

export const PurchaseSummaryCard: React.FC<PurchaseSummaryCardProps> = ({
  items,
  totalAmount,
  paidAmount,
  setPaidAmount,
  paymentMethod,
  setPaymentMethod,
  onSavePurchase,
}) => {
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
  const dueBalance = totalAmount - paidAmount;

  return (
    <Card className="border-0 shadow-sm sticky top-20">
      <CardHeader>
        <CardTitle>Purchase Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Qty</span>
            <span className="font-medium">{totalQty}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="font-bold">₹{(totalAmount || 0).toLocaleString()}</span>
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <Label className="text-primary font-semibold">Payment Details</Label>
          <div className="space-y-1">
            <Label className="text-xs">Initial Paid Amount</Label>
            <Input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              placeholder="Enter amount paid"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="UPI">UPI / Digital</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium">Due Balance:</span>
            <span className="text-lg font-bold text-destructive">
              ₹{dueBalance.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="pt-4 grid gap-3">
          <Button size="lg" onClick={onSavePurchase}>
            <Save className="mr-2 h-5 w-5" />
            Save Purchase
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
