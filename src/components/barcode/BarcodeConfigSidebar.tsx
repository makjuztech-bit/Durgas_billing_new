import React, { useState } from 'react';
import {
  Package,
  Settings2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Printer,
  Info,
  HelpCircle,
  ArrowRightLeft,
  RotateCw,
  Compass,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Saree } from '@/types';

interface BarcodeConfigSidebarProps {
  mode: 'single' | 'sequence' | 'product';
  setMode: (mode: 'single' | 'sequence' | 'product') => void;
  selectedProduct: Saree | null;
  setSelectedProduct: (p: Saree | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProducts: Saree[];
  isSeries: boolean;
  setIsSeries: (series: boolean) => void;
  prefix: string;
  setPrefix: (prefix: string) => void;
  startNum: number;
  setStartNum: (num: number) => void;
  count: number;
  setCount: (count: number) => void;
  copies: number;
  setCopies: (copies: number) => void;
  labelType: string;
  onLabelTypeChange: (val: string) => void;
  labelWidthMm: number;
  setLabelWidthMm: (w: number) => void;
  labelHeightMm: number;
  setLabelHeightMm: (h: number) => void;
  columnsCount: number;
  setColumnsCount: (cols: number) => void;
  isThermal: boolean;
  flapLeftWidthPct?: number;
  setFlapLeftWidthPct?: (w: number) => void;
  flapRightWidthPct?: number;
  setFlapRightWidthPct?: (w: number) => void;
  marginTopMm?: number;
  setMarginTopMm?: (m: number) => void;
  marginBottomMm?: number;
  setMarginBottomMm?: (m: number) => void;
  marginLeftMm?: number;
  setMarginLeftMm?: (m: number) => void;
  marginRightMm?: number;
  setMarginRightMm?: (m: number) => void;
  offsetXmm?: number;
  setOffsetXmm?: (val: number) => void;
  offsetYmm?: number;
  setOffsetYmm?: (val: number) => void;
  invertFlaps?: boolean;
  setInvertFlaps?: (val: boolean) => void;
  rotate180?: boolean;
  setRotate180?: (val: boolean) => void;
  rotate90?: boolean;
  setRotate90?: (val: boolean) => void;
  rotationAngle?: 0 | 90 | 180 | 270;
  setRotationAngle?: (val: 0 | 90 | 180 | 270) => void;
  flipBackFlap180?: boolean;
  setFlipBackFlap180?: (val: boolean) => void;
  printOrientation?: 'landscape' | 'portrait' | 'auto';
  setPrintOrientation?: (val: 'landscape' | 'portrait' | 'auto') => void;
  showStoreName: boolean;
  setShowStoreName: (s: boolean) => void;
  showProductName: boolean;
  setShowProductName: (s: boolean) => void;
  showPrice: boolean;
  setShowPrice: (s: boolean) => void;
  showBarcodeText: boolean;
  setShowBarcodeText: (s: boolean) => void;
  barcodeBarWidth: number;
  setBarcodeBarWidth: (w: number) => void;
  barcodeBarHeight: number;
  setBarcodeBarHeight: (h: number) => void;
  barcodeValidationValid: boolean;
  totalLabels: number;
  sheetsCount: number;
  labelsPerSheet: number;
}

export const BarcodeConfigSidebar: React.FC<BarcodeConfigSidebarProps> = ({
  mode,
  setMode,
  selectedProduct,
  setSelectedProduct,
  searchTerm,
  setSearchTerm,
  filteredProducts,
  isSeries,
  setIsSeries,
  prefix,
  setPrefix,
  startNum,
  setStartNum,
  count,
  setCount,
  copies,
  setCopies,
  labelType,
  onLabelTypeChange,
  labelWidthMm,
  setLabelWidthMm,
  labelHeightMm,
  setLabelHeightMm,
  columnsCount,
  setColumnsCount,
  isThermal,
  flapLeftWidthPct = 33,
  setFlapLeftWidthPct,
  flapRightWidthPct = 33,
  setFlapRightWidthPct,
  marginTopMm = 0.8,
  setMarginTopMm,
  marginBottomMm = 0.8,
  setMarginBottomMm,
  marginLeftMm = 1.0,
  setMarginLeftMm,
  marginRightMm = 1.0,
  setMarginRightMm,
  offsetXmm = 0,
  setOffsetXmm,
  offsetYmm = 0,
  setOffsetYmm,
  invertFlaps = false,
  setInvertFlaps,
  rotate180 = false,
  setRotate180,
  rotate90 = false,
  setRotate90,
  rotationAngle = 0,
  setRotationAngle,
  flipBackFlap180 = false,
  setFlipBackFlap180,
  printOrientation = 'landscape',
  setPrintOrientation,
  showStoreName,
  setShowStoreName,
  showProductName,
  setShowProductName,
  showPrice,
  setShowPrice,
  showBarcodeText,
  setShowBarcodeText,
  barcodeBarWidth,
  setBarcodeBarWidth,
  barcodeBarHeight,
  setBarcodeBarHeight,
  barcodeValidationValid,
  totalLabels,
  sheetsCount,
  labelsPerSheet,
}) => {
  const [guideOpen, setGuideOpen] = useState(false);
  return (
    <Card className="h-fit border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="h-5 w-5 text-primary" /> Label Setup
          </CardTitle>
          {barcodeValidationValid ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs py-0.5">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Ready to Scan
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs py-0.5">
              <AlertCircle className="h-3 w-3 mr-1" /> Invalid Code
            </Badge>
          )}
        </div>
        <CardDescription>Setup your product details and sticker format</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        {/* Step 1: Product / Code Selection */}
        <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
          <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" /> Step 1: Product or Code
          </Label>
          <Select value={mode} onValueChange={(v: any) => setMode(v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Existing Inventory Product</SelectItem>
              <SelectItem value="sequence">Numbered Sequential Series</SelectItem>
              <SelectItem value="single">Single Manual Barcode</SelectItem>
            </SelectContent>
          </Select>

          {mode === 'product' ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name, code, or barcode..."
                  className="h-8 pl-8 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {searchTerm && !selectedProduct && (
                <div className="border rounded-md divide-y shadow-sm bg-background max-h-44 overflow-y-auto">
                  {filteredProducts.map((s) => (
                    <div
                      key={s.id}
                      className="p-2 hover:bg-muted/50 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setSelectedProduct(s);
                        setSearchTerm(s.name);
                        setCount(s.stockQty && s.stockQty > 0 ? s.stockQty : 24);
                      }}
                    >
                      <div>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground">{s.sareeCode} • {s.barcode}</p>
                      </div>
                      <Badge variant="outline">₹{s.sellingPrice}</Badge>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-3 text-center text-muted-foreground">No matching products</div>
                  )}
                </div>
              )}

              {selectedProduct && (
                <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-md space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary truncate">{selectedProduct.name}</span>
                    <Badge variant="outline" className="font-mono">₹{selectedProduct.sellingPrice}</Badge>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Barcode: <strong className="font-mono text-foreground">{selectedProduct.barcode}</strong></span>
                    <span>Stock: <strong className="text-foreground">{selectedProduct.stockQty || 0}</strong></span>
                  </div>
                  <div className="pt-1 flex items-center justify-between border-t border-primary/10">
                    <span className="text-[11px]">Sequential numbering?</span>
                    <Switch checked={isSeries} onCheckedChange={setIsSeries} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <Label className="text-[11px]">Prefix</Label>
                <Input className="h-8 text-xs" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="SK-" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Starting #</Label>
                <Input className="h-8 text-xs" type="number" value={startNum} onChange={(e) => setStartNum(Number(e.target.value))} />
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Quantity */}
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
          <Label className="text-xs font-bold text-primary flex items-center justify-between">
            <span>Step 2: Number of Labels</span>
            <span className="font-normal text-muted-foreground text-[11px]">
              Total: <strong>{totalLabels}</strong>
            </span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">Label Count</Label>
              <Input
                className="h-8 text-xs font-bold"
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Copies / Code</Label>
              <Input
                className="h-8 text-xs"
                type="number"
                min="1"
                max="50"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
              />
            </div>
          </div>
          <div className="flex gap-1 pt-1">
            {[12, 24, 40, 65, 100].map((n) => (
              <Button
                key={n}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCount(n)}
                className="h-7 flex-1 text-[10px] px-0"
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        {/* Step 3: Sticker Sheet / Roll Format */}
        <div className="space-y-2.5 p-3 bg-muted/30 rounded-lg border">
          <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Step 3: Paper / Roll Format
          </Label>
          <Select value={labelType} onValueChange={onLabelTypeChange}>
            <SelectTrigger className="h-8 text-xs font-medium"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Dumbbell-80x12">🏷️ TVS LP 46 Neo - Jewelry Dumbbell (80 × 12 mm)</SelectItem>
              <SelectItem value="Thermal">Thermal Barcode Roll (50 × 25mm 1-up)</SelectItem>
              <SelectItem value="Thermal-Large">Thermal Shipping Roll (100 × 50mm)</SelectItem>
              <SelectItem value="A4-24">A4 Sticker Sheet (24 Labels - 3 × 8)</SelectItem>
              <SelectItem value="A4-40">A4 Sticker Sheet (40 Labels - 4 × 10)</SelectItem>
              <SelectItem value="A4-65">A4 Sticker Sheet (65 Labels - 5 × 13)</SelectItem>
              <SelectItem value="Custom">Custom Label Dimensions</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="space-y-1">
              <Label className="text-[10px]">Width (mm)</Label>
              <Input
                className="h-7 text-xs font-bold"
                type="number"
                step="0.5"
                value={labelWidthMm}
                onChange={(e) => setLabelWidthMm(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Height (mm)</Label>
              <Input
                className="h-7 text-xs font-bold"
                type="number"
                step="0.5"
                value={labelHeightMm}
                onChange={(e) => setLabelHeightMm(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Columns</Label>
              <Input
                className="h-7 text-xs"
                type="number"
                min="1"
                max="8"
                disabled={isThermal}
                value={columnsCount}
                onChange={(e) => setColumnsCount(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Dedicated TVS LP 46 Neo 80x12mm Dumbbell Hardware Configuration */}
          {(labelType.includes('Dumbbell') || (labelWidthMm === 80 && labelHeightMm === 12) || labelHeightMm <= 16) && (
            <div className="mt-2 p-2.5 bg-emerald-50/60 border border-emerald-300/60 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-emerald-800 flex items-center gap-1">
                  <Printer className="h-3.5 w-3.5 text-emerald-700" /> TVS LP 46 Neo (203 DPI)
                </span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[9px] bg-white text-emerald-700 border-emerald-300 font-mono py-0">
                    80 × 12 mm
                  </Badge>
                  <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1 text-[10px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/60"
                        title="TVS LP 46 Neo Setup Guide"
                      >
                        <HelpCircle className="h-3.5 w-3.5 mr-0.5" /> Guide
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-emerald-800">
                          <Printer className="h-5 w-5 text-emerald-700" /> TVS LP 46 Neo Hardware & Print Setup Guide
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-600">
                          Follow these 4 critical calibration steps to avoid misprints, cutoffs, or blank page feeds on 80×12mm jewelry dumbbell labels.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-3 py-1 text-xs text-slate-700">
                        <div className="p-2.5 bg-slate-50 border rounded-md space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="bg-emerald-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">1</span>
                            Centering the Roll & Spindle Guides
                          </div>
                          <p className="text-[11px] text-slate-600 pl-5">
                            Slide the green adjustable media guides on the spindle until they gently touch both sides of the backing paper (web width ~84mm). Do not clamp too tight to prevent label skewing.
                          </p>
                        </div>

                        <div className="p-2.5 bg-slate-50 border rounded-md space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="bg-emerald-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">2</span>
                            Automatic Gap Sensor Calibration
                          </div>
                          <p className="text-[11px] text-slate-600 pl-5">
                            1. Turn OFF the TVS LP 46 Neo power switch.<br/>
                            2. Hold down the <strong>PAUSE + FEED</strong> buttons together.<br/>
                            3. Turn ON the power switch while holding them.<br/>
                            4. Release when the printer feeds 2–3 labels. It will auto-detect the 12mm label pitch and notch gap!
                          </p>
                        </div>

                        <div className="p-2.5 bg-slate-50 border rounded-md space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="bg-emerald-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">3</span>
                            Windows Printer Driver Custom Paper
                          </div>
                          <p className="text-[11px] text-slate-600 pl-5">
                            In Windows <em>Devices & Printers &rarr; TVS LP 46 Neo &rarr; Printing Preferences</em>:<br/>
                            &bull; <strong>Label Size:</strong> Width = <strong>80.0 mm</strong>, Height = <strong>12.0 mm</strong> (or Width = <strong>12.0 mm</strong>, Height = <strong>80.0 mm</strong> for 90° Vertical Feed)<br/>
                            &bull; <strong>Media Type:</strong> Labels with Gaps (Gap Height = <strong>2.0 mm</strong>)<br/>
                            &bull; <strong>Print Method:</strong> Thermal Transfer (with wax/resin ribbon)
                          </p>
                        </div>

                        <div className="p-2.5 bg-slate-50 border rounded-md space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="bg-emerald-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">4</span>
                            Chrome / Browser Print Dialog Settings
                          </div>
                          <p className="text-[11px] text-slate-600 pl-5">
                            &bull; <strong>Destination:</strong> TVS LP 46 Neo<br/>
                            &bull; <strong>Scale:</strong> 100% or "Actual Size" (never "Fit to page")<br/>
                            &bull; <strong>Margins:</strong> None (0 mm)<br/>
                            &bull; <strong>Headers & Footers:</strong> Unchecked (OFF)
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="text-[10px] text-slate-700 leading-tight">
                Flaps: Left <strong>{flapLeftWidthPct}%</strong> (~26mm) • Bridge <strong>{Math.max(0, 100 - flapLeftWidthPct - flapRightWidthPct)}%</strong> (~28mm tail) • Right <strong>{flapRightWidthPct}%</strong> (~26mm)
              </div>

              {/* Orientation Mode */}
              <div className="space-y-1 pt-1 border-t border-emerald-200/60">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold text-emerald-900 flex items-center gap-1">
                    <Compass className="h-3 w-3 text-emerald-700" /> Print Orientation
                  </Label>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {printOrientation === 'landscape' ? '80×12mm Across' : printOrientation === 'portrait' ? '80×12mm Feed' : 'Auto'}
                  </span>
                </div>
                <Select
                  value={printOrientation}
                  onValueChange={(val: 'landscape' | 'portrait' | 'auto') => setPrintOrientation?.(val)}
                >
                  <SelectTrigger className="h-7 text-xs bg-white font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape (80×12 mm Across - TVS Default)</SelectItem>
                    <SelectItem value="portrait">Portrait (80×12 mm Feed - Driver Portrait)</SelectItem>
                    <SelectItem value="auto">Auto (Browser Default Negotiation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Calibration Shift Offsets (Where it starts from) */}
              <div className="space-y-1 pt-1 border-t border-emerald-200/60">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold text-emerald-900">
                    Start Origin Calibration (mm)
                  </Label>
                  <span className="text-[9px] text-emerald-700 font-mono">
                    X: {offsetXmm >= 0 ? '+' : ''}{offsetXmm} | Y: {offsetYmm >= 0 ? '+' : ''}{offsetYmm}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <Label className="text-[9.5px] text-slate-700" title="Shift left/right to align with physical label on spindle">
                      X-Shift (Horizontal)
                    </Label>
                    <Input
                      className="h-7 text-xs bg-white font-mono"
                      type="number"
                      step="0.2"
                      min="-6.0"
                      max="6.0"
                      value={offsetXmm}
                      onChange={(e) => setOffsetXmm?.(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[9.5px] text-slate-700" title="Shift up/down for gap notch sensor stop threshold">
                      Y-Shift (Feed Advance)
                    </Label>
                    <Input
                      className="h-7 text-xs bg-white font-mono"
                      type="number"
                      step="0.2"
                      min="-3.0"
                      max="3.0"
                      value={offsetYmm}
                      onChange={(e) => setOffsetYmm?.(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <p className="text-[9px] text-slate-600 leading-tight">
                  Calibrate if roll sits off-center on spindle or gap sensor stops slightly early/late.
                </p>
              </div>

              {/* Roll Feed & Flap Inversion Toggles */}
              <div className="space-y-1.5 pt-1 border-t border-emerald-200/60">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-semibold text-slate-800 flex items-center gap-1">
                      <ArrowRightLeft className="h-3 w-3 text-emerald-700" /> Swap Flaps (Reverse Roll)
                    </Label>
                    <p className="text-[9px] text-slate-500">
                      Barcode on Left &bull; Logo on Right
                    </p>
                  </div>
                  <Switch
                    checked={invertFlaps}
                    onCheckedChange={(val) => setInvertFlaps?.(val)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-semibold text-slate-800 flex items-center gap-1">
                      <RotateCw className="h-3 w-3 text-emerald-700" /> Rotate 90° (Vertical Feed)
                    </Label>
                    <p className="text-[9px] text-slate-500">
                      Rotate 90° clockwise for 12mm short-edge feed
                    </p>
                  </div>
                  <Switch
                    checked={rotationAngle === 90 || rotate90}
                    onCheckedChange={(val) => {
                      const newAngle = val ? 90 : 0;
                      setRotationAngle?.(newAngle);
                      setRotate90?.(val);
                      if (val) setRotate180?.(false);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-semibold text-slate-800 flex items-center gap-1">
                      <RotateCw className="h-3 w-3 text-emerald-700" /> Rotate 180° (Upside-Down)
                    </Label>
                    <p className="text-[9px] text-slate-500">
                      Invert for reverse roll insertion
                    </p>
                  </div>
                  <Switch
                    checked={rotationAngle === 180 || rotate180}
                    onCheckedChange={(val) => {
                      const newAngle = val ? 180 : 0;
                      setRotationAngle?.(newAngle);
                      setRotate180?.(val);
                      if (val) setRotate90?.(false);
                    }}
                  />
                </div>

                <div className="space-y-1 pt-1 border-t border-emerald-200/50">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold text-emerald-900 flex items-center gap-1">
                      <RotateCw className="h-3 w-3 text-emerald-700" /> Print Rotation Angle
                    </Label>
                    <span className="text-[9px] text-emerald-700 font-mono font-bold">
                      {rotationAngle === 90 || rotate90 ? '90° (Vertical)' : rotationAngle === 180 || rotate180 ? '180° (Invert)' : rotationAngle === 270 ? '270° (CCW)' : '0° (Horizontal)'}
                    </span>
                  </div>
                  <Select
                    value={String(rotationAngle ?? (rotate90 ? 90 : rotate180 ? 180 : 0))}
                    onValueChange={(val) => {
                      const deg = Number(val) as 0 | 90 | 180 | 270;
                      setRotationAngle?.(deg);
                      setRotate90?.(deg === 90);
                      setRotate180?.(deg === 180);
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs bg-white font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0° — Standard Horizontal (80 mm Across × 12 mm Feed)</SelectItem>
                      <SelectItem value="90">90° — Clockwise (12 mm Across × 80 mm Feed)</SelectItem>
                      <SelectItem value="180">180° — Upside-Down (Reverse Spindle Feed)</SelectItem>
                      <SelectItem value="270">270° — Counter-Clockwise (12 mm Across × 80 mm Feed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-emerald-200/50">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-semibold text-slate-800 flex items-center gap-1">
                      <RotateCw className="h-3 w-3 text-emerald-700" /> Flip Back Flap 180°
                    </Label>
                    <p className="text-[9px] text-slate-500">
                      Both sides upright when folded on ring
                    </p>
                  </div>
                  <Switch
                    checked={flipBackFlap180}
                    onCheckedChange={(val) => setFlipBackFlap180?.(val)}
                  />
                </div>
              </div>

              {/* Flap widths fine-tuning */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/50">
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-slate-700">Left Flap (%)</Label>
                  <Input
                    className="h-7 text-xs bg-white font-mono"
                    type="number"
                    min="20"
                    max="45"
                    value={flapLeftWidthPct}
                    onChange={(e) => setFlapLeftWidthPct?.(Number(e.target.value) || 33)}
                  />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-slate-700">Right Flap (%)</Label>
                  <Input
                    className="h-7 text-xs bg-white font-mono"
                    type="number"
                    min="20"
                    max="45"
                    value={flapRightWidthPct}
                    onChange={(e) => setFlapRightWidthPct?.(Number(e.target.value) || 33)}
                  />
                </div>
              </div>

              {/* 4 Margins Safe Zone */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/50">
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-slate-700">Top/Bottom Margin (mm)</Label>
                  <Input
                    className="h-7 text-xs bg-white font-mono"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2.5"
                    value={marginTopMm}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMarginTopMm?.(val);
                      setMarginBottomMm?.(val);
                    }}
                  />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-slate-700">Side Margins (mm)</Label>
                  <Input
                    className="h-7 text-xs bg-white font-mono"
                    type="number"
                    step="0.1"
                    min="0"
                    max="3.0"
                    value={marginLeftMm}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMarginLeftMm?.(val);
                      setMarginRightMm?.(val);
                    }}
                  />
                </div>
              </div>
              <p className="text-[9.5px] text-emerald-800/80">
                ✓ 0.8mm top margin guarantees store logo & text are never cut by TVS thermal head.
              </p>
            </div>
          )}
        </div>

        {/* Step 3b: Barcode Sizing */}
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-primary">Barcode Graphic Size</Label>
            <span className="text-[10px] text-muted-foreground font-mono">
              H: {barcodeBarHeight}px | W: {barcodeBarWidth}x
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-1">
              <Label className="text-[10px]">Barcode Height (px)</Label>
              <Input
                className="h-7 text-xs"
                type="number"
                min="10"
                max="60"
                value={barcodeBarHeight}
                onChange={(e) => setBarcodeBarHeight(Math.max(8, Number(e.target.value) || 20))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Bar Thickness (width)</Label>
              <Input
                className="h-7 text-xs"
                type="number"
                step="0.1"
                min="0.6"
                max="3.0"
                value={barcodeBarWidth}
                onChange={(e) => setBarcodeBarWidth(Math.max(0.5, Number(e.target.value) || 1))}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 pt-1">
            <span className="text-[10px] text-muted-foreground mr-1">Quick Size:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-1.5 text-[10px]"
              onClick={() => { setBarcodeBarHeight(16); setBarcodeBarWidth(0.9); }}
            >
              Small
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-1.5 text-[10px]"
              onClick={() => { setBarcodeBarHeight(24); setBarcodeBarWidth(1.2); }}
            >
              Standard
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-1.5 text-[10px]"
              onClick={() => { setBarcodeBarHeight(34); setBarcodeBarWidth(1.6); }}
            >
              Large
            </Button>
          </div>
        </div>

        {/* Step 4: Label Options */}
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
          <Label className="text-xs font-bold text-primary">Step 4: Information on Label</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px]">Shop Name</span>
              <Switch checked={showStoreName} onCheckedChange={setShowStoreName} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px]">Product</span>
              <Switch checked={showProductName} onCheckedChange={setShowProductName} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px]">Price (₹)</span>
              <Switch checked={showPrice} onCheckedChange={setShowPrice} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px]">Barcode Text</span>
              <Switch checked={showBarcodeText} onCheckedChange={setShowBarcodeText} />
            </div>
          </div>
        </div>

        {/* Summary Info */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-1">
          <div className="flex justify-between font-semibold">
            <span>Labels to Print:</span>
            <span className="text-primary font-bold">{totalLabels} labels</span>
          </div>
          <div className="flex justify-between text-muted-foreground text-[11px]">
            <span>Output Breakdown:</span>
            <span>
              {isThermal ? `${totalLabels} Roll Labels` : `${sheetsCount} Sheet(s) (${labelsPerSheet} max/sheet)`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
