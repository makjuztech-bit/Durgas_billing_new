import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Download, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '@/lib/config';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const BackupRestore: React.FC = () => {
    // Default to last 7 days
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const [startDate, setStartDate] = useState(lastWeek.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const fetchBackupData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/reports/backup?startDate=${startDate}&endDate=${endDate}`);
            if (!response.ok) throw new Error('Failed to fetch backup data');
            return await response.json();
        } catch (error) {
            toast.error('Error fetching data');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async () => {
        const data = await fetchBackupData();
        if (!data) return;

        const wb = XLSX.utils.book_new();

        // Bills Sheet
        const billsData = data.bills.map((b: any) => ({
            BillNo: b.billNo,
            Date: new Date(b.createdAt).toLocaleDateString(),
            Customer: b.customerName,
            Mobile: b.customerMobile,
            Items: b.items.length,
            Total: b.grandTotal,
            Status: b.status,
            Payment: b.paymentMethod
        }));
        const wsBills = XLSX.utils.json_to_sheet(billsData);
        XLSX.utils.book_append_sheet(wb, wsBills, "Bills");

        // Inventory Sheet
        const inventoryData = data.inventory.map((p: any) => ({
            Code: p.sareeCode || p.productCode,
            Name: p.name,
            Category: p.category,
            Price: p.sellingPrice,
            Stock: p.stockQty,
            Status: p.status
        }));
        const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
        XLSX.utils.book_append_sheet(wb, wsInventory, "Inventory");

        // Customers Sheet
        const custData = data.customers.map((c: any) => ({
            Name: c.name,
            Mobile: c.mobile,
            Place: c.place,
            Type: c.type
        }));
        const wsCust = XLSX.utils.json_to_sheet(custData);
        XLSX.utils.book_append_sheet(wb, wsCust, "Customers");

        // Expenses Sheet
        const expData = data.expenses.map((e: any) => ({
            Date: e.date,
            Category: e.category,
            Amount: e.amount,
            Note: e.note
        }));
        const wsExp = XLSX.utils.json_to_sheet(expData);
        XLSX.utils.book_append_sheet(wb, wsExp, "Expenses");

        XLSX.writeFile(wb, `SilkStore_Backup_${startDate}_to_${endDate}.xlsx`);
        toast.success('Excel backup downloaded successfully');
    };

    const exportToPDF = async () => {
        const data = await fetchBackupData();
        if (!data) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('Silk Store Data Backup', 14, 22);
        doc.setFontSize(11);
        doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);

        // Summary
        doc.setFontSize(14);
        doc.text('Summary', 14, 45);
        doc.setFontSize(10);
        doc.text(`Total Bills: ${data.meta.counts.bills}`, 14, 52);
        doc.text(`Total Customers: ${data.meta.counts.customers}`, 14, 58);
        doc.text(`Inventory Items: ${data.meta.counts.inventory}`, 14, 64);
        doc.text(`Expenses Recorded: ${data.meta.counts.expenses}`, 14, 70);

        // Bills Table
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Sales Report', 14, 20);

        const billsTableData = data.bills.map((b: any) => [
            b.billNo,
            new Date(b.createdAt).toLocaleDateString(),
            b.customerName,
            b.grandTotal,
            b.status
        ]);

        autoTable(doc, {
            startY: 25,
            head: [['Bill No', 'Date', 'Customer', 'Amount', 'Status']],
            body: billsTableData,
        });

        // Expenses Table
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.text('Expenses Report', 14, finalY);

        const expTableData = data.expenses.map((e: any) => [
            e.date,
            e.category,
            e.amount,
            e.note || '-'
        ]);

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Date', 'Category', 'Amount', 'Note']],
            body: expTableData,
        });

        doc.save(`SilkStore_Backup_${startDate}_to_${endDate}.pdf`);
        toast.success('PDF backup downloaded successfully');
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Data Backup</h1>
                    <p className="text-muted-foreground">Export your store data for safekeeping.</p>
                </div>
            </div>

            <Card className="border-0 shadow-sm max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        Export Configuration
                    </CardTitle>
                    <CardDescription>
                        Select a date range to backup transaction data. Master data (Customers, Inventory) is always fully exported.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={exportToExcel}
                            disabled={loading}
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            {loading ? 'Generating...' : 'Download Excel Backup'}
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            onClick={exportToPDF}
                            disabled={loading}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            {loading ? 'Generating...' : 'Download PDF Report'}
                        </Button>
                    </div>

                    <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800 border border-yellow-200 mt-4">
                        <p className="font-semibold">Note:</p>
                        <p>The "Last 7 Days" range is selected by default. This backup includes:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>All Customer Records</li>
                            <li>Current Inventory Status</li>
                            <li>Sales Bills (within selected range)</li>
                            <li>Expenses (within selected range)</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BackupRestore;
