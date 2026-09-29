import React from 'react';
import { Package, Eye, Edit, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Saree } from '@/types';
import { categories } from './inventoryConstants';

interface ProductTableProps {
  products: Saree[];
  selectedForPrint: string[];
  onTogglePrint: (id: string) => void;
  onView: (product: Saree) => void;
  onEdit: (product: Saree) => void;
  onPrint: (product: Saree) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  selectedForPrint,
  onTogglePrint,
  onView,
  onEdit,
  onPrint,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Available</Badge>;
      case 'sold':
        return <Badge className="bg-muted text-muted-foreground">Sold</Badge>;
      case 'reserved':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Reserved</Badge>;
      case 'damaged':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Damaged</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryLabel = (value: string) => {
    return categories.find((c) => c.value === value)?.label || value;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border/70">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="font-bold text-foreground">Product</TableHead>
            <TableHead className="font-bold text-foreground">Category</TableHead>
            <TableHead className="font-bold text-foreground text-right">MRP</TableHead>
            <TableHead className="font-bold text-foreground text-right">Selling Price</TableHead>
            <TableHead className="font-bold text-foreground text-center">Stock</TableHead>
            <TableHead className="font-bold text-foreground">Location</TableHead>
            <TableHead className="font-bold text-foreground">Status</TableHead>
            <TableHead className="w-[100px] text-right font-bold text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="font-medium text-sm">No products found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your filters or add a new product</p>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedForPrint.includes(product.id)}
                    onChange={() => onTogglePrint(product.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {product.sareeCode} • {product.barcode}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs font-normal">
                    {getCategoryLabel(product.category)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground line-through font-mono">
                  ₹{product.mrp?.toLocaleString('en-IN') || 0}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-sm text-foreground">
                  ₹{product.sellingPrice?.toLocaleString('en-IN') || 0}
                </TableCell>
                <TableCell className="text-center font-mono text-xs">
                  <Badge variant="outline" className="px-2 py-0.5">
                    {product.stockQty || 0} pcs
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {product.rackLocation || '-'}
                </TableCell>
                <TableCell>{getStatusBadge(product.status)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onView(product)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(product)}
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary"
                      onClick={() => onPrint(product)}
                      title="Print Barcode Labels"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
