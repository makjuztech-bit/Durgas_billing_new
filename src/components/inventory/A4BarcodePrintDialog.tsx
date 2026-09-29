import React, { useState, useRef, useEffect, useMemo } from 'react';
import Barcode from 'react-barcode';
import {
  Printer,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileText,
  FileDown,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Saree } from '@/types';
import {
  STANDARD_PAPER_SIZES,
  POPULAR_SHEET_PRESETS,
  calculateOptimalLayout,
  PaperSize,
} from '@/lib/barcodeLayout';
import { verifyBarcodeSoftware } from '@/lib/barcodeValidator';
import { printBarcodeLabels, downloadBarcodePdf } from '@/components/barcode/barcodePrintService';
import { LOGO_EMBLEM_BASE64 } from '@/components/barcode/logoEmblemBase64';

interface A4BarcodePrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Saree | null;
  allProducts?: Saree[];
}

export const A4BarcodePrintDialog: React.FC<A4BarcodePrintDialogProps> = ({
  open,
  onOpenChange,
  product,
  allProducts = [],
}) => {
  // Product state
  const [selectedId, setSelectedId] = useState<string>('');
  const [name, setName] = useState('Gold Necklace');
  const [barcode, setBarcode] = useState('SK-100101');
  const [price, setPrice] = useState<number>(4999);

  // Paper & Label configuration
  const [paperSizeId, setPaperSizeId] = useState<string>('JEWELRY_DUMBBELL');
  const [customPaperWidthMm, setCustomPaperWidthMm] = useState<number>(80);
  const [customPaperHeightMm, setCustomPaperHeightMm] = useState<number>(12);

  const [labelWidthMm, setLabelWidthMm] = useState<number>(80);
  const [labelHeightMm, setLabelHeightMm] = useState<number>(12);
  const [barcodeHeight, setBarcodeHeight] = useState<number>(20);
  const [barcodeWidth, setBarcodeWidth] = useState<number>(1.1);
  const [marginMm, setMarginMm] = useState<number>(0);
  const [gapHorizontalMm, setGapHorizontalMm] = useState<number>(0);
  const [gapVerticalMm, setGapVerticalMm] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(1);

  // Active preview page
  const [previewPage, setPreviewPage] = useState<number>(1);

  // Column override (optional)
  const [manualColumns, setManualColumns] = useState<string>('');
  const [autoFit, setAutoFit] = useState<boolean>(true);

  // Display toggles
  const [showStoreName, setShowStoreName] = useState<boolean>(true);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showItemName, setShowItemName] = useState<boolean>(true);

  // Dumbbell custom widths
  const [flapLeftWidthPct, setFlapLeftWidthPct] = useState<number>(33);
  const [flapRightWidthPct, setFlapRightWidthPct] = useState<number>(33);

  const printContainerRef = useRef<HTMLDivElement>(null);

  // Sync selected product
  useEffect(() => {
    if (product) {
      setSelectedId(product.id || '');
      setName(product.name || 'Gold Ornament');
      setBarcode(product.barcode || `SK-${Math.floor(100000 + Math.random() * 900000)}`);
      setPrice(product.sellingPrice || 0);
      if (product.stockQty && product.stockQty > 0) {
        setTotalCount(product.stockQty);
      } else {
        setTotalCount(1);
      }
    } else if (allProducts.length > 0 && !selectedId) {
      const first = allProducts[0];
      setSelectedId(first.id || '');
      setName(first.name);
      setBarcode(first.barcode);
      setPrice(first.sellingPrice || 0);
      if (first.stockQty && first.stockQty > 0) {
        setTotalCount(first.stockQty);
      } else {
        setTotalCount(1);
      }
    }
  }, [product, open, allProducts, selectedId]);

  const handleSelectProduct = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = allProducts.find((p) => p.id === e.target.value);
    if (found) {
      setSelectedId(found.id || '');
      setName(found.name);
      setBarcode(found.barcode);
      setPrice(found.sellingPrice || 0);
      if (found.stockQty && found.stockQty > 0) {
        setTotalCount(found.stockQty);
      }
    }
  };

  // Determine active paper dimensions
  const activePaper: PaperSize = useMemo(() => {
    if (paperSizeId === 'CUSTOM') {
      return {
        id: 'CUSTOM',
        name: 'Custom Dimensions',
        widthMm: customPaperWidthMm || 210,
        heightMm: customPaperHeightMm || 297,
      };
    }
    return STANDARD_PAPER_SIZES[paperSizeId] || STANDARD_PAPER_SIZES.A4;
  }, [paperSizeId, customPaperWidthMm, customPaperHeightMm]);

  // Optimal layout calculations
  const layout = useMemo(() => {
    const userOverride = autoFit || !manualColumns ? undefined : parseInt(manualColumns, 10);
    return calculateOptimalLayout({
      paperWidthMm: activePaper.widthMm,
      paperHeightMm: activePaper.heightMm,
      labelWidthMm,
      labelHeightMm,
      marginMm,
      gapHorizontalMm,
      gapVerticalMm,
      totalCount,
      userColumnsOverride: userOverride && !isNaN(userOverride) ? userOverride : undefined,
    });
  }, [
    activePaper,
    labelWidthMm,
    labelHeightMm,
    marginMm,
    gapHorizontalMm,
    gapVerticalMm,
    totalCount,
    autoFit,
    manualColumns,
  ]);

  // Keep previewPage in range
  useEffect(() => {
    if (previewPage > layout.totalPages) {
      setPreviewPage(Math.max(1, layout.totalPages));
    }
  }, [layout.totalPages, previewPage]);

  // Software validation of the barcode
  const barcodeValidation = useMemo(() => {
    return verifyBarcodeSoftware(barcode);
  }, [barcode]);

  const handleApplyPreset = (preset: (typeof POPULAR_SHEET_PRESETS)[0]) => {
    setPaperSizeId(preset.paperSizeId);
    setLabelWidthMm(preset.labelWidthMm);
    setLabelHeightMm(preset.labelHeightMm);
    setGapHorizontalMm(preset.gapHorizontalMm);
    setGapVerticalMm(preset.gapVerticalMm);
    setMarginMm(preset.marginMm);
    if (preset.labelHeightMm <= 14) {
      setBarcodeHeight(12);
      setBarcodeWidth(0.8);
    } else if (preset.labelHeightMm <= 22) {
      setBarcodeHeight(14);
      setBarcodeWidth(0.85);
    } else if (preset.labelHeightMm <= 28) {
      setBarcodeHeight(18);
      setBarcodeWidth(1.0);
    } else if (preset.labelHeightMm >= 45) {
      setBarcodeHeight(30);
      setBarcodeWidth(1.4);
    } else {
      setBarcodeHeight(22);
      setBarcodeWidth(1.1);
    }
    setAutoFit(false);
    setManualColumns(preset.columns.toString());
    setTotalCount(preset.labelsPerSheet);
    setPreviewPage(1);
  };

  const isThermal = activePaper.id.startsWith('THERMAL') || activePaper.id === 'JEWELRY_DUMBBELL' || activePaper.heightMm < 60;

  // Delegate to centralized print service (no React DOM scraping, rigid table layout, solid colors)
  const handlePrint = () => {
    // Build barcodes array (same barcode repeated totalCount times)
    const allBarcodes = Array.from({ length: totalCount }, () => barcode);

    // Build sheets for A4/sheet layout
    const sheetsArr: string[][] = [];
    const perSheet = layout.labelsPerPage;
    for (let i = 0; i < allBarcodes.length; i += perSheet) {
      sheetsArr.push(allBarcodes.slice(i, i + perSheet));
    }

    printBarcodeLabels({
      barcodes: allBarcodes,
      sheets: sheetsArr,
      isThermal,
      storeName: 'DURGAS',
      selectedProduct: product || null,
      showStoreName,
      showProductName: showItemName,
      showPrice,
      showBarcodeText: true,
      columnsCount: layout.columns,
      labelWidthMm,
      labelHeightMm,
      barcodeBarHeight: barcodeHeight,
      barcodeBarWidth: barcodeWidth,
      flapLeftWidthPct,
      flapRightWidthPct,
    });
  };

  const handleDownloadPdf = () => {
    const allBarcodes = Array.from({ length: totalCount }, () => barcode);
    const sheetsArr: string[][] = [];
    const perSheet = layout.labelsPerPage;
    for (let i = 0; i < allBarcodes.length; i += perSheet) {
      sheetsArr.push(allBarcodes.slice(i, i + perSheet));
    }

    downloadBarcodePdf({
      barcodes: allBarcodes,
      sheets: sheetsArr,
      isThermal,
      storeName: 'DURGAS',
      selectedProduct: product || null,
      showStoreName,
      showProductName: showItemName,
      showPrice,
      showBarcodeText: true,
      columnsCount: layout.columns,
      labelWidthMm,
      labelHeightMm,
      flapLeftWidthPct,
      flapRightWidthPct,
    });
  };

  // Calculate items visible on current preview page
  const previewItemsCount = useMemo(() => {
    const startIndex = (previewPage - 1) * layout.labelsPerPage;
    return Math.min(layout.labelsPerPage, Math.max(0, totalCount - startIndex));
  }, [previewPage, layout.labelsPerPage, totalCount]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-4 sm:p-5 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold font-display">
                  Print Barcode Sticker Labels
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Print barcode labels on standard A4 sticker sheets or thermal roll printers.
                </DialogDescription>
              </div>
            </div>

            {/* Barcode Health Badge */}
            <div className="flex items-center gap-2 shrink-0">
              {barcodeValidation.valid ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs py-1 px-2.5 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Code 128 • Ready for Scanner
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs py-1 px-2.5 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Check Barcode Text
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x">
          {/* Configuration Column (5 Cols) */}
          <div className="md:col-span-5 p-4 sm:p-5 space-y-4 text-xs">
            {/* Step 1: Product Selection */}
            <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg border">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                <Package className="h-3.5 w-3.5" />
                Step 1: Product & Barcode
              </Label>

              {allProducts.length > 0 && (
                <select
                  value={selectedId}
                  onChange={handleSelectProduct}
                  className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs font-medium"
                >
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.barcode}) - ₹{p.sellingPrice}
                    </option>
                  ))}
                </select>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Barcode</span>
                  <span className="font-mono font-bold text-xs">{barcode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Selling Price</span>
                  <span className="font-bold text-xs text-primary">₹{price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Step 2: Quantity to Print */}
            <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg border">
              <Label className="text-xs font-semibold flex items-center justify-between text-primary">
                <span>Step 2: Number of Labels</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Total: <strong className="text-foreground">{totalCount} labels</strong>
                </span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={totalCount}
                  onChange={(e) => setTotalCount(Math.max(1, Number(e.target.value) || 1))}
                  className="h-8 text-xs font-bold text-primary"
                />
                <div className="flex gap-1 shrink-0">
                  {[12, 24, 48, 100].map((quick) => (
                    <Button
                      key={quick}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTotalCount(quick)}
                      className="h-8 px-2 text-[10px]"
                    >
                      {quick}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Sticker Sheet Format Selection */}
            <div className="space-y-2 bg-muted/30 p-3 rounded-lg border">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                <FileText className="h-3.5 w-3.5" />
                Step 3: Sticker Paper / Roll Format
              </Label>

              <div className="space-y-1.5">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                  Quick Select Common Formats
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {POPULAR_SHEET_PRESETS.map((p) => (
                    <Button
                      key={p.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyPreset(p)}
                      className={`h-8 text-[11px] justify-start truncate px-2 ${
                        labelWidthMm === p.labelWidthMm && labelHeightMm === p.labelHeightMm
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : ''
                      }`}
                    >
                      {p.name.split('/')[0]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">Or Select Paper Size</Label>
                <select
                  value={paperSizeId}
                  onChange={(e) => setPaperSizeId(e.target.value)}
                  className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs font-medium"
                >
                  {Object.values(STANDARD_PAPER_SIZES).map((ps) => (
                    <option key={ps.id} value={ps.id}>
                      {ps.name}
                    </option>
                  ))}
                </select>
              </div>

              {paperSizeId === 'CUSTOM' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <Label className="text-[10px]">Paper Width (mm)</Label>
                    <Input
                      type="number"
                      value={customPaperWidthMm}
                      onChange={(e) => setCustomPaperWidthMm(Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Paper Height (mm)</Label>
                    <Input
                      type="number"
                      value={customPaperHeightMm}
                      onChange={(e) => setCustomPaperHeightMm(Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Content on Label */}
            <div className="space-y-2 bg-muted/30 p-3 rounded-lg border">
              <Label className="text-xs font-semibold text-primary">Step 4: Information on Label</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-1.5">
                  <Switch checked={showStoreName} onCheckedChange={setShowStoreName} />
                  <span className="text-[11px]">Shop Name</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch checked={showItemName} onCheckedChange={setShowItemName} />
                  <span className="text-[11px]">Product</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch checked={showPrice} onCheckedChange={setShowPrice} />
                  <span className="text-[11px]">Price (₹)</span>
                </div>
              </div>
            </div>

            {/* Step 4b: Barcode Graphic Dimensions */}
            <div className="space-y-2 bg-muted/30 p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-primary">Barcode Graphic Size</Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  H: {barcodeHeight}px | W: {barcodeWidth}x
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <Label className="text-[10px]">Height (px)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="60"
                    value={barcodeHeight}
                    onChange={(e) => setBarcodeHeight(Math.max(8, Number(e.target.value) || 20))}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Thickness (width)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="3.0"
                    value={barcodeWidth}
                    onChange={(e) => setBarcodeWidth(Math.max(0.5, Number(e.target.value) || 1.0))}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted-foreground/20">
                <Label className="text-xs font-semibold text-primary">Label Size (mm)</Label>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <Label className="text-[10px]">Width (mm)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="10"
                    value={labelWidthMm}
                    onChange={(e) => setLabelWidthMm(Number(e.target.value))}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Height (mm)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="10"
                    value={labelHeightMm}
                    onChange={(e) => setLabelHeightMm(Number(e.target.value))}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 pt-2">
                <span className="text-[10px] text-muted-foreground mr-1">Quick:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-1.5 text-[10px]"
                  onClick={() => { setBarcodeHeight(14); setBarcodeWidth(0.85); }}
                >
                  Small
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-1.5 text-[10px]"
                  onClick={() => { setBarcodeHeight(20); setBarcodeWidth(1.0); }}
                >
                  Standard
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-1.5 text-[10px]"
                  onClick={() => { setBarcodeHeight(30); setBarcodeWidth(1.4); }}
                >
                  Large
                </Button>
              </div>

              {/* Dumbbell Flap Widths */}
              {isThermal && (
                <>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted-foreground/20">
                    <Label className="text-xs font-semibold text-primary">Dumbbell Flaps (%)</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <div className="flex justify-between">
                        <Label className="text-[10px]">Left Flap</Label>
                        <span className="text-[10px] text-muted-foreground">{flapLeftWidthPct}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="45"
                        value={flapLeftWidthPct}
                        onChange={(e) => setFlapLeftWidthPct(Number(e.target.value))}
                        className="w-full mt-1"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <Label className="text-[10px]">Right Flap</Label>
                        <span className="text-[10px] text-muted-foreground">{flapRightWidthPct}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="45"
                        value={flapRightWidthPct}
                        onChange={(e) => setFlapRightWidthPct(Number(e.target.value))}
                        className="w-full mt-1"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Summary Box */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs space-y-1">
              <div className="flex justify-between font-medium">
                <span>Labels to Print:</span>
                <strong className="text-primary">{totalCount} labels</strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Layout:</span>
                <span>
                  {layout.columns} Columns × {layout.rows} Rows ({layout.labelsPerPage}/sheet)
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Sheets / Roll Steps:</span>
                <strong>
                  {layout.totalPages} {isThermal ? 'Roll Labels' : 'A4 Sheets'}
                </strong>
              </div>
            </div>
          </div>

          {/* Live Preview Area (7 Cols) */}
          <div className="md:col-span-7 p-4 sm:p-5 bg-muted/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Live Sheet Simulation ({activePaper.name})
                  </span>
                </div>

                {layout.totalPages > 1 && !isThermal && (
                  <div className="flex items-center gap-1 text-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                      disabled={previewPage <= 1}
                      className="h-6 px-1.5"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <span className="px-1 text-[11px] font-medium">
                      Sheet {previewPage} of {layout.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewPage((p) => Math.min(layout.totalPages, p + 1))}
                      disabled={previewPage >= layout.totalPages}
                      className="h-6 px-1.5"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Visual Simulated Sheet Container */}
              <div className="w-full bg-white border border-gray-300 shadow-sm rounded-lg p-3 overflow-hidden">
                <div
                  ref={printContainerRef}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
                    gap: `${Math.max(2, gapVerticalMm * 2)}px ${Math.max(2, gapHorizontalMm * 2)}px`,
                  }}
                  className="max-h-[380px] overflow-y-auto p-1"
                >
                  {Array.from({ length: previewItemsCount }).map((_, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-md bg-white flex flex-row items-center justify-between text-black select-none shadow-sm overflow-hidden"
                      style={{
                        minHeight: `${Math.max(48, labelHeightMm * 4)}px`,
                      }}
                    >
                      {/* Left Flap */}
                      <div 
                        className="flex flex-col items-center justify-center shrink-0 px-1 py-1 h-full border-r border-dashed border-gray-300"
                        style={{ width: `${flapLeftWidthPct}%` }}
                      >
                        {showStoreName && (
                          <>
                            <img src={LOGO_EMBLEM_BASE64} alt="Logo" className="max-h-[15px] max-w-[38px] object-contain mb-1" />
                            <div className="text-[7.5px] font-black text-[#065f3d] mb-1" style={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.6px' }}>DURGAS</div>
                          </>
                        )}
                        <div className="text-[5px] font-bold text-slate-800" style={{ fontFamily: '"Inter", sans-serif', letterSpacing: '0.2px' }}>W: {product?.weight || '8.000g'} &bull; {product?.material || '916 KDM'}</div>
                      </div>

                      {/* Middle Gap */}
                      <div 
                        className="h-full shrink-0 bg-gray-50 flex items-center justify-center text-gray-300"
                        style={{ width: `${Math.max(0, 100 - flapLeftWidthPct - flapRightWidthPct)}%` }}
                      >
                         <span className="text-[5px] rotate-90 whitespace-nowrap">Fold / String Area</span>
                       </div>

                      {/* Right Flap */}
                      <div 
                        className="flex flex-col items-center justify-center shrink-0 px-1 py-1 h-full border-l border-dashed border-gray-300"
                        style={{ width: `${flapRightWidthPct}%` }}
                      >
                         <div className="flex justify-between items-center w-full mb-0.5">
                           <div className="text-[5px] font-bold uppercase truncate max-w-[55%] min-w-0 text-left text-slate-700" style={{ fontFamily: '"Inter", sans-serif' }}>{showItemName ? name : 'ITEM'}</div>
                           <div className="text-[6px] font-black tracking-tight text-right text-black whitespace-nowrap shrink-0 ml-1" style={{ fontFamily: '"Inter", sans-serif' }}>₹{showPrice ? price.toLocaleString('en-IN') : '0'}</div>
                         </div>
                         <div className="w-full flex justify-center origin-center px-0.5 box-border overflow-hidden h-[18px]">
                           <Barcode
                             value={barcode || 'SK-000000'}
                             width={1.0}
                             height={18}
                             fontSize={0}
                             margin={2}
                             displayValue={false}
                             background="transparent"
                           />
                         </div>
                         <span className="text-[5px] font-bold text-slate-900 font-mono text-center mt-0.5 whitespace-nowrap" style={{ letterSpacing: '0.5px' }}>{barcode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground text-center mt-2.5">
                {isThermal ? (
                  <span>
                    Continuous thermal roll mode: Exactly <strong>{totalCount} barcode stickers</strong> will be
                    printed.
                  </span>
                ) : (
                  <span>
                    Printing <strong>{totalCount} barcode labels</strong> across{' '}
                    <strong>{layout.totalPages} A4 sticker sheet(s)</strong>.
                  </span>
                )}
              </p>
            </div>

            <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Target: <strong>{isThermal ? 'Thermal Barcode Printer' : 'Standard A4 Sticker Sheet'}</strong>
              </span>
              <Button onClick={handlePrint} className="gap-2 bg-primary w-full sm:w-auto shadow-sm">
                <Printer className="h-4 w-4" />
                Print {totalCount} Barcode Labels
              </Button>
              <Button onClick={handleDownloadPdf} variant="outline" className="gap-2 w-full sm:w-auto shadow-sm">
                <FileDown className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="p-3 border-t bg-muted/10 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
