import React, { useState, useEffect } from 'react';
import { PackagePlus, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Saree } from '@/types';
import { toast } from 'sonner';

interface QuickRestockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Saree | null;
  allProducts: Saree[];
  onRestock: (productId: string, adjustQty: number, reason?: string, referenceNo?: string) => Promise<unknown>;
}

export const QuickRestockModal: React.FC<QuickRestockModalProps> = ({
  open,
  onOpenChange,
  product,
  allProducts,
  onRestock,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [reason, setReason] = useState<string>('Restock / Inward Shipment');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedProductId(product.id || '');
    } else if (allProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(allProducts[0].id || '');
    }
  }, [product, allProducts, open, selectedProductId]);

  const activeProduct = allProducts.find((p) => p.id === selectedProductId) || product;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Please select a product to restock.');
      return;
    }
    if (!adjustQty || adjustQty <= 0) {
      toast.error('Please enter a valid restock quantity greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRestock(selectedProductId, adjustQty, reason, referenceNo);
      onOpenChange(false);
      setAdjustQty(5);
      setReferenceNo('');
    } catch {
      toast.error('Failed to restock product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-emerald-600" />
            Quick Restock (+Qty)
          </DialogTitle>
          <DialogDescription className="text-xs">
            Add inward inventory units with automatic SQLite stock tallying and audit logging.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
          <div>
            <Label className="text-xs font-semibold">Target Product</Label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs mt-1 font-medium"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.barcode}) - Current: {p.stockQty} in stock
                </option>
              ))}
            </select>
          </div>

          <div className="bg-muted/40 p-3 rounded-md border flex justify-between items-center text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Current Stock</span>
              <strong className="text-sm font-bold text-foreground">{activeProduct?.stockQty || 0} units</strong>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block text-[11px]">New Stock After Restock</span>
              <strong className="text-sm font-bold text-emerald-600">
                {(activeProduct?.stockQty || 0) + (Number(adjustQty) || 0)} units
              </strong>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Units to Add (+Qty) *</Label>
            <Input
              type="number"
              value={adjustQty}
              onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
              min="1"
              className="h-8 text-xs mt-1 font-bold text-emerald-600"
              required
            />
          </div>

          <div>
            <Label className="text-xs">Reason / Entry Type</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. New Shipment / Factory Inward"
              className="h-8 text-xs mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Supplier Reference / Invoice # (Optional)</Label>
            <Input
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="e.g. INV-2026-981"
              className="h-8 text-xs mt-1"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              <Check className="h-4 w-4" />
              Confirm Restock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
