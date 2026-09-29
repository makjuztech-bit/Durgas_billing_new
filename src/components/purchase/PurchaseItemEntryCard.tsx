import React from 'react';
import { Plus, Barcode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface PurchaseItemEntryCardProps {
  barcode: string;
  setBarcode: (val: string) => void;
  itemName: string;
  setItemName: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  costPrice: number;
  setCostPrice: (val: number) => void;
  mrp: number;
  setMrp: (val: number) => void;
  sellingPrice: number;
  setSellingPrice: (val: number) => void;
  qty: number;
  setQty: (val: number) => void;
  onAddItem: () => void;
}

export const PurchaseItemEntryCard: React.FC<PurchaseItemEntryCardProps> = ({
  barcode,
  setBarcode,
  itemName,
  setItemName,
  category,
  setCategory,
  costPrice,
  setCostPrice,
  mrp,
  setMrp,
  sellingPrice,
  setSellingPrice,
  qty,
  setQty,
  onAddItem,
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label>Product Code / Barcode</Label>
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter Product Code"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label>Product Name</Label>
            <Input
              placeholder="Enter jewel name / description"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Diamond">Diamond</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Stone">Stone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cost Price</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={costPrice}
              onChange={(e) => setCostPrice(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>MRP</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={mrp}
              onChange={(e) => setMrp(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Selling Price</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Qty</Label>
            <Input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <Button onClick={onAddItem} className="w-full">
              Add to List
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
