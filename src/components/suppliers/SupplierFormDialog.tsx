import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Supplier } from '@/types';

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  supplier: Partial<Supplier>;
  setSupplier: React.Dispatch<React.SetStateAction<Partial<Supplier>>>;
  onSave: () => void;
}

export const SupplierFormDialog: React.FC<SupplierFormDialogProps> = ({
  open,
  onOpenChange,
  isEditing,
  supplier,
  setSupplier,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-xs">
          <div className="grid gap-1.5">
            <Label>Supplier / Firm Name *</Label>
            <Input
              value={supplier.name || ''}
              onChange={(e) => setSupplier({ ...supplier, name: e.target.value })}
              placeholder="e.g. Sri Kumaran Weaving Mills"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Contact Person</Label>
              <Input
                value={supplier.contactPerson || ''}
                onChange={(e) => setSupplier({ ...supplier, contactPerson: e.target.value })}
                placeholder="Manager / Proprietor"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Mobile Number</Label>
              <Input
                value={supplier.mobile || ''}
                onChange={(e) => setSupplier({ ...supplier, mobile: e.target.value })}
                placeholder="10-digit number"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>City / Location</Label>
              <Input
                value={supplier.location || ''}
                onChange={(e) => setSupplier({ ...supplier, location: e.target.value })}
                placeholder="e.g. Kanchipuram, Surat"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>GSTIN</Label>
              <Input
                value={supplier.gstin || ''}
                onChange={(e) => setSupplier({ ...supplier, gstin: e.target.value })}
                placeholder="15-digit GST Number"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Initial Pending Due (₹)</Label>
            <Input
              type="number"
              value={supplier.pendingDue || ''}
              onChange={(e) => setSupplier({ ...supplier, pendingDue: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Supplier</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
