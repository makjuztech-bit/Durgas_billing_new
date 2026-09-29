import React from 'react';
import { Package, Boxes, AlertTriangle, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Saree } from '@/types';

interface InventoryStatsProps {
  products: Saree[];
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ products }) => {
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stockQty || 0), 0);
  const totalRetailValue = products.reduce((acc, p) => acc + (p.sellingPrice || 0) * (p.stockQty || 0), 0);
  const lowStockCount = products.filter((p) => (p.stockQty || 0) > 0 && (p.stockQty || 0) <= 3).length;
  const outOfStockCount = products.filter((p) => (p.stockQty || 0) <= 0).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total SKUs */}
      <Card className="stat-card border border-border/70 shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Total Unique SKUs</span>
            <h3 className="text-2xl font-bold font-display text-foreground mt-0.5">{totalProducts}</h3>
            <span className="text-[11px] text-muted-foreground">Active Catalog Items</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Package className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Total Units */}
      <Card className="stat-card border border-border/70 shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Total Stock Units</span>
            <h3 className="text-2xl font-bold font-display text-emerald-600 mt-0.5">{totalStockUnits}</h3>
            <span className="text-[11px] text-muted-foreground">Items in Store</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Boxes className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Total Retail Valuation */}
      <Card className="stat-card border border-border/70 shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Retail Valuation</span>
            <h3 className="text-2xl font-bold font-display text-primary mt-0.5">
              ₹{totalRetailValue.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-muted-foreground">Calculated Stock Value</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <IndianRupee className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Stock Alerts */}
      <Card className="stat-card border border-border/70 shadow-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Stock Alerts</span>
            <h3 className="text-2xl font-bold font-display text-amber-600 mt-0.5">
              {lowStockCount + outOfStockCount}
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {outOfStockCount} Out of Stock | {lowStockCount} Low
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
