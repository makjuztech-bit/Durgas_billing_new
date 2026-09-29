import { toast } from 'sonner';

export interface ReportSummary {
  totalSales: number;
  billsCount: number;
  avgBillValue: number;
  profitEstimate: number;
}

export interface DetailedReportItem {
  id: string;
  date: string;
  category: string;
  cash: number;
  card: number;
  totalAmount: number;
}

export function exportReportToCSV(detailed: DetailedReportItem[], summary: ReportSummary): void {
  if (detailed.length === 0) {
    toast.error('No report records to export');
    return;
  }
  const headers = [
    'Bill / Ref ID',
    'Date',
    'Category / Description',
    'Cash (INR)',
    'Card / Digital (INR)',
    'Total Amount (INR)',
  ];
  const rows = detailed.map((item) => [
    `"${item.id}"`,
    `"${item.date}"`,
    `"${item.category}"`,
    item.cash,
    item.card,
    item.totalAmount,
  ]);
  const summaryLines = [
    [],
    ['--- REPORT SUMMARY ---', '', '', '', '', ''],
    ['Total Sales (INR)', '', '', '', '', summary.totalSales],
    ['Total Bills Count', '', '', '', '', summary.billsCount],
    ['Average Bill Value (INR)', '', '', '', '', Math.round(summary.avgBillValue)],
    ['Estimated Profit (25%)', '', '', '', '', summary.profitEstimate],
  ];
  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((r) => r.join(',')), ...summaryLines.map((r) => r.join(','))].join(
      '\n'
    );
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success(`Exported ${detailed.length} sales records to CSV`);
}

export function printReportWindow(
  detailed: DetailedReportItem[],
  summary: ReportSummary,
  storeName: string
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print report');
    return;
  }

  const rowsHtml = detailed
    .map(
      (item) => `
      <tr>
        <td style="padding: 6px; border-bottom: 1px solid #ddd;">${item.id}</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd;">${item.date}</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd;">${item.category}</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.cash.toLocaleString(
          'en-IN'
        )}</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.card.toLocaleString(
          'en-IN'
        )}</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">₹${item.totalAmount.toLocaleString(
          'en-IN'
        )}</td>
      </tr>
    `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${storeName} - Sales Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #111; }
          h1 { margin: 0; font-size: 20px; }
          p { margin: 4px 0 16px; color: #666; font-size: 12px; }
          .summary-grid { display: flex; gap: 15px; margin-bottom: 20px; }
          .summary-card { flex: 1; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; background: #f8fafc; }
          .summary-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
          .summary-val { font-size: 18px; font-weight: bold; margin-top: 4px; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
          th { background: #f1f5f9; padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: 600; font-size: 11px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${storeName} - Business Sales Report</h1>
        <p>Generated on ${new Date().toLocaleString()} | Total Bills: ${summary.billsCount}</p>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-title">Total Sales</div>
            <div class="summary-val">₹${summary.totalSales.toLocaleString('en-IN')}</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Bills Count</div>
            <div class="summary-val">${summary.billsCount}</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Avg Bill Value</div>
            <div class="summary-val">₹${Math.round(summary.avgBillValue).toLocaleString('en-IN')}</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Estimated Margin</div>
            <div class="summary-val" style="color: #16a34a;">₹${summary.profitEstimate.toLocaleString(
              'en-IN'
            )}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Bill #</th>
              <th>Date</th>
              <th>Category</th>
              <th style="text-align: right;">Cash</th>
              <th style="text-align: right;">Card / UPI</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              rowsHtml ||
              '<tr><td colspan="6" style="text-align: center; padding: 20px;">No sales found</td></tr>'
            }
          </tbody>
        </table>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
