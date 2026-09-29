import React from 'react';
import { Download, Printer, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';

import { exportReportToCSV, printReportWindow } from '@/components/reports/reportPrintExport';
import { useReportsData } from '@/components/reports/useReportsData';
import { ReportSummaryCards } from '@/components/reports/ReportSummaryCards';
import { ReportFilterCard } from '@/components/reports/ReportFilterCard';
import { ReportDetailsTable } from '@/components/reports/ReportDetailsTable';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { bills, settings } = useData();
  const {
    reportType,
    setReportType,
    summary,
    detailed,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    handleGenerate,
  } = useReportsData(bills);

  const storeName = settings?.shopName || 'DURGAS';

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-primary">
            Business Intelligence
          </h1>
          <p className="text-muted-foreground">Insights, Sales Reports and Analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/billing')}>
            <Plus className="mr-2 h-4 w-4" /> New Bill
          </Button>
          <Button variant="outline" onClick={() => exportReportToCSV(detailed, summary)}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => printReportWindow(detailed, summary, storeName)}
          >
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* Date & Type Filters */}
      <ReportFilterCard
        reportType={reportType}
        setReportType={setReportType}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onGenerate={handleGenerate}
      />

      {/* KPI Cards */}
      <ReportSummaryCards summary={summary} />

      {/* Transactions Table */}
      <ReportDetailsTable detailed={detailed} />
    </div>
  );
};

export default Reports;
