import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Supplier } from '@/types';

interface SupplierPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onConfirm: (supplierId: string, paymentAmt: number) => Promise<void>;
}

export const SupplierPaymentDialog: React.FC<SupplierPaymentDialogProps> = ({
  open,
  onOpenChange,
  supplier,
  onConfirm,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<string>('Cash');
  const [remarks, setRemarks] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!supplier) return null;

  const handleSubmit = async () => {
    const paymentVal = parseFloat(amount);
    if (isNaN(paymentVal) || paymentVal <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      setLoading(true);
      await onConfirm(supplier.id, paymentVal);
      setAmount('');
      setRemarks('');
      onOpenChange(false);
    } catch (e) {
      toast.error('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment to Supplier</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3 text-sm">
          <div className="p-3 bg-muted rounded-md space-y-1">
            <p className="font-semibold text-sm">{supplier.name}</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Outstanding Payable:</span>
              <strong className="text-destructive font-mono">
                ₹{supplier.pendingDue.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Amount Paid (₹) *</Label>
            <Input
              type="number"
              min="1"
              max={supplier.pendingDue || 9999999}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Payment Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer / NEFT</SelectItem>
                <SelectItem value="UPI">UPI / GPay / PhonePe</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Remarks / Reference No. (Optional)</Label>
            <Input
              placeholder="e.g. UTR / Cheque No / Notes"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Confirm Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
