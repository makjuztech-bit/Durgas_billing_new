import React, { useState, useMemo } from 'react';
import {
  Search,
  Printer,
  Download,
  Trash2,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import { Bill } from '@/types';
import { DayReportModal } from '@/components/history/DayReportModal';
import { BillReprintModal } from '@/components/history/BillReprintModal';
import { BillHistoryTable, DisplayBillItem } from '@/components/history/BillHistoryTable';
import { ClearHistoryDialog } from '@/components/history/ClearHistoryDialog';
import { exportBillsToExcelCsv } from '@/components/history/billHistoryUtils';


const BillHistory: React.FC = () => {
  const navigate = useNavigate();
  const { bills, deleteBill, clearAllBills, settings } = useData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Reprint Modal State
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Day Report State
  const [showDayReportModal, setShowDayReportModal] = useState(false);

  const displayBills: DisplayBillItem[] = useMemo(() => {
    return bills.map((b) => ({
      rawBill: b,
      billNo: b.billNo || b.id,
      date: b.date || '',
      customerName: b.customerName || 'Walk-in Customer',
      mobile: b.customerMobile || '-',
      amount: b.grandTotal || 0,
      discountAmount: b.discountAmount || 0,
      taxAmount: b.taxAmount || 0,
      paymentMode: b.paymentMethod || 'CASH',
      status: b.status || 'Paid',
      itemCount: b.items ? b.items.reduce((sum, i) => sum + i.qty, 0) : 0,
    }));
  }, [bills]);

  const handleOpenPrintModal = (rawBill: Bill) => {
    setSelectedBill(rawBill);
    setShowPrintModal(true);
  };

  const handleWhatsApp = (billNo: string, mobile: string) => {
    if (mobile === '-' || mobile.length < 10) {
      toast.error('Invalid mobile number for this bill');
      return;
    }
    toast.success(`Invoice ${billNo} sent to ${mobile} via WhatsApp!`);
  };

  const handleDownload = (billNo: string) => {
    toast.success(`Downloading PDF for ${billNo}...`);
  };

  const handleDeleteBill = async (billNo: string) => {
    await deleteBill(billNo);
  };

  const handleConfirmClearAll = async () => {
    await clearAllBills();
    setShowClearAllConfirm(false);
  };

  const filteredBills = useMemo(() => {
    return displayBills.filter((bill) => {
      return (
        bill.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.mobile.includes(searchTerm)
      );
    });
  }, [displayBills, searchTerm]);

  const handleExportExcel = () => {
    exportBillsToExcelCsv(filteredBills);
  };


  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Sales Ledger</h1>
          <p className="text-muted-foreground">{settings?.shopName || 'Durgas'} • Transaction History & Receipts</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="default"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm"
            onClick={() => navigate('/billing')}
          >
            <Plus className="h-4 w-4" />
            New Bill
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportExcel}>
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setShowDayReportModal(true)}>
            <Printer className="h-4 w-4" />
            Day Report
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setShowClearAllConfirm(true)}
            disabled={bills.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border/70 shadow-sm rounded-xl">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="font-display text-xl font-bold">Transactions History</CardTitle>
          <CardDescription>
            List of all bills generated. Use search to locate specific records.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search Row */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number, customer name, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50 h-10"
              />
            </div>
          </div>

          {/* Decomposed Table Component */}
          <BillHistoryTable
            bills={filteredBills}
            onReprint={handleOpenPrintModal}
            onWhatsApp={handleWhatsApp}
            onDownload={handleDownload}
            onDelete={handleDeleteBill}
          />
        </CardContent>
      </Card>

      {/* REPRINT MODAL COMPONENT */}
      <BillReprintModal
        open={showPrintModal}
        onOpenChange={setShowPrintModal}
        bill={selectedBill}
        settings={settings}
      />

      {/* DAY REPORT MODAL COMPONENT */}
      <DayReportModal
        open={showDayReportModal}
        onOpenChange={setShowDayReportModal}
        bills={bills}
        settings={settings}
      />

      {/* CLEAR ALL BILLS CONFIRMATION DIALOG */}
      <ClearHistoryDialog
        open={showClearAllConfirm}
        onOpenChange={setShowClearAllConfirm}
        billsCount={bills.length}
        onConfirmClearAll={handleConfirmClearAll}
      />
    </div>
  );
};

export default BillHistory;
