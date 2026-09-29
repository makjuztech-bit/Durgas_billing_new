import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

interface CustomerFormData {
  name: string;
  mobile: string;
  place: string;
  type: string;
}

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  customer: CustomerFormData;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  onSave: () => void;
}

export const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
  open,
  onOpenChange,
  isEditing,
  customer,
  setCustomer,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update customer details below.' : 'Enter customer details to create a profile.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-xs">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="e.g. S. Raman"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              placeholder="10-digit mobile number"
              value={customer.mobile}
              onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="place">Place / City</Label>
            <Input
              id="place"
              placeholder="e.g. Kanchipuram, Chennai"
              value={customer.place}
              onChange={(e) => setCustomer({ ...customer, place: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Customer Category</Label>
            <Select
              value={customer.type}
              onValueChange={(val) => setCustomer({ ...customer, type: val })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Retail">Retail Walk-in</SelectItem>
                <SelectItem value="Wholesale">Wholesale / Trade</SelectItem>
                <SelectItem value="VIP">VIP Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>{isEditing ? 'Update Profile' : 'Save Customer'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
