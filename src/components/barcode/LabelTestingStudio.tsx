import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  FileCode,
  FileText,
  Scan,
  Layers,
  Terminal,
  Info,
  Copy,
  Check,
  Upload,
  RefreshCw,
  Sliders,
  Printer,
  HelpCircle,
} from 'lucide-react';
import {
  LabelDefinition,
  createStandard50x35Label,
  createDumbbell80x12Label,
  renderLabelToCanvas,
  renderLabelToSvg,
  renderLabelToPdf,
  validateLabel,
  verifyRenderedBarcode,
  compareLabelCanvases,
  generateBplz,
  generateBple,
  analyzePrinterInstructions,
  compareInstructionStreams,
  verifyPaperFit,
  DEFAULT_JEWELRY_ROLL,
  PhysicalRollConfig,
  PaperFitReport,
  PRINTER_CAPTURE_GUIDE,
  DebugOverlayOptions,
} from '@/lib/label-testing';
import { LOGO_EMBLEM_BASE64 } from '@/components/barcode/logoEmblemBase64';
import { toast } from 'sonner';

export const LabelTestingStudio: React.FC = () => {
  // Preset & Configuration: Default to TVS LP 46 Neo 80x12mm Jewelry Dumbbell Label
  const [preset, setPreset] = useState<'50x35' | 'dumbbell' | 'custom'>('dumbbell');
  const [storeName, setStoreName] = useState('DURGAS');
  const [productName, setProductName] = useState('GOLD ORNAMENT');
  const [price, setPrice] = useState(14999);
  const [barcodeData, setBarcodeData] = useState('8901234567890');
  const [barcodeFormat, setBarcodeFormat] = useState<'CODE128' | 'EAN13' | 'QR'>('CODE128');
  const [details, setDetails] = useState('W: 8.000g • 916 KDM');

  // Print settings
  const [speedIps, setSpeedIps] = useState(3);
  const [darkness, setDarkness] = useState(14);
  const [emulation, setEmulation] = useState<'BPLZ' | 'BPLE'>('BPLZ');

  // Debug Overlay Toggles
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showQuietZones, setShowQuietZones] = useState(true);
  const [showCenterLines, setShowCenterLines] = useState(true);
  const [highlightClipping, setHighlightClipping] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(150); // percentage

  // Log Analyzer State
  const [importedLog, setImportedLog] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Reference comparison canvas
  const [refImageSrc, setRefImageSrc] = useState<string | null>(null);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const diffCanvasContainerRef = useRef<HTMLDivElement>(null);

  // Build the active label definition
  const activeLabel: LabelDefinition = useMemo(() => {
    let lbl: LabelDefinition;
    if (preset === 'dumbbell') {
      lbl = createDumbbell80x12Label({
        storeName,
        productName,
        price,
        barcodeData,
        details,
        logoBase64: LOGO_EMBLEM_BASE64,
      });
    } else {
      lbl = createStandard50x35Label({
        storeName,
        productName,
        price,
        barcodeData,
        barcodeFormat,
        details,
      });
    }
    lbl.printSettings.speedIps = speedIps;
    lbl.printSettings.darkness = darkness;
    lbl.printSettings.emulation = emulation;
    return lbl;
  }, [preset, storeName, productName, price, barcodeData, barcodeFormat, details, speedIps, darkness, emulation]);

  // Physical Roll & Paper Fit settings
  const [carrierWidthMm, setCarrierWidthMm] = useState(84);
  const [carrierMarginLeftMm, setCarrierMarginLeftMm] = useState(2);
  const [interLabelGapMm, setInterLabelGapMm] = useState(2.5);
  const [sensorPositionMm, setSensorPositionMm] = useState(14);
  const [ribbonType, setRibbonType] = useState<'resin' | 'wax-resin' | 'direct-thermal'>('resin');

  // Paper fit verification report
  const paperFitReport: PaperFitReport = useMemo(() => {
    return verifyPaperFit(activeLabel, {
      labelWidthMm: activeLabel.dimensions.widthMm,
      labelHeightMm: activeLabel.dimensions.heightMm,
      carrierLinerWidthMm: carrierWidthMm,
      carrierMarginLeftMm,
      interLabelGapMm,
      sensorPositionMm,
      ribbonType,
    });
  }, [activeLabel, carrierWidthMm, carrierMarginLeftMm, interLabelGapMm, sensorPositionMm, ribbonType]);

  // Automated Validation
  const validationReport = useMemo(() => validateLabel(activeLabel), [activeLabel]);

  // Command Stream Generation
  const bplzStream = useMemo(() => generateBplz(activeLabel), [activeLabel]);
  const bpleStream = useMemo(() => generateBple(activeLabel), [activeLabel]);
  const activeCommandStream = emulation === 'BPLZ' ? bplzStream : bpleStream;

  // Audit of generated command stream
  const generatedStreamAudit = useMemo(() => {
    return analyzePrinterInstructions(
      activeCommandStream.rawCommands,
      activeLabel.dimensions.widthDots,
      activeLabel.dimensions.heightDots
    );
  }, [activeCommandStream, activeLabel]);

  // Audit of imported log (if any)
  const importedStreamAudit = useMemo(() => {
    if (!importedLog.trim()) return null;
    return analyzePrinterInstructions(
      importedLog,
      activeLabel.dimensions.widthDots,
      activeLabel.dimensions.heightDots
    );
  }, [importedLog, activeLabel]);

  // Comparison between generated and imported instructions
  const instructionComparison = useMemo(() => {
    if (!importedLog.trim()) return null;
    return compareInstructionStreams(activeCommandStream.rawCommands, importedLog);
  }, [activeCommandStream, importedLog]);

  // Render Canonical Canvas & Run Barcode Decode Verification
  const [barcodeVerifyResult, setBarcodeVerifyResult] = useState<any>(null);
  const [activeCanvasEl, setActiveCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [diffResult, setDiffResult] = useState<any>(null);

  useEffect(() => {
    const overlayOptions: DebugOverlayOptions = {
      enabled: overlayEnabled,
      showGrid,
      showBoundingBoxes,
      showQuietZones,
      showCenterLines,
      highlightClipping,
      gridStepDots: 20,
    };

    const canvas = renderLabelToCanvas(activeLabel, overlayOptions);
    setActiveCanvasEl(canvas);

    // Update DOM container
    if (canvasContainerRef.current) {
      canvasContainerRef.current.innerHTML = '';
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      canvas.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      canvas.style.borderRadius = '4px';
      canvas.style.background = '#ffffff';
      canvasContainerRef.current.appendChild(canvas);
    }

    // Verify Barcode from Canvas Scanlines
    const barcodeEl = activeLabel.elements.find((e) => e.type === 'barcode');
    if (barcodeEl && barcodeEl.type === 'barcode') {
      const cleanCanvas = renderLabelToCanvas(activeLabel, { enabled: false });
      const verifyRes = verifyRenderedBarcode(cleanCanvas, barcodeEl);
      setBarcodeVerifyResult(verifyRes);
    } else {
      setBarcodeVerifyResult(null);
    }

    // Run Visual Diff if reference image is loaded
    if (refImageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const refCanvas = document.createElement('canvas');
        refCanvas.width = activeLabel.dimensions.widthDots;
        refCanvas.height = activeLabel.dimensions.heightDots;
        const refCtx = refCanvas.getContext('2d');
        if (refCtx) {
          refCtx.drawImage(img, 0, 0, refCanvas.width, refCanvas.height);
          const cleanCanvas = renderLabelToCanvas(activeLabel, { enabled: false });
          const diff = compareLabelCanvases(cleanCanvas, refCanvas);
          setDiffResult(diff);

          if (diffCanvasContainerRef.current) {
            diffCanvasContainerRef.current.innerHTML = '';
            diff.diffCanvas.style.maxWidth = '100%';
            diff.diffCanvas.style.borderRadius = '4px';
            diff.diffCanvas.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            diffCanvasContainerRef.current.appendChild(diff.diffCanvas);
          }
        }
      };
      img.src = refImageSrc;
    }
  }, [
    activeLabel,
    overlayEnabled,
    showGrid,
    showBoundingBoxes,
    showQuietZones,
    showCenterLines,
    highlightClipping,
    refImageSrc,
  ]);

  // Actions
  const handleDownloadPng = () => {
    if (!activeCanvasEl) return;
    const link = document.createElement('a');
    link.download = `label-simulation-${activeLabel.dimensions.widthDots}x${activeLabel.dimensions.heightDots}dots.png`;
    link.href = activeCanvasEl.toDataURL('image/png');
    link.click();
    toast.success('Debug PNG downloaded');
  };

  const handleDownloadSvg = () => {
    const svgStr = renderLabelToSvg(activeLabel);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `label-vector-${activeLabel.dimensions.widthMm}x${activeLabel.dimensions.heightMm}mm.svg`;
    link.href = url;
    link.click();
    toast.success('Vector SVG downloaded');
  };

  const handleDownloadPdf = () => {
    const { doc } = renderLabelToPdf(activeLabel);
    doc.save(`label-verification-${activeLabel.dimensions.widthMm}x${activeLabel.dimensions.heightMm}mm.pdf`);
    toast.success('Verification PDF (exact 1:1 format) downloaded');
  };

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(activeCommandStream.rawCommands);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success(`${emulation} command stream copied to clipboard`);
  };

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRefImageSrc(event.target?.result as string);
        toast.success(`Reference image "${file.name}" loaded for comparison`);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight font-display text-primary">
              Thermal Label Testing & Verification Studio
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono">
              203 DPI TVS LP 46 Neo
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Offline rendering loop, exact dot matrix simulation, boundary geometry auditing, and printer command log analysis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPng}>
            <Download className="mr-1.5 h-4 w-4" /> Debug PNG
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadSvg}>
            <FileCode className="mr-1.5 h-4 w-4" /> SVG
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPdf}>
            <FileText className="mr-1.5 h-4 w-4" /> 1:1 PDF
          </Button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Label Configuration & Controls (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Preset Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Label Preset & Media</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {activeLabel.dimensions.widthDots} × {activeLabel.dimensions.heightDots} dots
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Select physical size and printer calibration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={preset === '50x35' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-9 justify-start"
                  onClick={() => setPreset('50x35')}
                >
                  🏷️ 50 × 35 mm (400×280)
                </Button>
                <Button
                  variant={preset === 'dumbbell' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-9 justify-start"
                  onClick={() => setPreset('dumbbell')}
                >
                  💍 80 × 12 mm Dumbbell
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <Label className="text-xs">Printer Emulation</Label>
                  <select
                    className="w-full mt-1.5 h-8 text-xs rounded-md border border-input bg-background px-2"
                    value={emulation}
                    onChange={(e) => setEmulation(e.target.value as any)}
                  >
                    <option value="BPLZ">BPLZ (ZPL-II Zebra)</option>
                    <option value="BPLE">BPLE (EPL-2 Eltron)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Darkness (0..30)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    className="h-8 text-xs mt-1.5"
                    value={darkness}
                    onChange={(e) => setDarkness(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Inputs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Label Content Definition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Store Title</Label>
                <Input
                  className="h-8 text-xs mt-1"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs">Product Name</Label>
                <Input
                  className="h-8 text-xs mt-1"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Price (₹)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs mt-1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Barcode Format</Label>
                  <select
                    className="w-full mt-1 h-8 text-xs rounded-md border border-input bg-background px-2"
                    value={barcodeFormat}
                    onChange={(e) => setBarcodeFormat(e.target.value as any)}
                  >
                    <option value="CODE128">Code 128 (Standard)</option>
                    <option value="EAN13">EAN-13 (13 Digits)</option>
                    <option value="QR">QR Code (2D)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Barcode Data</Label>
                <Input
                  className="h-8 text-xs mt-1 font-mono font-bold"
                  value={barcodeData}
                  onChange={(e) => setBarcodeData(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs">Details Line</Label>
                <Input
                  className="h-8 text-xs mt-1"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Debug Overlays Control Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Simulation Debug Overlays</CardTitle>
                <Switch checked={overlayEnabled} onCheckedChange={setOverlayEnabled} />
              </div>
              <CardDescription className="text-xs">
                Inspect clipping, rulers, bounding boxes, and quiet zones in real time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">20-Dot Coordinate Grid</Label>
                <Switch checked={showGrid} onCheckedChange={setShowGrid} disabled={!overlayEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Element Bounding Boxes</Label>
                <Switch
                  checked={showBoundingBoxes}
                  onCheckedChange={setShowBoundingBoxes}
                  disabled={!overlayEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Barcode Quiet Zones (Cyan)</Label>
                <Switch
                  checked={showQuietZones}
                  onCheckedChange={setShowQuietZones}
                  disabled={!overlayEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Center Alignment Crosshairs</Label>
                <Switch
                  checked={showCenterLines}
                  onCheckedChange={setShowCenterLines}
                  disabled={!overlayEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Highlight Boundary Clipping (Red)</Label>
                <Switch
                  checked={highlightClipping}
                  onCheckedChange={setHighlightClipping}
                  disabled={!overlayEnabled}
                />
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Display Scale: {zoomLevel}%</span>
                  <button
                    className="text-primary hover:underline text-[11px]"
                    onClick={() => setZoomLevel(100)}
                  >
                    Reset (100%)
                  </button>
                </div>
                <Slider
                  min={100}
                  max={300}
                  step={25}
                  value={[zoomLevel]}
                  onValueChange={(v) => setZoomLevel(v[0])}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visual Simulation & Verification Engine (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Automated Validation & Barcode Verification Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Automated Geometry Validation Status */}
            <Card
              className={`border-l-4 ${
                validationReport.valid
                  ? 'border-l-emerald-500 bg-emerald-500/5'
                  : 'border-l-rose-500 bg-rose-500/5'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {validationReport.valid ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">
                        {validationReport.valid ? 'Label Geometry PASSED' : 'Label Geometry FAILED'}
                      </h4>
                      <Badge
                        variant={validationReport.valid ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {validationReport.errorCount} Error(s) • {validationReport.warningCount} Warn
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {validationReport.summary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Barcode Verification Status */}
            <Card
              className={`border-l-4 ${
                barcodeVerifyResult?.verified
                  ? 'border-l-emerald-500 bg-emerald-500/5'
                  : 'border-l-amber-500 bg-amber-500/5'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Scan
                    className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                      barcodeVerifyResult?.verified ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Barcode Scanline Verification</h4>
                      <Badge
                        variant={barcodeVerifyResult?.verified ? 'default' : 'outline'}
                        className={`text-xs ${
                          barcodeVerifyResult?.verified
                            ? 'bg-emerald-600 text-white'
                            : 'border-amber-500 text-amber-600'
                        }`}
                      >
                        {barcodeVerifyResult?.verified ? 'VERIFIED' : 'PENDING'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {barcodeVerifyResult
                        ? barcodeVerifyResult.message
                        : 'Scanning canvas pixels...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Studio Outputs */}
          <Tabs defaultValue="canvas" className="w-full">
            <TabsList className="grid grid-cols-5 w-full h-11 bg-muted/80 p-1">
              <TabsTrigger value="canvas" className="text-xs font-semibold">
                <Layers className="h-3.5 w-3.5 mr-1.5" /> Dot Canvas (PNG)
              </TabsTrigger>
              <TabsTrigger value="paper-fit" className="text-xs font-semibold">
                <Sliders className="h-3.5 w-3.5 mr-1.5" /> Paper Fit & Setup
              </TabsTrigger>
              <TabsTrigger value="validation" className="text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Validation Report
              </TabsTrigger>
              <TabsTrigger value="diff" className="text-xs font-semibold">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> BarTender Diff
              </TabsTrigger>
              <TabsTrigger value="instructions" className="text-xs font-semibold">
                <Terminal className="h-3.5 w-3.5 mr-1.5" /> Instructions (ZPL/EPL)
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Canonical Dot Canvas */}
            <TabsContent value="canvas" className="mt-4 space-y-3">
              <Card className="overflow-hidden border border-border">
                <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">
                      {activeLabel.dimensions.widthDots} × {activeLabel.dimensions.heightDots} dots
                    </span>
                    <span className="text-muted-foreground">
                      ({activeLabel.dimensions.widthMm} × {activeLabel.dimensions.heightMm} mm @ 203 DPI)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px] font-mono">
                      Scale: {zoomLevel}%
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleDownloadPng}>
                      <Download className="h-3.5 w-3.5 mr-1" /> Export PNG
                    </Button>
                  </div>
                </div>

                <div className="p-6 bg-slate-900/10 dark:bg-slate-950/40 flex items-center justify-center min-h-[360px] overflow-auto">
                  <div
                    style={{
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <div ref={canvasContainerRef} className="flex justify-center" />
                  </div>
                </div>

                <div className="p-3 bg-muted/20 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Outer Red: Printable Bounds
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Cyan Zone: Barcode Quiet Zone
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" /> Green Box: Safe Element Box
                    </span>
                  </div>
                  <span className="text-[11px] italic">Exact 203 DPI simulation (1 dot = 1 thermal head pin)</span>
                </div>
              </Card>
            </TabsContent>

            {/* TAB: Paper Fit & Hardware Calibration */}
            <TabsContent value="paper-fit" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sliders className="h-4 w-4 text-primary" /> Physical Roll Fit & Sensor Alignment Audit
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Ensures physical 80x12 mm jewelry dumbbell tags feed without skipping, drifting, or optical sensor false-triggers.
                      </CardDescription>
                    </div>
                    <Badge variant={paperFitReport.valid ? 'default' : 'destructive'} className="text-xs">
                      {paperFitReport.valid ? 'Ready for Thermal Stock' : `${paperFitReport.errorCount} Fit Error(s)`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Visual Transmissive Sensor Safe-Zone Alignment Meter */}
                  <div className="p-4 bg-muted/30 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Transmissive Sensor Position on Roll ({carrierWidthMm} mm Web Width):</span>
                      <span className="font-mono text-primary font-bold">{sensorPositionMm} mm from left guide</span>
                    </div>

                    {/* Sensor Strip Visual Diagram */}
                    <div className="relative h-10 w-full rounded border bg-slate-200 dark:bg-slate-800 overflow-hidden flex text-[10px] font-bold text-center">
                      {/* Left Liner Margin (0..2mm) */}
                      <div style={{ width: `${(carrierMarginLeftMm / carrierWidthMm) * 100}%` }} className="bg-slate-400 dark:bg-slate-700 flex items-center justify-center text-slate-100" title="Left Liner Margin">
                        Liner
                      </div>
                      {/* Left Flap Paddle (Safe Zone, 2..28.4mm) */}
                      <div style={{ width: `${(26.4 / carrierWidthMm) * 100}%` }} className="bg-emerald-500/30 border-x border-emerald-500 flex items-center justify-center text-emerald-800 dark:text-emerald-300" title="Left Flap Safe Area">
                        Left Flap (SAFE)
                      </div>
                      {/* Dumbbell Die-Cut Notch (Hazard Zone, 28.4..55.6mm) */}
                      <div style={{ width: `${(27.2 / carrierWidthMm) * 100}%` }} className="bg-rose-500/30 border-x border-rose-500 flex items-center justify-center text-rose-800 dark:text-rose-300 font-extrabold" title="Die-Cut Center Fold Notch: DO NOT PLACE SENSOR HERE">
                        ⚠️ NOTCH CUTOUT (HAZARD)
                      </div>
                      {/* Right Flap Paddle (Safe Zone, 55.6..82mm) */}
                      <div style={{ width: `${(26.4 / carrierWidthMm) * 100}%` }} className="bg-emerald-500/30 border-x border-emerald-500 flex items-center justify-center text-emerald-800 dark:text-emerald-300" title="Right Flap Safe Area">
                        Right Flap (SAFE)
                      </div>
                      {/* Right Liner Margin (82..84mm) */}
                      <div style={{ width: `${(carrierMarginLeftMm / carrierWidthMm) * 100}%` }} className="bg-slate-400 dark:bg-slate-700 flex items-center justify-center text-slate-100" title="Right Liner Margin">
                        Liner
                      </div>

                      {/* Moving Sensor Eye Pointer Needle */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-amber-500 shadow-md flex items-center justify-center"
                        style={{
                          left: `${Math.min(100, Math.max(0, (sensorPositionMm / carrierWidthMm) * 100))}%`,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <div className="absolute -top-1 w-2.5 h-2.5 bg-amber-600 rounded-full border-2 border-white shadow" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>0 mm (Left Guide)</span>
                      <span className="text-rose-600 font-semibold">Center Cutout: 27 mm - 55 mm (Never place sensor here!)</span>
                      <span>{carrierWidthMm} mm (Right Edge)</span>
                    </div>

                    <div className="pt-2">
                      <Label className="text-xs mb-1 block">Adjust Optical Sensor Eye Position (mm from left guide):</Label>
                      <Slider
                        min={0}
                        max={carrierWidthMm}
                        step={0.5}
                        value={[sensorPositionMm]}
                        onValueChange={(v) => setSensorPositionMm(v[0])}
                      />
                    </div>
                  </div>

                  {/* Physical Parameters Input Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">Carrier Web (mm)</Label>
                      <Input
                        type="number"
                        step={0.5}
                        className="h-8 text-xs mt-1"
                        value={carrierWidthMm}
                        onChange={(e) => setCarrierWidthMm(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Left Liner Margin (mm)</Label>
                      <Input
                        type="number"
                        step={0.5}
                        className="h-8 text-xs mt-1"
                        value={carrierMarginLeftMm}
                        onChange={(e) => setCarrierMarginLeftMm(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Inter-Label Gap (mm)</Label>
                      <Input
                        type="number"
                        step={0.1}
                        className="h-8 text-xs mt-1"
                        value={interLabelGapMm}
                        onChange={(e) => setInterLabelGapMm(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Ribbon Type</Label>
                      <select
                        className="w-full mt-1 h-8 text-xs rounded-md border border-input bg-background px-2"
                        value={ribbonType}
                        onChange={(e) => setRibbonType(e.target.value as any)}
                      >
                        <option value="resin">Full Resin (Jewelry Standard)</option>
                        <option value="wax-resin">Wax-Resin (Display Only)</option>
                        <option value="direct-thermal">Direct Thermal (Non-Ribbon)</option>
                      </select>
                    </div>
                  </div>

                  {/* Diagnostic Verification Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-xs">
                          <TableHead className="w-12">Status</TableHead>
                          <TableHead className="w-48">Parameter Check</TableHead>
                          <TableHead>Mechanical Finding</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-xs">
                        {paperFitReport.checks.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>
                              {c.status === 'pass' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                              {c.status === 'warn' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                              {c.status === 'fail' && <XCircle className="h-4 w-4 text-rose-600" />}
                            </TableCell>
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {c.message}
                              {c.recommendation && (
                                <span className="block text-primary font-semibold mt-0.5">
                                  💡 Recommendation: {c.recommendation}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Driver & Browser Print Setup Configurations (2 Cards) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Card 1: Windows Printer Driver */}
                    <Card className="border border-border/80 bg-muted/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-primary">
                          <Printer className="h-4 w-4" /> Windows Driver Configuration (TVS LP 46 Neo)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1.5 text-xs">
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Stock Profile Name:</span>
                          <span className="font-mono font-bold">{paperFitReport.windowsDriverSettings.stockName}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Page Dimensions:</span>
                          <span className="font-mono font-bold">80.0 mm (W) × 12.0 mm (H)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Media Type:</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">Labels with Gaps (Web Sensing)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Print Method:</span>
                          <span className="font-semibold">{paperFitReport.windowsDriverSettings.printMethod}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Gap Length:</span>
                          <span className="font-mono">{interLabelGapMm} mm</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Print Speed:</span>
                          <span className="font-mono">3.0 ips (76 mm/sec)</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Darkness / Burn Temp:</span>
                          <span className="font-mono">14 (Out of 30)</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 2: Chrome / Edge Print Dialog */}
                    <Card className="border border-border/80 bg-muted/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-primary">
                          <FileText className="h-4 w-4" /> Chrome / Edge Browser Print Dialog Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1.5 text-xs">
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Destination:</span>
                          <span className="font-bold">TVS LP 46 Neo / Barcode Printer</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Paper Size:</span>
                          <span className="font-mono font-bold">80mm × 12mm Landscape</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Margins:</span>
                          <span className="font-bold text-rose-600">None (0 mm) - CRITICAL!</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Scale:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">100% (Actual Size - NOT Fit to Page)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Headers & Footers:</span>
                          <span className="font-semibold text-rose-600">Unchecked (Off)</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Background Graphics:</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">Checked (On)</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: Validation Checklist */}
            <TabsContent value="validation" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Pre-Print Boundary & Geometry Audit</CardTitle>
                  <CardDescription className="text-xs">
                    Automated verification guarantees no label stock is wasted due to boundary clipping or unscannable barcodes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-xs">
                          <TableHead className="w-12">Status</TableHead>
                          <TableHead className="w-48">Check Item</TableHead>
                          <TableHead>Diagnostic Finding</TableHead>
                          <TableHead className="w-24 text-right">Dots Offset</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-xs">
                        {validationReport.checks.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>
                              {c.status === 'pass' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                              {c.status === 'warn' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                              {c.status === 'fail' && <XCircle className="h-4 w-4 text-rose-600" />}
                            </TableCell>
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell className="text-muted-foreground">{c.message}</TableCell>
                            <TableCell className="text-right font-mono">
                              {c.dotsExceeded !== undefined ? `${c.dotsExceeded} dots` : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: Visual Diff against BarTender Output */}
            <TabsContent value="diff" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">BarTender Golden Reference Comparison</CardTitle>
                      <CardDescription className="text-xs">
                        Pixel-difference heatmap comparing candidate renderer vs BarTender TVS LP 46 output.
                      </CardDescription>
                    </div>
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Reference PNG
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={handleRefUpload}
                      />
                    </label>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {diffResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-muted/40 rounded-lg">
                          <span className="text-xs text-muted-foreground">Similarity Score</span>
                          <p className="text-xl font-bold font-mono text-primary">{diffResult.similarityScore}%</p>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg">
                          <span className="text-xs text-muted-foreground">Mismatched Pixels</span>
                          <p className="text-xl font-bold font-mono text-destructive">{diffResult.mismatchedPixels}</p>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg">
                          <span className="text-xs text-muted-foreground">Centroid Translation</span>
                          <p className="text-xl font-bold font-mono text-foreground">
                            {diffResult.shiftXdots > 0 ? `+${diffResult.shiftXdots}` : diffResult.shiftXdots}X,{' '}
                            {diffResult.shiftYdots > 0 ? `+${diffResult.shiftYdots}` : diffResult.shiftYdots}Y dots
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-900/10 dark:bg-slate-950/40 rounded-lg flex justify-center">
                        <div ref={diffCanvasContainerRef} />
                      </div>

                      <div className="p-3 bg-muted/30 rounded-md text-xs space-y-1">
                        <span className="font-semibold text-foreground">Differential Analysis:</span>
                        {diffResult.analysisNotes.map((note: string, idx: number) => (
                          <p key={idx} className="text-muted-foreground">
                            • {note}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-center gap-3">
                      <RefreshCw className="h-8 w-8 text-muted-foreground" />
                      <div className="max-w-md">
                        <h4 className="font-semibold text-sm">No Reference Image Loaded</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload an exported label PNG from BarTender or click below to compare against the project reference baseline.
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRefImageSrc('/reference_bartender.png')}
                      >
                        Load Included BarTender Reference
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: Printer Instruction Logs & Analyzer */}
            <TabsContent value="instructions" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        Generated {emulation} Command Stream ({activeCommandStream.totalBytes} Bytes)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Raw thermal commands ready for TVS LP 46 Neo / SNBC printer head
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopyCommands}>
                      {copiedCode ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                      {copiedCode ? 'Copied' : 'Copy Commands'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Raw Code View */}
                  <div className="bg-slate-950 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-56">
                    <pre>{activeCommandStream.rawCommands}</pre>
                  </div>

                  {/* Disassembled Command Breakdown Table */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Disassembled Instructions Breakdown</h4>
                    <div className="rounded-md border max-h-60 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="text-xs">
                            <TableHead className="w-16">Line</TableHead>
                            <TableHead className="w-24">Command</TableHead>
                            <TableHead className="w-40">Name</TableHead>
                            <TableHead>Thermal Head Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="text-xs font-mono">
                          {generatedStreamAudit.commands.map((cmd) => (
                            <TableRow key={cmd.lineIndex}>
                              <TableCell className="text-muted-foreground">{cmd.lineIndex}</TableCell>
                              <TableCell className="font-bold text-primary">{cmd.command}</TableCell>
                              <TableCell className="font-sans font-medium">{cmd.name}</TableCell>
                              <TableCell className="font-sans text-muted-foreground">
                                {cmd.explanation}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Import BarTender PRN / Spool Log Section */}
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">
                        BarTender PRN / Spooler Log Inspector
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Reverse Engineering
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Paste the raw text from your BarTender <code className="bg-muted px-1 rounded">.prn</code> file or Windows spooler capture to inspect aspects and compare with your JS generator:
                    </p>
                    <Textarea
                      placeholder="Paste BarTender PRN output here (e.g. ^XA...^XZ or N...P1)..."
                      className="font-mono text-xs h-24 mb-3"
                      value={importedLog}
                      onChange={(e) => setImportedLog(e.target.value)}
                    />

                    {instructionComparison && (
                      <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-2 border">
                        <div className="flex items-center justify-between font-semibold">
                          <span>Side-by-Side Aspect Comparison</span>
                          <Badge variant={instructionComparison.emulationMatch ? 'default' : 'destructive'}>
                            {instructionComparison.emulationMatch ? 'Emulation Matched' : 'Emulation Mismatch'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {instructionComparison.aspectDeltas.map((d) => (
                            <div key={d.aspect} className="p-2 bg-background rounded border">
                              <span className="text-muted-foreground block text-[11px]">{d.aspect}</span>
                              <div className="flex items-center justify-between font-mono mt-0.5">
                                <span>Mine: {String(d.candidate)}</span>
                                <span className={d.match ? 'text-emerald-600' : 'text-rose-600'}>
                                  BT: {String(d.reference)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {instructionComparison.coordinateShifts.map((s, idx) => (
                          <p key={idx} className="text-muted-foreground pt-1">
                            • <strong>{s.item}:</strong> {s.note}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Technical Capture Guide Accordion */}
                  <div className="p-4 bg-muted/20 border rounded-lg text-xs space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Info className="h-4 w-4 text-primary" />
                      <span>How to Extract Exact Printer Instructions from Windows / BarTender</span>
                    </div>
                    <div className="text-muted-foreground whitespace-pre-line leading-relaxed font-sans text-xs">
                      {PRINTER_CAPTURE_GUIDE}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
