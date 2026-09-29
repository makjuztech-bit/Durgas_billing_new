import React from 'react';
import { Check, Verified } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReturnCartItem } from '@/components/returns/returnsTypes';

interface ReturnItemsTableProps {
  returnItems: ReturnCartItem[];
  onToggleSelection: (barcode: string) => void;
  onUpdateReturnQty: (barcode: string, qty: number) => void;
  onUpdateCondition: (barcode: string, condition: 'good' | 'damaged' | 'altered') => void;
}

export const ReturnItemsTable: React.FC<ReturnItemsTableProps> = ({
  returnItems,
  onToggleSelection,
  onUpdateReturnQty,
  onUpdateCondition,
}) => {
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[80px]">Return</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Original Qty</TableHead>
            <TableHead>Returned</TableHead>
            <TableHead>Return Qty</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returnItems.map((item) => (
            <TableRow
              key={item.barcode}
              className={item.selected ? 'bg-primary/5 transition-colors' : ''}
            >
              <TableCell>
                <div className="flex items-center justify-center">
                  {item.isVerified ? (
                    <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white border-0">
                      <Check className="h-4 w-4" />
                    </Badge>
                  ) : (
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => onToggleSelection(item.barcode)}
                      className="accent-primary h-5 w-5 rounded border-gray-300"
                    />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold flex items-center gap-1">
                    {item.name}
                    {item.isVerified && <Verified className="h-3 w-3 text-primary" />}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">{item.barcode}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{item.qty}</TableCell>
              <TableCell>
                <Badge variant={item.returnedQty > 0 ? 'destructive' : 'outline'}>
                  {item.returnedQty}
                </Badge>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.returnQty}
                  onChange={(e) => onUpdateReturnQty(item.barcode, parseInt(e.target.value, 10))}
                  className="w-20 h-8"
                  disabled={!item.selected}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={item.condition}
                  onValueChange={(v: 'good' | 'damaged' | 'altered') =>
                    onUpdateCondition(item.barcode, v)
                  }
                  disabled={!item.selected}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good (Salable)</SelectItem>
                    <SelectItem value="damaged">Damaged (30% off)</SelectItem>
                    <SelectItem value="altered">Altered (50% off)</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right font-bold text-lg">
                ₹{item.sellingPrice.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
