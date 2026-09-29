import React, { useState, useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';
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

interface AddEditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Saree | null;
  onSave: (productData: Partial<Saree>) => Promise<void>;
}

export const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  open,
  onOpenChange,
  initialData,
  onSave,
}) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    nameTamil: '',
    barcode: '',
    category: 'General',
    rackLocation: '',
    purchasePrice: 0,
    sellingPrice: 0,
    mrp: 0,
    stockQty: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        nameTamil: initialData.nameTamil || '',
        barcode: initialData.barcode || '',
        category: initialData.category || 'General',
        rackLocation: initialData.rackLocation || '',
        purchasePrice: initialData.purchasePrice || 0,
        sellingPrice: initialData.sellingPrice || 0,
        mrp: initialData.mrp || 0,
        stockQty: initialData.stockQty || 1,
      });
    } else {
      const autoCode = `SK-${Math.floor(100000 + Math.random() * 900000)}`;
      setFormData({
        name: '',
        nameTamil: '',
        barcode: autoCode,
        category: 'General',
        rackLocation: '',
        purchasePrice: 0,
        sellingPrice: 0,
        mrp: 0,
        stockQty: 1,
      });
    }
  }, [initialData, open]);

  const handleGenerateBarcode = () => {
    const code = `SK-${Math.floor(100000 + Math.random() * 900000)}`;
    setFormData((prev) => ({ ...prev, barcode: code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Product Name is required.');
      return;
    }
    if (!formData.barcode.trim()) {
      toast.error('Barcode is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        mrp: Number(formData.mrp) || Number(formData.sellingPrice) || 0,
        stockQty: Number(formData.stockQty) || 0,
        category: 'General',
      });
      onOpenChange(false);
    } catch {
      toast.error('Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Inventory Product'}</DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing ? 'Update price, stock, and location.' : 'Only Name and Barcode are required.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
          <div>
            <Label className="text-xs font-semibold">Product Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. 22K Gold Chain"
              className="h-8 text-xs mt-1 font-medium"
              required
            />
          </div>

          <div>
            <Label className="text-[11px] text-muted-foreground">Product Name in Tamil (Optional)</Label>
            <Input
              value={formData.nameTamil}
              onChange={(e) => setFormData((prev) => ({ ...prev, nameTamil: e.target.value }))}
              placeholder="e.g. 22K தங்க சங்கிலி"
              className="h-8 text-xs mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Barcode *</Label>
              <button
                type="button"
                onClick={handleGenerateBarcode}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                Auto-Generate
              </button>
            </div>
            <Input
              value={formData.barcode}
              onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
              placeholder="e.g. SK-100201"
              className="h-8 text-xs mt-1 font-mono uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Selling Price (₹) *</Label>
              <Input
                type="number"
                value={formData.sellingPrice || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                placeholder="0.00"
                className="h-8 text-xs mt-1 font-bold text-primary"
                required
              />
            </div>
            <div>
              <Label className="text-xs">Cost / Purchase Price (₹)</Label>
              <Input
                type="number"
                value={formData.purchasePrice || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                placeholder="0.00"
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Current Stock Qty *</Label>
              <Input
                type="number"
                value={formData.stockQty}
                onChange={(e) => setFormData((prev) => ({ ...prev, stockQty: Number(e.target.value) }))}
                min="0"
                className="h-8 text-xs mt-1 font-bold"
                required
              />
            </div>
            <div>
              <Label className="text-xs">Rack / Shelf Location</Label>
              <Input
                value={formData.rackLocation}
                onChange={(e) => setFormData((prev) => ({ ...prev, rackLocation: e.target.value }))}
                placeholder="e.g. Rack A-12"
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
              <Check className="h-4 w-4" />
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
