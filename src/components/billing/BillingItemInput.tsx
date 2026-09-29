import React, { useState, useEffect, useRef } from 'react';
import { Plus, Percent, Calculator, ScanBarcode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trie } from '@/lib/trie';
import { Saree } from '@/types';
import { BillReceiptItem } from './BillReceipt';
import { soundFX } from '@/lib/soundEffects';
import { toast } from 'sonner';

interface BillingItemInputProps {
  itemTrie: Trie;
  sarees: Saree[];
  defaultTaxRate?: number;
  onAddItem: (item: BillReceiptItem) => void;
}

export const BillingItemInput: React.FC<BillingItemInputProps> = ({
  itemTrie,
  sarees,
  defaultTaxRate = 5,
  onAddItem,
}) => {
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('1');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [taxPercent, setTaxPercent] = useState(String(defaultTaxRate));

  const [suggestions, setSuggestions] = useState<{ name: string; price: number; barcode?: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode/item input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (name.trim().length > 0) {
      const results = itemTrie.searchPrefix(name);
      const barcodeMatches = sarees
        .filter((s) => s.barcode?.toLowerCase().includes(name.toLowerCase()))
        .map((s) => ({ name: s.name, price: s.sellingPrice || 0, barcode: s.barcode }));

      const combined = [...results, ...barcodeMatches].slice(0, 6);
      setSuggestions(combined);
      setShowSuggestions(combined.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [name, itemTrie, sarees]);

  const selectSuggestion = (sug: { name: string; price: number; barcode?: string }) => {
    setName(sug.name);
    setPrice(String(sug.price));
    if (sug.barcode) setBarcode(sug.barcode);
    setShowSuggestions(false);
  };

  const handleBarcodeOrEnter = () => {
    const trimmedInput = name.trim();
    if (!trimmedInput) return;

    // Check if input directly matches a product barcode or product code or name
    const query = trimmedInput.toLowerCase();
    const matched = sarees.find(
      (s) =>
        s.barcode?.trim().toLowerCase() === query ||
        s.id?.toLowerCase() === query ||
        s.name.trim().toLowerCase() === query
    );

    if (matched) {
      // Direct Barcode Hit! Add product immediately without requiring manual price
      const itemPrice = matched.sellingPrice || 0;
      const itemQty = Math.max(1, Number(qty) || 1);
      const discPct = Math.max(0, Math.min(100, Number(discountPercent) || 0));
      const taxPct = Math.max(0, Number(taxPercent) || defaultTaxRate);

      const base = itemQty * itemPrice;
      const discAmt = base * (discPct / 100);
      const taxAmt = (base - discAmt) * (taxPct / 100);

      onAddItem({
        id: matched.id || Date.now().toString(),
        name: matched.name,
        barcode: matched.barcode,
        qty: itemQty,
        sellingPrice: itemPrice,
        discountPercent: discPct,
        discountAmount: discAmt,
        taxPercent: taxPct,
        taxAmount: taxAmt,
        total: base - discAmt + taxAmt,
      });

      soundFX.playScanSuccess();
      toast.success(`Scanned: ${matched.name} (₹${itemPrice.toLocaleString('en-IN')})`);

      setName('');
      setBarcode('');
      setPrice('');
      setQty('1');
      setDiscountPercent('0');
      setShowSuggestions(false);
      inputRef.current?.focus();
      return;
    }

    // If manual price is provided, add item
    if (price && !isNaN(Number(price))) {
      handleAdd();
      return;
    }

    // If price is missing and it looks like a scanned barcode that wasn't found in inventory
    soundFX.playScanError();
    toast.error(`Item with barcode "${trimmedInput}" not found in inventory. Please enter product rate manually.`);
    setBarcode(trimmedInput);
  };

  const handleAdd = () => {
    if (!name.trim() || !price || isNaN(Number(price))) {
      toast.error('Please enter a valid item name and price.');
      return;
    }

    const itemPrice = Number(price);
    const itemQty = Math.max(1, Number(qty) || 1);
    const discPct = Math.max(0, Math.min(100, Number(discountPercent) || 0));
    const taxPct = Math.max(0, Number(taxPercent) || 0);

    const base = itemQty * itemPrice;
    const discAmt = base * (discPct / 100);
    const taxAmt = (base - discAmt) * (taxPct / 100);

    onAddItem({
      id: Date.now().toString(),
      name: name.trim(),
      barcode: barcode.trim() || undefined,
      qty: itemQty,
      sellingPrice: itemPrice,
      discountPercent: discPct,
      discountAmount: discAmt,
      taxPercent: taxPct,
      taxAmount: taxAmt,
      total: base - discAmt + taxAmt,
    });

    soundFX.playScanSuccess();
    setName('');
    setBarcode('');
    setPrice('');
    setQty('1');
    setDiscountPercent('0');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <Card className="shadow-xs">
      <CardHeader className="py-2.5 px-4 bg-muted/20 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold flex items-center gap-2">
          <ScanBarcode className="h-3.5 w-3.5 text-primary" />
          Direct Barcode Scanner & Item Entry
        </CardTitle>
        <span className="text-[10px] text-muted-foreground">Compatible: Code 128, EAN-13, UPC, Code 39, QR</span>
      </CardHeader>
      <CardContent className="p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span>Scan Barcode or Type Name</span>
            </Label>
            <Input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleBarcodeOrEnter())}
              placeholder="Scan barcode or type item name..."
              className="h-8 text-xs mt-1 font-medium"
            />
            {showSuggestions && (
              <div className="absolute z-20 top-full left-0 w-full bg-popover border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                {suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectSuggestion(sug)}
                    className="px-3 py-1.5 text-xs hover:bg-muted cursor-pointer flex justify-between items-center border-b last:border-0"
                  >
                    <div>
                      <span className="font-medium">{sug.name}</span>
                      {sug.barcode && <span className="block text-[10px] text-muted-foreground font-mono">{sug.barcode}</span>}
                    </div>
                    <span className="font-bold text-primary">₹{sug.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sm:col-span-3">
            <Label className="text-[11px] text-muted-foreground">Rate (₹)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="h-8 text-xs mt-1 font-semibold"
            />
          </div>

          <div className="sm:col-span-3">
            <Label className="text-[11px] text-muted-foreground">Qty</Label>
            <Input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              min="1"
              className="h-8 text-xs mt-1 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t">
          <div className="sm:col-span-4">
            <Label className="text-[11px] flex items-center gap-1 text-muted-foreground">
              <Percent className="h-3 w-3 text-amber-600" />
              Item Discount (%)
            </Label>
            <Input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="0"
              min="0"
              max="100"
              className="h-8 text-xs mt-1"
            />
          </div>

          <div className="sm:col-span-4">
            <Label className="text-[11px] flex items-center gap-1 text-muted-foreground">
              <Calculator className="h-3 w-3 text-sky-600" />
              Item GST (%)
            </Label>
            <Input
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              placeholder="5"
              className="h-8 text-xs mt-1"
            />
          </div>

          <div className="sm:col-span-4 flex items-end">
            <Button type="button" onClick={handleAdd} className="w-full h-8 text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
