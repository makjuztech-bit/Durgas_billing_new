import { toast } from 'sonner';
import { GstData } from './gstTypes';

export function exportGstr1Json(selectedMonth: string, bills: any[], settings: any, data: GstData): void {
    const returnPeriod = (selectedMonth || new Date().toISOString().slice(0, 7)).replace('-', '');
    const relevantBills = selectedMonth ? bills.filter(b => (b.date || '').startsWith(selectedMonth)) : bills;
    const b2bInvoices = relevantBills.filter(b => !!b.customerGst || !!(b as any).gstin);

    const gstr1Payload = {
        gstin: settings?.gstin || settings?.gstNo || '33BWZPN2210D1ZO',
        fp: returnPeriod,
        cur_gt: data.totalTaxable + data.totalTax,
        b2b: b2bInvoices.map(b => ({
            ctin: b.customerGst || (b as any).gstin,
            inv: [{
                inum: b.billNo,
                idt: b.date,
                val: b.grandTotal,
                itms: [{
                    num: 1,
                    itm_det: {
                        txval: b.subtotal || b.grandTotal,
                        rt: 5,
                        camt: Math.round((b.taxAmount || 0) / 2),
                        samt: Math.round((b.taxAmount || 0) / 2)
                    }
                }]
            }]
        })),
        hsn: {
            data: data.hsnSummary.map((hsn, index) => ({
                num: index + 1,
                hsn_sc: hsn.code || hsn.hsnCode || '5007',
                desc: hsn.description,
                uqc: 'NOS',
                qty: hsn.totalQty || 1,
                val: (hsn.taxable || 0) + (hsn.tax || 0),
                txval: hsn.taxable || 0,
                iamt: 0,
                camt: Math.round((hsn.tax || 0) / 2),
                samt: Math.round((hsn.tax || 0) / 2),
                csamt: 0
            }))
        }
    };

    const blob = new Blob([JSON.stringify(gstr1Payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GSTR1_${returnPeriod}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`GSTR-1 JSON downloaded for ${selectedMonth}`);
}

export function exportGstToCsv(selectedMonth: string, data: GstData): void {
    if (data.hsnSummary.length === 0) {
        toast.error('No GST records found for the selected month');
        return;
    }

    const headers = ['HSN Code', 'Description', 'Quantity', 'Taxable Value (INR)', 'GST Rate %', 'CGST (INR)', 'SGST (INR)', 'Total Tax (INR)', 'Total Value (INR)'];
    const rows = data.hsnSummary.map(h => [
        `"${h.code || h.hsnCode || '5007'}"`,
        `"${h.description}"`,
        h.totalQty || 0,
        h.taxable || 0,
        h.rate || 5,
        Math.round((h.tax || 0) / 2),
        Math.round((h.tax || 0) / 2),
        h.tax || 0,
        (h.taxable || 0) + (h.tax || 0)
    ]);

    const summaryLines = [
        [],
        ['TOTAL TAXABLE', '', '', data.totalTaxable, '', Math.round(data.totalTax / 2), Math.round(data.totalTax / 2), data.totalTax, data.totalTaxable + data.totalTax],
        ['B2B INVOICES COUNT', '', '', data.b2bCount]
    ];

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(',')), ...summaryLines.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GST_Report_${selectedMonth || 'all'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`GST report for ${selectedMonth} exported to CSV`);
}
