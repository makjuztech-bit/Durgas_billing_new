import React from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ClearHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billsCount: number;
  onConfirmClearAll: () => Promise<void>;
}

export const ClearHistoryDialog: React.FC<ClearHistoryDialogProps> = ({
  open,
  onOpenChange,
  billsCount,
  onConfirmClearAll,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2 font-display text-lg">
            <Trash2 className="h-5 w-5" />
            Clear All Sales History?
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-muted-foreground space-y-2">
          <p>
            Are you sure you want to permanently delete all <strong>{billsCount}</strong> generated bills and clear
            the sales ledger?
          </p>
          <p className="text-xs bg-amber-50 text-amber-800 p-2.5 rounded border border-amber-200">
            This action cannot be undone. Any inventory stock will remain as currently adjusted.
          </p>
        </div>
        <div className="flex justify-end gap-2.5 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirmClearAll} className="gap-1.5">
            <Trash2 className="h-4 w-4" />
            Yes, Clear All History
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
