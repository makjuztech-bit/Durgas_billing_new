import React from 'react';
import { Receipt, ArrowRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Bill } from '@/types';

interface RecentBillsCardProps {
  recentBills: Bill[];
}

export const RecentBillsCard: React.FC<RecentBillsCardProps> = ({ recentBills }) => {
  const navigate = useNavigate();

  return (
    <Card className="border border-border/70 shadow-sm rounded-xl lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
        <div>
          <CardTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Recent Bills
          </CardTitle>
          <CardDescription>
            Latest completed transactions recorded in the local database
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-xs"
          onClick={() => navigate('/bill-history')}
        >
          View Full Ledger
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-3">
        {recentBills.map((bill) => (
          <div
            key={bill.id}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4 transition-all hover:bg-card hover:shadow-sm hover:border-primary/30"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                #{bill.billNo ? bill.billNo.slice(-3) : bill.id.slice(-3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{bill.billNo || bill.id}</p>
                  <Badge
                    variant="outline"
                    className="text-[11px] bg-success/10 text-success border-success/30 font-normal"
                  >
                    {bill.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customer:{' '}
                  <span className="font-medium text-foreground">
                    {bill.customerName || 'Walk-in Customer'}
                  </span>
                  {bill.customerMobile && ` • ${bill.customerMobile}`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
              <div className="text-left sm:text-right">
                <p className="font-bold text-base text-primary">₹{bill.grandTotal.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">
                  {bill.items.reduce((sum, i) => sum + i.qty, 0)} item(s) • {bill.date}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                onClick={() => navigate('/bill-history')}
              >
                Details
              </Button>
            </div>
          </div>
        ))}

        {recentBills.length === 0 && (
          <div className="text-center py-12 px-4 border border-dashed rounded-xl">
            <Receipt className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-base font-semibold text-foreground">No bills created yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Start by adding your first billing transaction.
            </p>
            <Button size="sm" onClick={() => navigate('/billing')} className="gap-2">
              <Plus className="h-4 w-4" /> Create First Bill
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
