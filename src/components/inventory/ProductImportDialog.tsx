import React from 'react';
import { Download, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Saree } from '@/types';

interface ProductImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (products: Partial<Saree>[]) => void;
}

export const ProductImportDialog: React.FC<ProductImportDialogProps> = ({
  open,
  onOpenChange,
  onImportComplete,
}) => {
  const handleDownloadTemplate = () => {
    const headers = [
      'sareeCode',
      'barcode',
      'name',
      'nameTamil',
      'category',
      'brand',
      'material',
      'purchasePrice',
      'sellingPrice',
      'mrp',
      'stockQty',
      'rackLocation',
      'supplier',
    ];

    const sampleRow = [
      'KS-1001',
      '8901234567890',
      'Kanchipuram Silk Saree',
      'காஞ்சிபுரம் பட்டு',
      'bridal',
      'Sri Kumaran',
      'pure_silk',
      '18000',
      '22500',
      '25000',
      '5',
      'Rack A-1',
      'Kanchipuram Weavers',
    ];

    const csvContent = '\uFEFF' + [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
          toast.error('CSV file has no data rows');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const newProducts: Partial<Saree>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const item: any = {};
          headers.forEach((header, index) => {
            const val = values[index];
            if (['purchasePrice', 'sellingPrice', 'mrp', 'stockQty'].includes(header)) {
              item[header] = parseFloat(val) || 0;
            } else {
              item[header] = val;
            }
          });

          if (item.name || item.sareeCode) {
            newProducts.push(item);
          }
        }

        onImportComplete(newProducts);
        toast.success(`Successfully imported ${newProducts.length} items`);
        onOpenChange(false);
      } catch (error) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import products into your inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            <Button variant="outline" onClick={handleDownloadTemplate} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="csvFile">Upload CSV File</Label>
              <Input id="csvFile" type="file" accept=".csv" onChange={handleFileUpload} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
