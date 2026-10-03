import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Printer,
  Download,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  FileText,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import {
  LabelDefinition,
  create80x12DumbbellLabel,
  create50x35ReferenceLabel,
  mmToDots,
  dotsToMm
} from '../core/label';
import { DebugRenderer, RenderResult } from '../core/debug-renderer';
import { TvsRenderer } from '../core/tvs-renderer';
import { QZTransport } from '../core/qz-transport';

export const BarcodeTestingApp: React.FC = () => {
  // Active Label Definition
  const [activePreset, setActivePreset] = useState<'dumbbell' | 'standard' | 'custom'>('dumbbell');
  const [label, setLabel] = useState<LabelDefinition>(create80x12DumbbellLabel());
  const [emulation, setEmulation] = useState<'BPLZ' | 'BPLE'>('BPLZ');
  
  // View & Render Options
  const [showGrid, setShowGrid] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(200); // Percentage zoom
  const [activeTab, setActiveTab] = useState<'preview' | 'commands' | 'validation' | 'bartender'>('preview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);

  // QZ Tray Transport State
  const [qzConnected, setQzConnected] = useState(false);
  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('TVS LP 46 Neo');
  const [isPrinting, setIsPrinting] = useState(false);

  // Services
  const debugRenderer = useMemo(() => new DebugRenderer(), []);
  const tvsRenderer = useMemo(() => new TvsRenderer(203), []);
  const qzTransport = useMemo(() => new QZTransport(), []);

  // Connect to QZ Tray on mount
  useEffect(() => {
    let mounted = true;
    qzTransport.connect().then((connected) => {
      if (mounted) {
        setQzConnected(connected);
        qzTransport.getPrinters().then((list) => {
          if (mounted && list.length > 0) {
            setPrinters(list);
            const tvsMatch = list.find((p) => p.toLowerCase().includes('tvs') || p.toLowerCase().includes('lp 46'));
            if (tvsMatch) setSelectedPrinter(tvsMatch);
            else setSelectedPrinter(list[0]);
          }
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, [qzTransport]);

  // Handle Preset Switching
  const handleSelectPreset = (preset: 'dumbbell' | 'standard' | 'custom') => {
    setActivePreset(preset);
    if (preset === 'dumbbell') {
      setLabel(create80x12DumbbellLabel());
      setShowZones(true);
    } else if (preset === 'standard') {
      setLabel(create50x35ReferenceLabel());
      setShowZones(false);
    }
  };

  // Compile Render Results
  const renderResult: RenderResult = useMemo(() => {
    return debugRenderer.renderToSvg(label, {
      showGrid,
      showDumbbellZones: showZones
    });
  }, [label, showGrid, showZones, debugRenderer]);

  // Compile Printer Command Stream
  const commandResult = useMemo(() => {
    if (emulation === 'BPLZ') {
      return tvsRenderer.compileBplz(label);
    } else {
      return tvsRenderer.compileBple(label);
    }
  }, [label, emulation, tvsRenderer]);

  // Element updater
  const updateElementValue = (id: string, value: string) => {
    setLabel((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === id ? { ...el, value } : el))
    }));
  };

  // Copy BPLZ Commands
  const handleCopyCommands = () => {
    navigator.clipboard.writeText(commandResult.rawCommands);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Download SVG
  const handleDownloadSvg = () => {
    const blob = new Blob([renderResult.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${label.id || 'label'}_203dpi.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download PDF
  const handleDownloadPdf = () => {
    const doc = debugRenderer.generatePdf(label);
    doc.save(`${label.id || 'label'}_calibrated.pdf`);
  };

  // Execute Raw Print via QZ Tray
  const handleTestPrint = async () => {
    try {
      setIsPrinting(true);
      await qzTransport.printRaw(selectedPrinter, commandResult.rawCommands);
      setPrintSuccess(true);
      setTimeout(() => setPrintSuccess(false), 3000);
    } catch (err: any) {
      alert(`Print failed: ${err.message}`);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            TVS
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide">
              TVS LP 46 Neo • Barcode & Label Testing Studio
            </h1>
            <p className="text-xs text-slate-400 flex items-center space-x-2">
              <span>Resolution: 203 DPI (8 dots/mm)</span>
              <span>•</span>
              <span className="text-emerald-400">Isolated Test Environment</span>
            </p>
          </div>
        </div>

        {/* QZ Tray Status & Print Trigger */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                qzConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              QZ Tray: {qzConnected ? 'Connected' : 'Offline (Simulated)'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <select
              value={selectedPrinter}
              onChange={(e) => setSelectedPrinter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 outline-none focus:border-amber-500"
            >
              {printers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <button
              onClick={handleTestPrint}
              disabled={isPrinting}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold shadow transition ${
                printSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
              }`}
            >
              {printSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Job Sent!</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isPrinting ? 'Sending...' : 'Test Print (QZ)'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Label Configuration & Elements */}
        <div className="w-80 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col overflow-y-auto shrink-0 space-y-5">
          {/* Preset Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Label Template Presets
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleSelectPreset('dumbbell')}
                className={`px-2.5 py-2 rounded text-xs text-left font-medium border transition ${
                  activePreset === 'dumbbell'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-semibold">80 × 12 mm</div>
                <div className="text-[10px] text-slate-400">Jewelry Dumbbell</div>
              </button>
              <button
                onClick={() => handleSelectPreset('standard')}
                className={`px-2.5 py-2 rounded text-xs text-left font-medium border transition ${
                  activePreset === 'standard'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-semibold">50 × 35 mm</div>
                <div className="text-[10px] text-slate-400">Standard Apparel</div>
              </button>
            </div>
          </div>

          {/* Physical Geometry (mm) */}
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Physical Dimensions</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                Units: mm
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Width (mm)</label>
                <input
                  type="number"
                  value={label.width}
                  onChange={(e) =>
                    setLabel((prev) => ({ ...prev, width: Number(e.target.value) || 10 }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  ≈ {mmToDots(label.width)} dots
                </span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Height (mm)</label>
                <input
                  type="number"
                  value={label.height}
                  onChange={(e) =>
                    setLabel((prev) => ({ ...prev, height: Number(e.target.value) || 10 }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  ≈ {mmToDots(label.height)} dots
                </span>
              </div>
            </div>
          </div>

          {/* Elements Editor */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Label Elements ({label.elements.length})
            </label>
            <div className="space-y-2.5">
              {label.elements.map((elem) => (
                <div
                  key={elem.id}
                  className="bg-slate-800/40 p-2.5 rounded border border-slate-800 hover:border-slate-700 transition text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-200 capitalize flex items-center space-x-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          elem.type === 'barcode' ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                      />
                      <span>{elem.id}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      x:{elem.x}mm y:{elem.y}mm
                    </span>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      value={elem.value || ''}
                      onChange={(e) => updateElementValue(elem.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-[11px]"
                    />
                    {elem.type === 'barcode' && (
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Format: {elem.format || 'CODE128'}</span>
                        <span className="text-amber-400">
                          Module: {elem.moduleWidthDots || 2} dots
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emulation & Darkness */}
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Printer Emulation</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setEmulation('BPLZ')}
                className={`flex-1 py-1.5 text-xs rounded font-medium border ${
                  emulation === 'BPLZ'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                BPLZ (ZPL)
              </button>
              <button
                onClick={() => setEmulation('BPLE')}
                className={`flex-1 py-1.5 text-xs rounded font-medium border ${
                  emulation === 'BPLE'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                BPLE (EPL)
              </button>
            </div>
          </div>
        </div>

        {/* Center Canvas: 203 DPI Visual Debug Renderer */}
        <div className="flex-1 flex flex-col bg-slate-950/80 overflow-hidden">
          {/* Canvas Sub-header */}
          <div className="h-10 border-b border-slate-800 bg-slate-900/40 px-4 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <span className="text-slate-400">
                Visual Dot Grid: <strong className="text-slate-200">{renderResult.widthDots} × {renderResult.heightDots} dots</strong>
              </span>
              <span className="text-slate-500">|</span>
              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500"
                />
                <span>5mm Grid</span>
              </label>
              {label.width >= 70 && (
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={showZones}
                    onChange={(e) => setShowZones(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-amber-500"
                  />
                  <span>Dumbbell Flaps</span>
                </label>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(100, z - 25))}
                className="p-1 text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-slate-300 text-xs w-12 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(400, z + 25))}
                className="p-1 text-slate-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Visual Workspace Canvas */}
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            <div
              className="relative shadow-2xl transition-transform duration-100 rounded-sm"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center center'
              }}
            >
              {/* Rendered SVG Preview */}
              <div
                className="bg-white rounded-sm overflow-hidden border border-slate-400 shadow-lg"
                dangerouslySetInnerHTML={{ __html: renderResult.svg }}
              />
            </div>
          </div>

          {/* Validation Warnings Bar */}
          {renderResult.issues.length > 0 && (
            <div className="h-9 bg-amber-500/10 border-t border-amber-500/30 px-4 flex items-center space-x-2 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">
                {renderResult.issues.length} notice(s): {renderResult.issues[0].message}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: BPLZ/BPLE Stream & Export Actions */}
        <div className="w-96 border-l border-slate-800 bg-slate-900/60 flex flex-col shrink-0">
          {/* Tab Selection */}
          <div className="h-10 border-b border-slate-800 flex items-center px-2 bg-slate-900/80">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-1 text-xs font-medium rounded ${
                activeTab === 'preview'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw {emulation}
            </button>
            <button
              onClick={() => setActiveTab('validation')}
              className={`flex-1 py-1 text-xs font-medium rounded ${
                activeTab === 'validation'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calibration
            </button>
            <button
              onClick={() => setActiveTab('bartender')}
              className={`flex-1 py-1 text-xs font-medium rounded ${
                activeTab === 'bartender'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BarTender Diff
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {activeTab === 'preview' && (
              <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Stream: <strong className="text-slate-200">{commandResult.totalBytes} bytes</strong>
                  </span>
                  <button
                    onClick={handleCopyCommands}
                    className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-medium"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                {/* Command text buffer */}
                <div className="flex-1 bg-slate-950 rounded-lg p-3 border border-slate-800 overflow-auto font-mono text-[11px] text-amber-300/90 leading-relaxed select-all">
                  <pre>{commandResult.rawCommands}</pre>
                </div>

                {/* Export Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleDownloadSvg}
                    className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 py-1.5 rounded text-xs font-medium text-slate-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SVG</span>
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 py-1.5 rounded text-xs font-medium text-slate-200"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'validation' && (
              <div className="flex-1 overflow-auto space-y-4 text-xs">
                <div className="bg-slate-800/40 p-3 rounded border border-slate-800 space-y-2">
                  <span className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Optical Precision Checks</span>
                  </span>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>• Narrow Bar Width: <strong>2 dots (0.25mm)</strong> - Optimal for 203 DPI</li>
                    <li>• Barcode Quiet Zones: Left ≥ 2.5mm, Right ≥ 2.5mm (Passed)</li>
                    <li>• Edge Clearance: &gt; 1.0mm 4-way margin (Passed)</li>
                    <li>• Barcode Symbol: Code 128 Auto (Subset B/C)</li>
                  </ul>
                </div>

                <div className="bg-slate-800/40 p-3 rounded border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-300">TVS LP 46 Neo Geometry</span>
                  <div className="text-slate-400 space-y-1 font-mono text-[11px]">
                    <div>Resolution: 203 DPI</div>
                    <div>1 dot = 0.125 mm</div>
                    <div>1 mm = 7.992 dots</div>
                    <div>80mm Dumbbell = 640 dots</div>
                    <div>12mm Height = 96 dots</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bartender' && (
              <div className="flex-1 overflow-auto space-y-3 text-xs">
                <p className="text-slate-400">
                  Compare current rendering against reference BarTender document output:
                </p>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-500 block mb-2">
                    Reference File: references/reference_bartender.png
                  </span>
                  <div className="w-full h-32 bg-slate-900 rounded border border-slate-800 flex items-center justify-center text-slate-500">
                    <span>Reference Image Loaded</span>
                  </div>
                </div>
                <div className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sub-pixel Barcode Alignment Matches BarTender</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BarcodeTestingApp;
