import React from 'react';
import {
  Printer,
  Download,
  MessageSquare,
  Trash2,
  Receipt as ReceiptIcon,
  FileText,
  CreditCard,
  MoreHorizontal,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bill } from '@/types';

export interface DisplayBillItem {
  rawBill: Bill;
  billNo: string;
  date: string;
  customerName: string;
  mobile: string;
  amount: number;
  discountAmount: number;
  taxAmount: number;
  paymentMode: string;
  status: string;
  itemCount: number;
}

interface BillHistoryTableProps {
  bills: DisplayBillItem[];
  onReprint: (rawBill: Bill, paperType: 'thermal' | 'a4') => void;
  onWhatsApp: (billNo: string, mobile: string) => void;
  onDownload: (billNo: string) => void;
  onDelete: (billNo: string) => void;
}

export const BillHistoryTable: React.FC<BillHistoryTableProps> = ({
  bills,
  onReprint,
  onWhatsApp,
  onDownload,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/70">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-bold text-foreground w-[140px]">Invoice #</TableHead>
            <TableHead className="font-bold text-foreground">Date</TableHead>
            <TableHead className="font-bold text-foreground">Customer</TableHead>
            <TableHead className="font-bold text-foreground text-center">Items</TableHead>
            <TableHead className="font-bold text-foreground text-right">Total Amount</TableHead>
            <TableHead className="font-bold text-foreground">Payment</TableHead>
            <TableHead className="font-bold text-foreground">Status</TableHead>
            <TableHead className="w-[60px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                <ReceiptIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="font-medium text-sm">No transaction records found.</p>
                <p className="text-xs text-muted-foreground">Try adjusting your search terms.</p>
              </TableCell>
            </TableRow>
          ) : (
            bills.map((b) => (
              <TableRow key={b.billNo} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono font-bold text-primary">
                  {b.billNo}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {b.date}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm leading-tight">{b.customerName}</div>
                  <div className="text-xs text-muted-foreground font-mono">{b.mobile}</div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                    {b.itemCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-foreground">
                  ₹{b.amount.toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="gap-1 font-normal text-xs py-0.5 px-2 bg-secondary/20"
                  >
                    <CreditCard className="h-3 w-3 opacity-70" />
                    {b.paymentMode}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={b.status === 'Paid' ? 'outline' : 'secondary'}
                    className={
                      b.status === 'Paid'
                        ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-medium text-xs'
                        : 'text-xs'
                    }
                  >
                    {b.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 shadow-lg">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Invoice Options
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onReprint(b.rawBill, 'thermal')}
                        className="gap-2"
                      >
                        <Printer className="h-4 w-4 text-primary" />
                        Print Thermal (80mm)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onReprint(b.rawBill, 'a4')}
                        className="gap-2"
                      >
                        <FileText className="h-4 w-4 text-primary" />
                        Print Standard A4
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onWhatsApp(b.billNo, b.mobile)}
                        className="gap-2 text-emerald-600 focus:text-emerald-700"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Send via WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDownload(b.billNo)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(b.billNo)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
