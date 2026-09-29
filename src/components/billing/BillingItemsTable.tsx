import React from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BillReceiptItem } from './BillReceipt';

interface BillingItemsTableProps {
  items: BillReceiptItem[];
  onUpdateItem: (id: string, updates: Partial<BillReceiptItem>) => void;
  onRemoveItem: (id: string) => void;
}

export const BillingItemsTable: React.FC<BillingItemsTableProps> = ({
  items,
  onUpdateItem,
  onRemoveItem,
}) => {
  return (
    <Card className="shadow-xs overflow-hidden">
      <CardHeader className="py-2.5 px-4 bg-muted/20 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold">
          Current Bill Items ({items.length})
        </CardTitle>
        <span className="text-[10px] text-muted-foreground">Adjust quantity, discount, or tax per row</span>
      </CardHeader>
      <div className="overflow-x-auto max-h-[340px]">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] sticky top-0">
            <tr>
              <th className="p-2.5">Item</th>
              <th className="p-2.5 text-right w-16">Qty</th>
              <th className="p-2.5 text-right w-20">Rate (₹)</th>
              <th className="p-2.5 text-right w-16">Disc %</th>
              <th className="p-2.5 text-right w-16">GST %</th>
              <th className="p-2.5 text-right w-24">Net Total</th>
              <th className="p-2.5 text-center w-10">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-muted/20 transition-colors">
                <td className="p-2.5">
                  <span className="font-semibold block">{item.name}</span>
                  {item.barcode && (
                    <span className="text-[10px] text-muted-foreground font-mono">{item.barcode}</span>
                  )}
                </td>
                <td className="p-2.5 text-right">
                  <Input
                    type="number"
                    value={item.qty}
                    min="1"
                    onChange={(e) => onUpdateItem(item.id || '', { qty: Number(e.target.value) || 1 })}
                    className="h-6 w-14 text-right text-xs p-1"
                  />
                </td>
                <td className="p-2.5 text-right font-mono">₹{item.sellingPrice}</td>
                <td className="p-2.5 text-right">
                  <Input
                    type="number"
                    value={item.discountPercent || 0}
                    min="0"
                    max="100"
                    onChange={(e) => onUpdateItem(item.id || '', { discountPercent: Number(e.target.value) || 0 })}
                    className="h-6 w-14 text-right text-xs p-1"
                  />
                </td>
                <td className="p-2.5 text-right">
                  <Input
                    type="number"
                    value={item.taxPercent || 0}
                    onChange={(e) => onUpdateItem(item.id || '', { taxPercent: Number(e.target.value) || 0 })}
                    className="h-6 w-14 text-right text-xs p-1"
                  />
                </td>
                <td className="p-2.5 text-right font-mono font-bold text-primary">
                  ₹{(item.total || 0).toFixed(2)}
                </td>
                <td className="p-2.5 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id || '')}
                    className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                  No items added yet. Search or scan items above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
