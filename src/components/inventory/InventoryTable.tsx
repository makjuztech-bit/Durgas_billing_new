import React from 'react';
import { MoreHorizontal, Edit, PackagePlus, Printer, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Saree } from '@/types';

interface InventoryTableProps {
  products: Saree[];
  onEdit: (product: Saree) => void;
  onRestock: (product: Saree) => void;
  onPrintBarcode: (product: Saree) => void;
  onDelete: (id: string) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onEdit,
  onRestock,
  onPrintBarcode,
  onDelete,
}) => {
  const getStockBadge = (qty: number) => {
    if (qty <= 0) {
      return <Badge variant="destructive" className="text-[10px]">Out of Stock (0)</Badge>;
    }
    if (qty <= 3) {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
          Low Stock ({qty})
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
        In Stock ({qty})
      </Badge>
    );
  };

  return (
    <Card className="shadow-xs overflow-hidden border-border/70">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 text-[11px]">
              <TableHead className="w-[30%]">Product Name & Barcode</TableHead>
              <TableHead className="w-[15%]">Rack / Location</TableHead>
              <TableHead className="w-[15%] text-right">Cost Price</TableHead>
              <TableHead className="w-[15%] text-right">Selling Price</TableHead>
              <TableHead className="w-[15%] text-center">Stock Level</TableHead>
              <TableHead className="w-[10%] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <tbody className="divide-y divide-border text-xs">
            {products.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                <TableCell className="py-3">
                  <div>
                    <span className="font-semibold text-foreground block">{item.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {item.barcode || 'NO-BARCODE'}
                      </span>
                      {item.nameTamil && (
                        <span className="text-[11px] text-muted-foreground font-tamil">{item.nameTamil}</span>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3 font-medium text-muted-foreground">
                  {item.rackLocation || 'General Store'}
                </TableCell>

                <TableCell className="py-3 text-right font-mono text-muted-foreground">
                  ₹{item.purchasePrice ? item.purchasePrice.toLocaleString('en-IN') : '0'}
                </TableCell>

                <TableCell className="py-3 text-right font-mono font-bold text-primary">
                  ₹{item.sellingPrice ? item.sellingPrice.toLocaleString('en-IN') : '0'}
                </TableCell>

                <TableCell className="py-3 text-center">
                  {getStockBadge(item.stockQty || 0)}
                </TableCell>

                <TableCell className="py-3 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs">
                      <DropdownMenuLabel>Item Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(item)} className="gap-2">
                        <Edit className="h-3.5 w-3.5 text-blue-600" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRestock(item)} className="gap-2">
                        <PackagePlus className="h-3.5 w-3.5 text-emerald-600" />
                        Quick Restock (+Qty)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPrintBarcode(item)} className="gap-2">
                        <Printer className="h-3.5 w-3.5 text-amber-600" />
                        Print Barcode Sticker
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(item.id)}
                        className="gap-2 text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Item
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-xs italic">
                  No inventory products found matching your search.
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );
};
