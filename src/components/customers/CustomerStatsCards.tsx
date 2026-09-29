import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer } from '@/types';

interface CustomerStatsCardsProps {
  customers: Customer[];
}

export const CustomerStatsCards: React.FC<CustomerStatsCardsProps> = ({ customers }) => {
  const totalDue = customers.reduce((acc, curr) => acc + (curr.pendingDue || 0), 0);
  const activeRegulars = customers.filter((c) => (c.visitCount || 1) > 2).length;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase font-medium text-muted-foreground">
            Total Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-primary">{customers.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Registered database</p>
        </CardContent>
      </Card>

      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase font-medium text-muted-foreground">
            Total Outstanding Dues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-destructive">
            ₹{totalDue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Across credit customers</p>
        </CardContent>
      </Card>

      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase font-medium text-muted-foreground">
            Active Regulars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {activeRegulars}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">&gt; 2 visits logged</p>
        </CardContent>
      </Card>
    </div>
  );
};
