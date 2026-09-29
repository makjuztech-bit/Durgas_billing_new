import { toast } from 'sonner';
import { DisplayBillItem } from '@/components/history/BillHistoryTable';

export function exportBillsToExcelCsv(bills: DisplayBillItem[]): void {
  if (bills.length === 0) {
    toast.error('No records available to export');
    return;
  }
  const headers = [
    'Invoice No',
    'Date',
    'Customer Name',
    'Mobile',
    'Item Count',
    'Gross Subtotal',
    'Discount Amount',
    'GST Tax',
    'Grand Total',
    'Payment Mode',
    'Status',
  ];
  const rows = bills.map((b) => [
    `"${b.billNo}"`,
    `"${b.date}"`,
    `"${b.customerName}"`,
    `"${b.mobile}"`,
    b.itemCount,
    b.amount,
    b.discountAmount,
    b.taxAmount,
    `"${b.paymentMode}"`,
    `"${b.status}"`,
  ]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Sales_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Sales ledger exported to Excel/CSV successfully!');
}
