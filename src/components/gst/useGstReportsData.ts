import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { API_URL } from '@/lib/config';
import { GstData, HsnItem } from './gstTypes';

export function useGstReportsData() {
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    const [data, setData] = useState<GstData>({ totalTaxable: 0, totalTax: 0, b2bCount: 0, hsnSummary: [] });
    const [loading, setLoading] = useState(true);

    const { bills, settings } = useData();

    const fetchGstData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/reports/gst?month=${selectedMonth}`);
            if (response.ok) {
                const result = await response.json();
                if (result && Array.isArray(result.hsnSummary)) {
                    setData({
                        totalTaxable: result.totalTaxable || 0,
                        totalTax: result.totalTax || 0,
                        b2bCount: result.b2bCount || 0,
                        hsnSummary: result.hsnSummary
                    });
                    setLoading(false);
                    return;
                }
            }
        } catch (error) {
            console.log("Calculating GST data from local bills");
        }

        const filteredBills = selectedMonth
            ? bills.filter(b => (b.date || '').startsWith(selectedMonth))
            : bills;

        const totalTaxable = filteredBills.reduce((sum, b) => sum + (b.subtotal || (b as any).subTotal || 0), 0);
        const totalTax = filteredBills.reduce((sum, b) => sum + (b.taxAmount || b.gstAmount || 0), 0);
        const b2bBills = filteredBills.filter(b => !!b.customerGst || !!(b as any).gstin);
        const b2bCount = b2bBills.length;

        const hsnMap: Record<string, HsnItem> = {};
        filteredBills.forEach(bill => {
            (bill.items || []).forEach(item => {
                const hsn = (item as any).hsnCode || '5007';
                if (!hsnMap[hsn]) {
                    hsnMap[hsn] = {
                        code: hsn,
                        hsnCode: hsn,
                        description: 'Silk Sarees & Apparel Collections',
                        taxable: 0,
                        taxableValue: 0,
                        tax: 0,
                        taxAmount: 0,
                        rate: 5,
                        totalQty: 0
                    };
                }
                const qty = item.qty || 1;
                const amt = item.total || (qty * (item.sellingPrice || 0));
                const taxAmt = Math.round(amt * 0.05);
                hsnMap[hsn].totalQty = (hsnMap[hsn].totalQty || 0) + qty;
                hsnMap[hsn].taxable = (hsnMap[hsn].taxable || 0) + amt;
                hsnMap[hsn].taxableValue = (hsnMap[hsn].taxableValue || 0) + amt;
                hsnMap[hsn].tax = (hsnMap[hsn].tax || 0) + taxAmt;
                hsnMap[hsn].taxAmount = (hsnMap[hsn].taxAmount || 0) + taxAmt;
            });
        });

        const summaryList = Object.values(hsnMap);

        setData({
            totalTaxable,
            totalTax,
            b2bCount,
            hsnSummary: summaryList
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchGstData();
    }, [bills, selectedMonth]);

    return {
        selectedMonth,
        setSelectedMonth,
        data,
        loading,
        bills,
        settings,
        fetchGstData
    };
}
