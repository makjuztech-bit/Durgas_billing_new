import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { API_URL } from '@/lib/config';
import { Bill } from '@/types';
import { ReportSummary, DetailedReportItem } from '@/components/reports/reportPrintExport';

export function useReportsData(bills: Bill[]) {
  const [reportType, setReportType] = useState('dailysales');
  const [summary, setSummary] = useState<ReportSummary>({
    totalSales: 0,
    billsCount: 0,
    avgBillValue: 0,
    profitEstimate: 0,
  });
  const [detailed, setDetailed] = useState<DetailedReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const calculateReportData = (filteredBills: Bill[]) => {
    const totalSales = filteredBills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
    const billsCount = filteredBills.length;
    const avgBillValue = billsCount > 0 ? totalSales / billsCount : 0;
    const profitEstimate = Math.round(totalSales * 0.25);

    const detailedItems: DetailedReportItem[] = filteredBills.map((bill) => {
      const isCash = (bill.paymentMethod || '').toUpperCase() === 'CASH';
      const amount = bill.grandTotal || 0;
      return {
        id: bill.id || bill.billNo,
        date: bill.date || new Date().toISOString().split('T')[0],
        category: 'Silk Sarees & Apparel',
        cash: isCash ? amount : 0,
        card: isCash ? 0 : amount,
        totalAmount: amount,
      };
    });

    setSummary({ totalSales, billsCount, avgBillValue, profitEstimate });
    setDetailed(detailedItems);
    setLoading(false);
  };

  const handleGenerate = () => {
    let filtered = [...bills];
    if (fromDate) {
      filtered = filtered.filter((b) => (b.date || '') >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter((b) => (b.date || '') <= toDate);
    }
    calculateReportData(filtered);
    toast.success(`Generated report with ${filtered.length} bills`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, detailedRes] = await Promise.all([
          fetch(`${API_URL}/reports/summary`),
          fetch(`${API_URL}/reports/detailed`),
        ]);

        if (summaryRes.ok && detailedRes.ok) {
          const summaryData = await summaryRes.json();
          const detailedData = await detailedRes.json();
          setSummary(summaryData);
          setDetailed(detailedData);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Generating report data from local bills');
      }

      calculateReportData(bills);
    };

    fetchData();
  }, [bills]);

  return {
    reportType,
    setReportType,
    summary,
    detailed,
    loading,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    handleGenerate,
  };
}
