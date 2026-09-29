import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useGstReportsData } from '@/components/gst/useGstReportsData';
import { exportGstr1Json, exportGstToCsv } from '@/components/gst/gstExportUtils';
import { GstSummaryCards } from '@/components/gst/GstSummaryCards';
import { HsnSummaryTable } from '@/components/gst/HsnSummaryTable';

const GstReports: React.FC = () => {
    const {
        selectedMonth,
        setSelectedMonth,
        data,
        loading,
        bills,
        settings,
        fetchGstData
    } = useGstReportsData();

    const handleDownloadJson = () => {
        exportGstr1Json(selectedMonth, bills, settings, data);
    };

    const handleExportExcel = () => {
        exportGstToCsv(selectedMonth, data);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-display text-primary">GST Reports</h1>
                    <p className="text-muted-foreground">GSTR-1, GSTR-3B Sales Data & HSN Summaries.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleDownloadJson}>
                        <Download className="mr-2 h-4 w-4" /> Download JSON
                    </Button>
                    <Button variant="outline" onClick={handleExportExcel}>
                        <FileText className="mr-2 h-4 w-4" /> Export Excel
                    </Button>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-[250px] space-y-2">
                            <Label>Month of Return</Label>
                            <Input
                                type="month"
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(e.target.value)}
                            />
                        </div>
                        <Button className="w-full md:w-auto" onClick={() => { fetchGstData(); toast.success('Data refreshed'); }}>
                            Fetch Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <GstSummaryCards data={data} />

            <HsnSummaryTable hsnSummary={data.hsnSummary} loading={loading} />
        </div>
    );
};

export default GstReports;
