import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PurchaseHistoryRecord {
  id?: string;
  _id?: string;
  date: string;
  billNo: string;
  supplierName: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus?: string;
}

interface PurchaseHistoryTableProps {
  purchaseHistory: PurchaseHistoryRecord[];
  historySearch: string;
  setHistorySearch: (val: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onUpdatePayment: (id: string, amt: number, method: string) => Promise<void>;
}

export const PurchaseHistoryTable: React.FC<PurchaseHistoryTableProps> = ({
  purchaseHistory,
  historySearch,
  setHistorySearch,
  onRefresh,
  isRefreshing,
  onUpdatePayment,
}) => {
  const filtered = purchaseHistory.filter(
    (p) =>
      p.billNo.toLowerCase().includes(historySearch.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Purchase History & Pending Dues</CardTitle>
          <CardDescription>
            View all inward entries and update payments for credit purchases.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Bill No / Supplier..."
              className="pl-9"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Bill No</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Due</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const due = p.totalAmount - p.paidAmount;
              const purchaseId = p.id || p._id || '';
              return (
                <TableRow key={purchaseId}>
                  <TableCell>{p.date}</TableCell>
                  <TableCell className="font-medium">{p.billNo}</TableCell>
                  <TableCell>{p.supplierName}</TableCell>
                  <TableCell className="text-right">₹{(p.totalAmount || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-600">
                    ₹{(p.paidAmount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-destructive">
                    ₹{(due || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        p.paymentStatus === 'Paid'
                          ? 'outline'
                          : p.paymentStatus === 'Partial'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="capitalize"
                    >
                      {p.paymentStatus || (due === 0 ? 'Paid' : 'Unpaid')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {due > 0 && (
                      <PaymentUpdateDialog purchase={p} onUpdate={onUpdatePayment} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No purchase history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const PaymentUpdateDialog: React.FC<{
  purchase: PurchaseHistoryRecord;
  onUpdate: (id: string, amt: number, method: string) => void;
}> = ({ purchase, onUpdate }) => {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('UPI');
  const [open, setOpen] = useState(false);
  const purchaseId = purchase.id || purchase._id || '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Pay Now</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Payment - {purchase.billNo}</DialogTitle>
          <DialogDescription>
            Recording payment for {purchase.supplierName}. Remaining Due: ₹
            {(purchase.totalAmount - purchase.paidAmount).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="col-span-3 text-lg font-bold"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="method" className="text-right">
              Method
            </Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="UPI">UPI / Digital</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onUpdate(purchaseId, amount, method);
              setOpen(false);
            }}
          >
            Complete Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
