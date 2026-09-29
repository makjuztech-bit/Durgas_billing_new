import React from 'react';
import { Truck, CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Supplier } from '@/types';

interface PurchaseSupplierCardProps {
  supplier: string;
  setSupplier: (val: string) => void;
  suppliers: Supplier[];
  billNo: string;
  setBillNo: (val: string) => void;
  billDate: string;
  setBillDate: (val: string) => void;
  purchaseType: string;
  setPurchaseType: (val: string) => void;
}

export const PurchaseSupplierCard: React.FC<PurchaseSupplierCardProps> = ({
  supplier,
  setSupplier,
  suppliers,
  billNo,
  setBillNo,
  billDate,
  setBillDate,
  purchaseType,
  setPurchaseType,
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="h-5 w-5" /> Supplier Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Supplier Name</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Select Supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Bill Number</Label>
            <Input
              placeholder="Enter Invoice No"
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Bill Date</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                className="pl-9"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Purchase Type</Label>
            <Select value={purchaseType} onValueChange={setPurchaseType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gst">GST Purchase</SelectItem>
                <SelectItem value="nongst">Non-GST / Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
