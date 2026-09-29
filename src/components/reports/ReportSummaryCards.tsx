import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportSummary } from '@/components/reports/reportPrintExport';

interface ReportSummaryCardsProps {
  summary: ReportSummary;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{summary.totalSales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Lifetime</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Bills Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.billsCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Avg. Bill Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{Math.round(summary.avgBillValue).toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Estimated Margin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ₹{summary.profitEstimate.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Approx 25% profit</p>
        </CardContent>
      </Card>
    </div>
  );
};
