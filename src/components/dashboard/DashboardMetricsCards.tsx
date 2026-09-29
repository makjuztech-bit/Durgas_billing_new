import React from 'react';
import { TrendingUp, Banknote, Star, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardMetricsCardsProps {
  totalSalesToday: number;
  todaysBillsCount: number;
  totalSalesEver: number;
  totalBillsCount: number;
  totalDiscounts: number;
  totalTax: number;
}

export const DashboardMetricsCards: React.FC<DashboardMetricsCardsProps> = ({
  totalSalesToday,
  todaysBillsCount,
  totalSalesEver,
  totalBillsCount,
  totalDiscounts,
  totalTax,
}) => {
  const avgDiscountPercent =
    totalBillsCount > 0
      ? `${Math.round((totalDiscounts / (totalSalesEver + totalDiscounts || 1)) * 100)}% avg`
      : '0%';

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Today's Sales */}
      <Card className="stat-card border border-border/70 shadow-sm rounded-xl hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Today's Sales</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-foreground">₹{totalSalesToday.toLocaleString()}</h2>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{todaysBillsCount} bill(s) created today</span>
              <span className="font-semibold text-emerald-600">Live</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Sales */}
      <Card className="stat-card border border-border/70 shadow-sm rounded-xl hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-foreground">₹{totalSalesEver.toLocaleString()}</h2>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>From {totalBillsCount} overall bills</span>
              <span className="font-medium">Persistent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Discounts */}
      <Card className="stat-card border border-border/70 shadow-sm rounded-xl hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Discounts</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Star className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-foreground">₹{totalDiscounts.toLocaleString()}</h2>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>All time discounts</span>
              <span className="font-medium text-amber-600">{avgDiscountPercent}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Tax */}
      <Card className="stat-card border border-border/70 shadow-sm rounded-xl hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Tax Collected</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-foreground">₹{totalTax.toLocaleString()}</h2>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>GST & Tax collection</span>
              <span className="font-medium text-sky-600">Cumulative</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
