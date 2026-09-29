import React from 'react';
import { Calculator, ShoppingBag, Receipt, Sparkles, Plus, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardSidebarPanelsProps {
  avgBillValue: number;
  totalItemsBilled: number;
  totalBillsCount: number;
}

export const DashboardSidebarPanels: React.FC<DashboardSidebarPanelsProps> = ({
  avgBillValue,
  totalItemsBilled,
  totalBillsCount,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 lg:col-span-1">
      {/* Sales Performance Metrics */}
      <Card className="border border-border/70 shadow-sm rounded-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-5 w-5 text-secondary" />
            Sales Summary
          </CardTitle>
          <CardDescription>Key retail store performance indicators</CardDescription>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border border-border/40">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Average Bill Value</p>
              <p className="text-lg font-bold text-foreground">₹{avgBillValue.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary-foreground font-semibold text-xs">
              Per Bill
            </div>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border border-border/40">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Total Items Billed</p>
              <p className="text-lg font-bold text-foreground">{totalItemsBilled} units</p>
            </div>
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border border-border/40">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Total Bills Issued</p>
              <p className="text-lg font-bold text-foreground">{totalBillsCount} bills</p>
            </div>
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Shortcuts Card */}
      <Card className="border border-primary/20 shadow-sm bg-gradient-to-br from-card via-card to-primary/5 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-secondary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2.5">
          <Button
            variant="default"
            className="w-full justify-start h-11 px-4 gap-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            onClick={() => navigate('/billing')}
          >
            <Plus className="h-4 w-4" />
            <div className="flex flex-col items-start text-left">
              <span className="text-xs font-bold">New Bill Counter</span>
              <span className="text-[10px] text-primary-foreground/70">
                Create and print instant receipt
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-11 px-4 gap-3 border-border hover:bg-muted"
            onClick={() => navigate('/bill-history')}
          >
            <History className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-start text-left">
              <span className="text-xs font-bold text-foreground">View Sales Ledger</span>
              <span className="text-[10px] text-muted-foreground">
                Search and manage transactions
              </span>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
