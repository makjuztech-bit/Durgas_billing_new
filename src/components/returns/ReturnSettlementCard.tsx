import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ReturnSettlementCardProps {
  refundMethod: 'cash' | 'upi' | 'store_credit';
  setRefundMethod: (val: 'cash' | 'upi' | 'store_credit') => void;
  refundAmount: number;
  onProcessReturn: () => void;
  processing: boolean;
}

export const ReturnSettlementCard: React.FC<ReturnSettlementCardProps> = ({
  refundMethod,
  setRefundMethod,
  refundAmount,
  onProcessReturn,
  processing,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Refund Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Refund Method</Label>
            <RadioGroup
              value={refundMethod}
              onValueChange={(v: 'cash' | 'upi' | 'store_credit') => setRefundMethod(v)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi">UPI</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="store_credit" id="credit" />
                <Label htmlFor="credit">Store Credit</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <div className="bg-primary p-6 rounded-2xl shadow-xl text-primary-foreground flex flex-col items-end gap-2">
        <span className="text-primary-foreground/80 font-medium">Estimated Refund Amount</span>
        <div className="text-4xl font-black">₹{refundAmount.toLocaleString()}</div>
        <Button
          size="lg"
          className="w-full mt-4 bg-white text-primary hover:bg-white/90 font-bold h-14 text-xl"
          onClick={onProcessReturn}
          disabled={processing || refundAmount <= 0}
        >
          {processing ? 'Processing...' : 'Process Return & Re-Stock'}
        </Button>
      </div>
    </div>
  );
};
