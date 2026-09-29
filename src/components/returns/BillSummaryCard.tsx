import React from 'react';
import { Receipt, User, Calendar, Barcode, Verified } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ReturnBill } from '@/components/returns/returnsTypes';

interface BillSummaryCardProps {
  selectedBill: ReturnBill;
  verificationBarcode: string;
  setVerificationBarcode: (val: string) => void;
  onVerifyBarcode: () => void;
}

export const BillSummaryCard: React.FC<BillSummaryCardProps> = ({
  selectedBill,
  verificationBarcode,
  setVerificationBarcode,
  onVerifyBarcode,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Bill Info Summary */}
      <Card className="md:col-span-1 border-0 shadow-md">
        <CardHeader className="pb-3 text-primary bg-primary/5">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" /> Bill Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground">Bill No</Label>
            <p className="font-bold text-lg">{selectedBill.billNo}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Customer</Label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{selectedBill.customerName}</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{selectedBill.customerMobile}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Bill Date</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{selectedBill.date}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-primary">
            <span className="font-medium">Total Value</span>
            <span className="text-xl font-bold">₹{selectedBill.grandTotal.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Barcode Verification */}
      <Card className="md:col-span-2 border-0 shadow-md border-2 border-primary/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Barcode className="h-5 w-5 text-primary" /> Verify Product
            </CardTitle>
            <CardDescription>Scan product barcode to confirm match with original bill.</CardDescription>
          </div>
          <Verified
            className={`h-8 w-8 ${
              verificationBarcode ? 'text-primary animate-pulse' : 'text-muted/30'
            }`}
          />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Scan item barcode here..."
              value={verificationBarcode}
              onChange={(e) => setVerificationBarcode(e.target.value)}
              className="h-14 text-xl font-mono text-center tracking-widest border-2 border-primary"
              onKeyPress={(e) => e.key === 'Enter' && onVerifyBarcode()}
              autoFocus
            />
            <Button onClick={onVerifyBarcode} size="lg" className="h-14">
              Verify Item
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
