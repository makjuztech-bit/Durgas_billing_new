import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { HsnItem } from './gstTypes';

interface HsnSummaryTableProps {
    hsnSummary: HsnItem[];
    loading: boolean;
}

export const HsnSummaryTable: React.FC<HsnSummaryTableProps> = ({ hsnSummary, loading }) => {
    return (
        <Card className="border-0 shadow-sm flex-1">
            <CardHeader>
                <CardTitle>HSN Summary (GSTR-1)</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>HSN Code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Taxable Val</TableHead>
                            <TableHead className="text-right">GST %</TableHead>
                            <TableHead className="text-right">Tax Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : (!hsnSummary || hsnSummary.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">No data found</TableCell>
                            </TableRow>
                        ) : (
                            hsnSummary.map((item, idx) => {
                                const code = item.code || item.hsnCode || '5007';
                                const taxable = item.taxable ?? item.taxableValue ?? 0;
                                const tax = item.tax ?? item.taxAmount ?? 0;
                                const rate = item.rate ?? 5;
                                return (
                                    <TableRow key={`${code}-${idx}`}>
                                        <TableCell className="font-mono">{code}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="text-right">₹{taxable.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{rate}%</TableCell>
                                        <TableCell className="text-right font-bold">₹{tax.toLocaleString()}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
