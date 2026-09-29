import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GstData } from './gstTypes';

interface GstSummaryCardsProps {
    data: GstData;
}

export const GstSummaryCards: React.FC<GstSummaryCardsProps> = ({ data }) => {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Taxable Value</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{(data.totalTaxable || 0).toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total CGST + SGST (5%)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">₹{(data.totalTax || 0).toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">B2B Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.b2bCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Wholesale</p>
                </CardContent>
            </Card>
        </div>
    );
};
