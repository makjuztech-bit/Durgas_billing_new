import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Saree } from '@/types';
import { categories, zariTypes, borderTypes } from './inventoryConstants';

interface ProductViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Saree | null;
}

export const ProductViewDialog: React.FC<ProductViewDialogProps> = ({
  open,
  onOpenChange,
  product,
}) => {
  if (!product) return null;

  const categoryLabel = categories.find((c) => c.value === product.category)?.label || product.category;
  const zariLabel = zariTypes.find((z) => z.value === product.zariType)?.label || product.zariType || '-';
  const borderLabel = borderTypes.find((b) => b.value === product.borderType)?.label || product.borderType || '-';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Product Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Product Code</p>
              <p className="font-mono font-semibold text-sm">{product.sareeCode}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Barcode</p>
              <p className="font-mono font-semibold text-sm">{product.barcode}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs text-muted-foreground">Product Name</p>
            <p className="font-semibold text-base">{product.name}</p>
            {product.nameTamil && (
              <p className="text-xs text-muted-foreground">{product.nameTamil}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-medium text-sm">{categoryLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Zari / Pattern</p>
              <p className="font-medium text-sm">{zariLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Border / Style</p>
              <p className="font-medium text-sm">{borderLabel}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Purchase Cost</p>
              <p className="font-medium text-sm font-mono">₹{product.purchasePrice?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Selling Price</p>
              <p className="font-bold text-sm font-mono text-primary">
                ₹{product.sellingPrice?.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">MRP</p>
              <p className="font-medium text-sm font-mono line-through text-muted-foreground">
                ₹{product.mrp?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-1">
            <div>
              <p className="text-xs text-muted-foreground">Stock Quantity</p>
              <p className="font-semibold text-sm">{product.stockQty || 0} pcs</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rack Location</p>
              <p className="font-mono text-sm">{product.rackLocation || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Supplier</p>
              <p className="text-sm font-medium">{product.supplier || 'Direct purchase'}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
