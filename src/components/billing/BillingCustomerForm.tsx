import React from 'react';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BillingCustomerFormProps {
  customerName: string;
  customerMobile: string;
  customerPlace: string;
  onCustomerNameChange: (val: string) => void;
  onCustomerMobileChange: (val: string) => void;
  onCustomerPlaceChange: (val: string) => void;
}

export const BillingCustomerForm: React.FC<BillingCustomerFormProps> = ({
  customerName,
  customerMobile,
  customerPlace,
  onCustomerNameChange,
  onCustomerMobileChange,
  onCustomerPlaceChange,
}) => {
  return (
    <Card className="shadow-xs">
      <CardHeader className="py-2.5 px-4 bg-muted/20 border-b">
        <CardTitle className="text-xs font-semibold flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-primary" />
          Customer Information (Optional)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-[11px] text-muted-foreground">Customer Name</Label>
          <Input
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="e.g. Meenakshi Ammal"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">Mobile Number</Label>
          <Input
            value={customerMobile}
            onChange={(e) => onCustomerMobileChange(e.target.value)}
            placeholder="e.g. 9876543210"
            className="h-8 text-xs mt-1"
          />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">City / Town</Label>
          <Input
            value={customerPlace}
            onChange={(e) => onCustomerPlaceChange(e.target.value)}
            placeholder="e.g. Kanchipuram"
            className="h-8 text-xs mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};
