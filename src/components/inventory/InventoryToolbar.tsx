import React from 'react';
import { Search, Plus, PackagePlus, Printer, Download, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InventoryToolbarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  stockFilter: string;
  onStockFilterChange: (val: string) => void;
  onOpenAddProduct: () => void;
  onOpenRestock: () => void;
  onOpenPrintDialog: () => void;
  onExportCSV: () => void;
  onImportCSV: () => void;
}

export const InventoryToolbar: React.FC<InventoryToolbarProps> = ({
  searchTerm,
  onSearchChange,
  stockFilter,
  onStockFilterChange,
  onOpenAddProduct,
  onOpenRestock,
  onOpenPrintDialog,
  onExportCSV,
  onImportCSV,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border shadow-xs">
      <div className="flex items-center gap-2 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Product Name, Barcode, or Rack..."
            className="pl-8 h-9 text-xs"
          />
        </div>

        <Select value={stockFilter} onValueChange={onStockFilterChange}>
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock Status</SelectItem>
            <SelectItem value="in_stock">In Stock (&gt;3)</SelectItem>
            <SelectItem value="low">Low Stock (1-3)</SelectItem>
            <SelectItem value="out">Out of Stock (0)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportCSV}
          className="h-9 text-xs gap-1.5"
          title="Download Products as CSV"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onImportCSV}
          className="h-9 text-xs gap-1.5"
          title="Upload CSV to bulk add products"
        >
          <Upload className="h-3.5 w-3.5" />
          Import
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenPrintDialog}
          className="h-9 text-xs gap-1.5"
        >
          <Printer className="h-3.5 w-3.5" />
          A4 Barcodes
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenRestock}
          className="h-9 text-xs gap-1.5 border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
        >
          <PackagePlus className="h-3.5 w-3.5 text-emerald-600" />
          Quick Restock
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onOpenAddProduct}
          className="h-9 text-xs gap-1.5 bg-primary hover:bg-primary/90 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Product
        </Button>
      </div>
    </div>
  );
};
