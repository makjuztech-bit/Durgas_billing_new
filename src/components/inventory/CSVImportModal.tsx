import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { parseCSV } from '@/lib/csv';

interface CSVImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (products: any[]) => Promise<void>;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ open, onOpenChange, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file first.');
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) {
        toast.error('The CSV file is empty.');
        setLoading(false);
        return;
      }

      // Validate and format
      const formattedProducts = rows.map((row, index) => {
        const getVal = (...keys: string[]) => {
          const targetKeys = keys.map((k) => k.toLowerCase().replace(/[\s_-]+/g, ''));
          const exactKey = Object.keys(row).find((k) => {
            const cleanK = k.toLowerCase().replace(/[\s_-]+/g, '');
            return targetKeys.includes(cleanK);
          });
          return exactKey ? row[exactKey]?.trim() : '';
        };

        const name = getVal('product_name', 'name', 'productname');
        let barcode = getVal('barcode', 'code', 'product_code');
        const priceStr = getVal('price', 'selling_price', 'sellingprice', 'rate', 'mrp');
        const stockStr = getVal('stock', 'stock_qty', 'stockqty', 'qty', 'quantity');

        // If barcode is quoted with equals (e.g. ="000123"), clean it up
        if (barcode.startsWith('="') && barcode.endsWith('"')) {
          barcode = barcode.substring(2, barcode.length - 1);
        } else if (barcode.startsWith("'")) {
          barcode = barcode.substring(1);
        }

        if (!name) throw new Error(`Row ${index + 1}: Product Name is required.`);
        if (!priceStr) throw new Error(`Row ${index + 1}: Price is required for ${name}.`);
        if (barcode && barcode.toUpperCase().includes('E+')) {
          throw new Error(`Row ${index + 1}: Barcode for ${name} contains scientific notation (${barcode}). Please format the column as Text in Excel.`);
        }

        return {
          name,
          barcode: barcode || undefined, // Allow backend to generate if missing
          sellingPrice: parseFloat(priceStr) || 0,
          purchasePrice: parseFloat(priceStr) || 0,
          mrp: parseFloat(priceStr) || 0,
          stockQty: stockStr ? parseInt(stockStr, 10) : 1, // Optional stock defaults to 1
          category: getVal('category') || 'General',
          department: getVal('department') || 'Womens',
        };
      });

      await onImport(formattedProducts);
      toast.success(`Successfully parsed ${formattedProducts.length} products.`);
      onOpenChange(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast.error(error.message || 'Error parsing CSV file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Products via CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk add products. Required columns: <b>Product_Name</b>, <b>Price</b>. 
            Optional columns: <b>Barcode</b>, <b>Stock</b>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md bg-muted/20">
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
            <Input 
              ref={fileInputRef}
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              className="max-w-[250px]"
            />
            {file && <p className="text-sm mt-2 text-primary font-medium">{file.name}</p>}
          </div>

          <div className="flex gap-2 items-start bg-amber-500/10 p-3 rounded-md text-sm text-amber-600 dark:text-amber-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>
              To preserve exact barcode strings (e.g. leading zeros), ensure the barcode column in your CSV editor is formatted as <b>Text</b> before saving.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? 'Importing...' : 'Start Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
