import React, { useState, useRef, useMemo } from 'react';
import { Printer, Calendar } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Bill } from '@/types';

interface DayReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bills: Bill[];
  settings?: any;
}

export const DayReportModal: React.FC<DayReportModalProps> = ({
  open,
  onOpenChange,
  bills,
  settings,
}) => {
  const [dayReportDate, setDayReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  const dayReportPrintRef = useRef<HTMLDivElement>(null);

  const handlePrintDayReport = useReactToPrint({
    contentRef: dayReportPrintRef,
    documentTitle: `Daily-Settlement-${dayReportDate}`,
    pageStyle: `
      @page { size: 80mm auto; margin: 0; }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 80mm !important;
          -webkit-print-color-adjust: exact;
        }
      }
    `,
    onAfterPrint: () => {
      toast.success('Day report printed successfully!');
    },
  });

  const dayBills = useMemo(() => {
    return bills.filter((b) => {
      const bDate = b.date || (b.createdDate ? b.createdDate.split('T')[0] : '');
      return bDate.includes(dayReportDate);
    });
  }, [bills, dayReportDate]);

  const dayTotalSales = useMemo(() => dayBills.reduce((s, b) => s + (b.grandTotal || 0), 0), [dayBills]);
  const dayTotalTax = useMemo(() => dayBills.reduce((s, b) => s + (b.taxAmount || 0), 0), [dayBills]);
  const dayTotalDiscount = useMemo(() => dayBills.reduce((s, b) => s + (b.discountAmount || 0), 0), [dayBills]);
  const dayTotalQty = useMemo(
    () => dayBills.reduce((sum, b) => sum + (b.items ? b.items.reduce((iSum, item) => iSum + (item.qty || 0), 0) : 0), 0),
    [dayBills]
  );

  const dayCash = useMemo(
    () => dayBills.filter((b) => (b.paymentMethod || '').toUpperCase() === 'CASH').reduce((s, b) => s + (b.grandTotal || 0), 0),
    [dayBills]
  );
  const dayUpi = useMemo(
    () => dayBills.filter((b) => (b.paymentMethod || '').toUpperCase().includes('UPI')).reduce((s, b) => s + (b.grandTotal || 0), 0),
    [dayBills]
  );
  const dayCard = useMemo(
    () => dayBills.filter((b) => (b.paymentMethod || '').toUpperCase() === 'CARD').reduce((s, b) => s + (b.grandTotal || 0), 0),
    [dayBills]
  );
  const dayCredit = useMemo(
    () => dayBills.filter((b) => (b.paymentMethod || '').toUpperCase() === 'CREDIT').reduce((s, b) => s + (b.grandTotal || 0), 0),
    [dayBills]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-3">
          <div>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2 text-primary">
              <Calendar className="h-5 w-5 text-primary" />
              Daily Sales Settlement Report
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Summary of daily revenue, payment modes, and invoice volume
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dayReportDate}
              onChange={(e) => setDayReportDate(e.target.value)}
              className="h-8 text-xs w-36"
            />
            <Button size="sm" className="bg-primary gap-1.5 shadow-sm" onClick={() => handlePrintDayReport()}>
              <Printer className="h-4 w-4" />
              Print Day Report
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-3">
          {/* Key Daily Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <span className="text-[11px] text-muted-foreground font-semibold block">Total Invoices</span>
              <span className="text-xl font-extrabold font-mono text-primary">{dayBills.length}</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">{dayTotalQty} items sold</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <span className="text-[11px] text-emerald-800 font-semibold block">Total Revenue</span>
              <span className="text-xl font-extrabold font-mono text-emerald-700">
                ₹{dayTotalSales.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Gross Settlement</span>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
              <span className="text-[11px] text-sky-800 font-semibold block">Total GST Collected</span>
              <span className="text-xl font-extrabold font-mono text-sky-700">
                ₹{dayTotalTax.toFixed(2)}
              </span>
              <span className="text-[10px] text-sky-600 block mt-0.5">CGST + SGST</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <span className="text-[11px] text-amber-800 font-semibold block">Total Discounts</span>
              <span className="text-xl font-extrabold font-mono text-amber-700">
                ₹{dayTotalDiscount.toFixed(2)}
              </span>
              <span className="text-[10px] text-amber-600 block mt-0.5">Store Deductions</span>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <Card className="shadow-xs border border-border/70">
            <CardHeader className="py-2.5 px-4 bg-muted/20 border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Payment Collection Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="border rounded p-2 bg-background">
                  <span className="text-muted-foreground block text-[10px]">Cash Collection</span>
                  <span className="font-mono font-bold text-sm">₹{dayCash.toLocaleString('en-IN')}</span>
                </div>
                <div className="border rounded p-2 bg-background">
                  <span className="text-muted-foreground block text-[10px]">UPI / GPay / Online</span>
                  <span className="font-mono font-bold text-sm text-sky-700">₹{dayUpi.toLocaleString('en-IN')}</span>
                </div>
                <div className="border rounded p-2 bg-background">
                  <span className="text-muted-foreground block text-[10px]">Card (Debit/Credit)</span>
                  <span className="font-mono font-bold text-sm">₹{dayCard.toLocaleString('en-IN')}</span>
                </div>
                <div className="border rounded p-2 bg-background">
                  <span className="text-muted-foreground block text-[10px]">Credit (Customer Due)</span>
                  <span className="font-mono font-bold text-sm text-amber-700">₹{dayCredit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices List for Selected Day */}
          <div className="border rounded-lg overflow-hidden text-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold">Invoice #</TableHead>
                  <TableHead className="font-bold">Customer</TableHead>
                  <TableHead className="font-bold">Mode</TableHead>
                  <TableHead className="text-right font-bold">Items</TableHead>
                  <TableHead className="text-right font-bold">Total (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dayBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No sales records found for {dayReportDate}.
                    </TableCell>
                  </TableRow>
                ) : (
                  dayBills.map((b) => (
                    <TableRow key={b.id || b.billNo}>
                      <TableCell className="font-mono font-bold">{b.billNo || b.id}</TableCell>
                      <TableCell>{b.customerName || 'Walk-in Customer'}</TableCell>
                      <TableCell className="uppercase font-semibold text-[10px]">{b.paymentMethod || 'CASH'}</TableCell>
                      <TableCell className="text-right font-mono">
                        {b.items ? b.items.reduce((s, i) => s + (i.qty || 0), 0) : 0}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ₹{(b.grandTotal || 0).toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Hidden Printable Document for Day Report */}
          <div style={{ position: 'absolute', left: '-99999px', top: '-99999px', opacity: 0 }} aria-hidden="true">
            <div
              ref={dayReportPrintRef}
              style={{
                width: '300px',
                fontFamily: 'monospace',
                padding: '12px',
                fontSize: '11px',
                color: '#000',
                lineHeight: '1.4',
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 'bold', margin: '0 0 1px 0' }}>
                  {settings?.shopNameTamil || 'துர்காஸ்'}
                </h3>
                <h2 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0' }}>
                  {settings?.shopName || 'DURGAS'}
                </h2>
                <p style={{ fontSize: '9px', margin: '0 0 2px 0' }}>
                  Ph: {settings?.phone || '044 46621728, 89251 55521, 89251 55526'}
                </p>
                <p style={{ fontSize: '10px', fontWeight: 'bold', margin: '4px 0 0 0' }}>DAILY SETTLEMENT REPORT</p>
                <p style={{ fontSize: '10px', margin: '2px 0 0 0' }}>Date: {dayReportDate}</p>
              </div>

              <div style={{ borderBottom: '1px dashed #000', paddingBottom: '6px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Invoices:</span>
                  <strong>{dayBills.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Items:</span>
                  <strong>{dayTotalQty}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Discount:</span>
                  <span>-₹{dayTotalDiscount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Tax (GST):</span>
                  <span>+₹{dayTotalTax.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ borderBottom: '1px dashed #000', paddingBottom: '6px', marginBottom: '6px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '3px' }}>PAYMENT BREAKDOWN:</p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cash:</span>
                  <span>₹{dayCash.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>UPI / Online:</span>
                  <span>₹{dayUpi.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Card:</span>
                  <span>₹{dayCard.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Credit / Due:</span>
                  <span>₹{dayCredit.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  borderTop: '2px solid #000',
                  borderBottom: '2px solid #000',
                  padding: '4px 0',
                  margin: '6px 0',
                }}
              >
                <span>NET TOTAL SALES:</span>
                <span>₹{dayTotalSales.toLocaleString('en-IN')}</span>
              </div>

              <p style={{ textAlign: 'center', fontSize: '9px', marginTop: '12px' }}>
                Generated at: {new Date().toLocaleTimeString()} • Verified by Manager
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-3 border-t bg-muted/10 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Settlement for {dayReportDate} • {dayBills.length} invoices
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button size="sm" onClick={() => handlePrintDayReport()} className="gap-1.5">
              <Printer className="h-4 w-4" />
              Print Day Report
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
