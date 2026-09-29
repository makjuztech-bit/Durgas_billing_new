import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Supplier, Saree } from '@/types';

interface SupplierHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  products: Saree[];
}

export const SupplierHistoryDialog: React.FC<SupplierHistoryDialogProps> = ({
  open,
  onOpenChange,
  supplier,
  products,
}) => {
  if (!supplier) return null;

  const matchedProducts = products.filter(
    (s) => (s.supplier || '').toLowerCase() === supplier.name.toLowerCase()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Supplied Inventory - {supplier.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-2">
          {matchedProducts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No inventory products recorded from this supplier yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Cost (₹)</TableHead>
                  <TableHead className="text-right">Selling (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchedProducts.map((prod) => (
                  <TableRow key={prod.id}>
                    <TableCell className="font-mono text-xs">{prod.sareeCode}</TableCell>
                    <TableCell className="font-medium text-xs">{prod.name}</TableCell>
                    <TableCell className="text-right text-xs">{prod.stockQty}</TableCell>
                    <TableCell className="text-right text-xs">₹{prod.purchasePrice}</TableCell>
                    <TableCell className="text-right text-xs font-semibold">
                      ₹{prod.sellingPrice}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
