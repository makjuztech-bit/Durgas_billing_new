import React, { useState, useRef } from 'react';
import { Printer, FileText, Receipt as ReceiptIcon } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BillReceipt } from '@/components/billing/BillReceipt';
import { Bill } from '@/types';

interface BillReprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill | null;
  settings?: any;
}

export const BillReprintModal: React.FC<BillReprintModalProps> = ({
  open,
  onOpenChange,
  bill,
  settings,
}) => {
  const [printPaperType, setPrintPaperType] = useState<'thermal' | 'a4'>('thermal');
  const printRef = useRef<HTMLDivElement>(null);

  const getPageStyle = () => {
    if (printPaperType === 'thermal') {
      return `
        @page { size: 80mm auto; margin: 0; }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            -webkit-print-color-adjust: exact;
          }
          .print-thermal-receipt {
            margin: 0 !important;
            width: 76mm !important;
            max-width: 76mm !important;
          }
        }
      `;
    }
    return `
      @page { size: A4 portrait; margin: 5mm; }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact;
        }
      }
    `;
  };

  const handlePrintAction = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Reprint-${bill?.billNo || 'Receipt'}`,
    pageStyle: getPageStyle(),
    onAfterPrint: () => {
      toast.success('Reprinted successfully!');
    },
  });

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-3">
          <div>
            <DialogTitle className="font-display text-xl font-bold text-primary">
              Invoice {bill.billNo || bill.id}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {settings?.shopName || 'Durgas'} • Select format and print receipt
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center bg-muted p-1 rounded-lg border">
              <Button
                size="sm"
                variant={printPaperType === 'thermal' ? 'default' : 'ghost'}
                className="h-7 text-xs px-2.5 gap-1.5"
                onClick={() => setPrintPaperType('thermal')}
              >
                <ReceiptIcon className="h-3.5 w-3.5" />
                Thermal (80mm)
              </Button>
              <Button
                size="sm"
                variant={printPaperType === 'a4' ? 'default' : 'ghost'}
                className="h-7 text-xs px-2.5 gap-1.5"
                onClick={() => setPrintPaperType('a4')}
              >
                <FileText className="h-3.5 w-3.5" />
                Standard A4
              </Button>
            </div>

            <Button size="sm" className="bg-primary gap-1.5 shadow-sm" onClick={() => handlePrintAction()}>
              <Printer className="h-4 w-4" />
              Print Now
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Preview Area */}
        <div className="flex-grow overflow-y-auto p-2 sm:p-4 bg-slate-100 flex justify-center rounded-lg mt-3">
          <div className="shadow-lg rounded-md my-2">
            <BillReceipt
              ref={printRef}
              paperType={printPaperType}
              billNo={bill.billNo || bill.id}
              customerName={bill.customerName}
              customerMobile={bill.customerMobile}
              customerPlace={bill.customerPlace}
              items={bill.items || []}
              subTotal={bill.subtotal || bill.grandTotal}
              discountPercent={bill.discountPercent || 0}
              discountAmount={bill.discountAmount || 0}
              taxPercent={bill.taxPercent || 0}
              taxAmount={bill.taxAmount || 0}
              roundOff={bill.roundOff || 0}
              grandTotal={bill.grandTotal}
              date={bill.date}
              paymentMethod={bill.paymentMethod || 'CASH'}
              settings={settings}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
