import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DetailedReportItem } from '@/components/reports/reportPrintExport';

interface ReportDetailsTableProps {
  detailed: DetailedReportItem[];
}

export const ReportDetailsTable: React.FC<ReportDetailsTableProps> = ({ detailed }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Breakdown</CardTitle>
        <CardDescription>Line item transactions based on current criteria</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Cash</TableHead>
              <TableHead className="text-right">Card / Digital</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detailed.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs font-semibold">{item.id}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right">₹{item.cash.toLocaleString()}</TableCell>
                <TableCell className="text-right">₹{item.card.toLocaleString()}</TableCell>
                <TableCell className="text-right font-bold">
                  ₹{item.totalAmount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {detailed.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No sales found for the selected criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
