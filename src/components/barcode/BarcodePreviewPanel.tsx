import React from 'react';
import Barcode from 'react-barcode';
import { Package, ChevronLeft, ChevronRight, Layers, Printer, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Saree } from '@/types';
import { LOGO_EMBLEM_BASE64 } from './logoEmblemBase64';

interface BarcodePreviewPanelProps {
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  isThermal: boolean;
  sheets: string[][];
  currentSheetIndex: number;
  onSheetChange: (idx: number) => void;
  barcodes: string[];
  columnsCount: number;
  labelHeightMm: number;
  labelWidthMm?: number;
  labelType?: string;
  flapLeftWidthPct?: number;
  flapRightWidthPct?: number;
  marginTopMm?: number;
  marginBottomMm?: number;
  marginLeftMm?: number;
  marginRightMm?: number;
  showStoreName: boolean;
  storeName: string;
  showProductName: boolean;
  selectedProduct: Saree | null;
  barcodeBarWidth: number;
  barcodeBarHeight: number;
  showBarcodeText: boolean;
  showPrice: boolean;
  offsetXmm?: number;
  offsetYmm?: number;
  invertFlaps?: boolean;
  rotate180?: boolean;
  rotate90?: boolean;
  rotationAngle?: 0 | 90 | 180 | 270;
  setRotationAngle?: (val: 0 | 90 | 180 | 270) => void;
  flipBackFlap180?: boolean;
  printOrientation?: 'landscape' | 'portrait' | 'auto';
}

export const BarcodePreviewPanel: React.FC<BarcodePreviewPanelProps> = ({
  previewContainerRef,
  isThermal,
  sheets,
  currentSheetIndex,
  onSheetChange,
  barcodes,
  columnsCount,
  labelHeightMm,
  labelWidthMm = 80,
  labelType = 'Dumbbell-80x12',
  flapLeftWidthPct = 33,
  flapRightWidthPct = 33,
  marginTopMm = 0.8,
  marginBottomMm = 0.8,
  marginLeftMm = 1.0,
  marginRightMm = 1.0,
  offsetXmm = 0,
  offsetYmm = 0,
  invertFlaps = false,
  rotate180 = false,
  rotate90 = false,
  rotationAngle = 0,
  setRotationAngle,
  flipBackFlap180 = false,
  printOrientation = 'landscape',
  showStoreName,
  storeName,
  showProductName,
  selectedProduct,
  barcodeBarWidth,
  barcodeBarHeight,
  showBarcodeText,
  showPrice,
}) => {
  const isDumbbell =
    labelType.includes('Dumbbell') ||
    (labelWidthMm === 80 && labelHeightMm === 12) ||
    labelHeightMm <= 16;

  const effectiveRotation = typeof rotationAngle === 'number'
    ? rotationAngle
    : rotate90
    ? 90
    : rotate180
    ? 180
    : 0;

  const isRotated90or270 = effectiveRotation === 90 || effectiveRotation === 270;
  const currentSheetCodes = isThermal ? barcodes.slice(0, 4) : sheets[currentSheetIndex] || [];
  const middleWidthPct = Math.max(0, 100 - flapLeftWidthPct - flapRightWidthPct);

  const itemName = (showProductName && selectedProduct)
    ? selectedProduct.name.substring(0, 16)
    : 'GOLD ORNAMENT';
  const priceVal = showPrice
    ? (selectedProduct?.sellingPrice?.toLocaleString('en-IN') || '4,999')
    : '4,999';
  const weightVal = selectedProduct?.weight || '8.000g';
  const karatVal = selectedProduct?.material || '916 KDM';

  return (
    <div className="flex flex-col gap-3">
      {/* Top Simulation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/40 p-3 rounded-lg border gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {isDumbbell ? 'TVS LP 46 Neo • Dumbbell Print Preview' : 'Live Sheet Simulation'}
          </span>
          {isDumbbell && (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[10px] py-0 px-2 font-mono">
              80 × 12 mm • 203 DPI
            </Badge>
          )}
        </div>

        {sheets.length > 1 && !isThermal && (
          <div className="flex items-center gap-1.5 text-xs">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => onSheetChange(Math.max(0, currentSheetIndex - 1))}
              disabled={currentSheetIndex === 0}
            >
              <ChevronLeft className="h-3 w-3 mr-1" /> Prev Sheet
            </Button>
            <span className="font-semibold px-1">
              Sheet {currentSheetIndex + 1} of {sheets.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => onSheetChange(Math.min(sheets.length - 1, currentSheetIndex + 1))}
              disabled={currentSheetIndex >= sheets.length - 1}
            >
              Next Sheet <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}

        {isDumbbell && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>4 Margins Protected: Top {marginTopMm}mm • Bottom {marginBottomMm}mm • Sides {marginLeftMm}mm</span>
          </div>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="bg-slate-100/70 p-6 rounded-lg border flex flex-col items-center justify-start overflow-auto min-h-[520px]">
        {isDumbbell && (
          <div className="w-full max-w-xl mb-3 flex items-center justify-between text-[11px] text-muted-foreground bg-white/80 backdrop-blur px-3 py-1.5 rounded border shadow-2xs">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Printer className="h-3 w-3 text-primary" /> TVS LP 46 Neo Continuous Roll Mode
            </span>
            <span>
              Flaps: Left <strong>{flapLeftWidthPct}%</strong> (~26mm) • Tail <strong>{middleWidthPct}%</strong> (~28mm) • Right <strong>{flapRightWidthPct}%</strong> (~26mm)
            </span>
          </div>
        )}

        <div
          ref={previewContainerRef}
          className={`bg-white shadow-sm rounded border border-gray-300 ${
            isThermal ? 'w-full max-w-xl p-4' : 'w-[210mm] min-h-[297mm] p-5'
          }`}
          style={{ margin: '0 auto' }}
        >
          {barcodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
              <Package className="h-12 w-12 opacity-20" />
              <p className="text-xs">Select a product or enter code to see live preview</p>
            </div>
          ) : isDumbbell ? (
            /* 80mm x 12mm TVS LP 46 Neo Jewelry Dumbbell Label Simulation */
            <div className="flex flex-col gap-4">
              {currentSheetCodes.map((code, idx) => {
                const storeFlapContent = (isFlipped: boolean) => (
                  <div
                    className={`h-full flex flex-col items-center justify-center shrink-0 border-r border-dashed border-slate-300 bg-emerald-50/25 transition-transform duration-200 ${
                      isFlipped ? 'rotate-180' : ''
                    }`}
                    style={{
                      width: `${flapLeftWidthPct}%`,
                      paddingLeft: `${marginLeftMm * 3}px`,
                      paddingRight: `${marginRightMm * 3}px`,
                    }}
                  >
                    {showStoreName && (
                      <>
                        <img
                          src={LOGO_EMBLEM_BASE64}
                          alt="Logo"
                          className="max-h-[18px] max-w-[42px] object-contain mb-0.5"
                        />
                        <div
                          className="text-[9px] font-black text-[#065f3d] leading-tight truncate tracking-wider"
                          style={{ fontFamily: '"Cinzel", Georgia, serif' }}
                        >
                          {storeName || 'DURGAS'}
                        </div>
                      </>
                    )}
                    <div
                      className="text-[7.5px] font-bold text-slate-800 leading-tight mt-0.5 truncate tracking-tight"
                      style={{ fontFamily: '"Inter", sans-serif' }}
                    >
                      W: {weightVal} • {karatVal}
                    </div>
                  </div>
                );

                const barcodeFlapContent = (isFlipped: boolean) => (
                  <div
                    className={`h-full flex flex-col items-stretch justify-between shrink-0 border-l border-dashed border-slate-300 px-2 py-1 bg-white transition-transform duration-200 ${
                      isFlipped ? 'rotate-180' : ''
                    }`}
                    style={{
                      width: `${flapRightWidthPct}%`,
                      paddingLeft: `${marginLeftMm * 3}px`,
                      paddingRight: `${marginRightMm * 3}px`,
                    }}
                  >
                    {/* Top Item & Price Row */}
                    <div className="flex items-center justify-between w-full leading-tight">
                      <span
                        className="text-[7.5px] font-bold text-slate-800 truncate uppercase max-w-[55%]"
                        style={{ fontFamily: '"Inter", sans-serif' }}
                      >
                        {itemName}
                      </span>
                      <span
                        className="text-[9.5px] font-black text-black tracking-tight"
                        style={{ fontFamily: '"Inter", sans-serif' }}
                      >
                        ₹{priceVal}
                      </span>
                    </div>

                    {/* Middle Barcode Box */}
                    <div className="w-full flex items-center justify-center my-0.5 overflow-hidden h-[26px]">
                      <Barcode
                        value={code || 'SK-000000'}
                        width={Math.max(1.0, barcodeBarWidth * 0.9)}
                        height={Math.max(16, barcodeBarHeight * 0.75)}
                        fontSize={0}
                        margin={2}
                        displayValue={false}
                        background="transparent"
                      />
                    </div>

                    {/* Bottom Human-Readable Code */}
                    {showBarcodeText && (
                      <div className="text-[7.5px] font-bold text-slate-900 font-mono text-center tracking-wider truncate leading-none">
                        {code}
                      </div>
                    )}
                  </div>
                );

                return (
                  <div key={`${code}-${idx}`} className="flex flex-col items-center gap-1 w-full max-w-xl">
                    <div className="flex flex-wrap items-center justify-between w-full px-1 text-[10px] text-slate-500 font-mono gap-1">
                      <span>Label #{idx + 1} ({labelWidthMm}mm × {labelHeightMm}mm)</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[9.5px]">
                          Origin: X: {offsetXmm >= 0 ? '+' : ''}{offsetXmm}mm, Y: {offsetYmm >= 0 ? '+' : ''}{offsetYmm}mm
                        </span>
                        <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-700 border-slate-300 py-0">
                          {printOrientation}
                        </Badge>
                        {invertFlaps && (
                          <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-800 border-amber-300 py-0">
                            Swapped Flaps
                          </Badge>
                        )}
                        {effectiveRotation === 90 && (
                          <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-800 border-blue-300 py-0 font-bold">
                            90° Rotated (Vertical Feed)
                          </Badge>
                        )}
                        {effectiveRotation === 180 && (
                          <Badge variant="outline" className="text-[9px] bg-indigo-50 text-indigo-800 border-indigo-300 py-0">
                            180° Rotated
                          </Badge>
                        )}
                        {effectiveRotation === 270 && (
                          <Badge variant="outline" className="text-[9px] bg-purple-50 text-purple-800 border-purple-300 py-0">
                            270° Rotated
                          </Badge>
                        )}
                        {flipBackFlap180 && (
                          <Badge variant="outline" className="text-[9px] bg-purple-50 text-purple-800 border-purple-300 py-0">
                            Fold 180° Inverted
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Physical Dumbbell Shape Simulation */}
                    {isRotated90or270 ? (
                      <div className="flex flex-col items-center justify-center my-2 w-full">
                        <div
                          className="relative flex items-center justify-center bg-slate-50/90 border border-dashed border-slate-300 rounded-xl overflow-hidden shadow-xs select-none"
                          style={{
                            width: '92px',
                            height: '420px',
                          }}
                        >
                          <div
                            className="absolute flex items-center justify-between bg-white border border-slate-300 rounded-lg shadow-sm"
                            style={{
                              width: '400px',
                              height: '76px',
                              transform: `rotate(${effectiveRotation}deg)`,
                              transformOrigin: 'center center',
                              paddingTop: `${marginTopMm * 2.5}px`,
                              paddingBottom: `${marginBottomMm * 2.5}px`,
                            }}
                          >
                            <div
                              className="w-full h-full flex items-center justify-between transition-all duration-200"
                              style={{
                                transform: `translate(${offsetXmm * 2.5}px, ${offsetYmm * 2.5}px)`,
                              }}
                            >
                              {invertFlaps ? barcodeFlapContent(false) : storeFlapContent(false)}

                              <div
                                className="h-full flex flex-col items-center justify-between shrink-0 bg-slate-100/90 relative"
                                style={{ width: `${middleWidthPct}%` }}
                              >
                                <div className="w-full h-[18px] bg-slate-200/80 border-b border-dashed border-slate-300 rounded-b-md flex items-center justify-center">
                                  <span className="text-[6px] text-slate-500 font-mono">Die-Cut Notch</span>
                                </div>
                                <div className="w-full h-[22px] bg-amber-500/10 border-y border-dashed border-amber-500/30 flex items-center justify-center px-1">
                                  <span className="text-[6.5px] font-bold text-amber-800 uppercase tracking-widest whitespace-nowrap">
                                    Fold / Ring String
                                  </span>
                                </div>
                                <div className="w-full h-[18px] bg-slate-200/80 border-t border-dashed border-slate-300 rounded-t-md flex items-center justify-center">
                                  <span className="text-[6px] text-slate-500 font-mono">No-Print Zone</span>
                                </div>
                              </div>

                              {invertFlaps ? storeFlapContent(flipBackFlap180) : barcodeFlapContent(flipBackFlap180)}
                            </div>
                          </div>
                        </div>
                        <div className="text-[9.5px] text-slate-500 font-mono mt-1.5 flex items-center gap-1.5">
                          <span>Feed Orientation: 12mm Width &times; 80mm Length (Rotated {effectiveRotation}&deg;)</span>
                          {setRotationAngle && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1.5 text-[9px] text-blue-700 hover:text-blue-900 hover:bg-blue-50"
                              onClick={() => setRotationAngle(0)}
                            >
                              Reset to 0&deg;
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`w-full relative flex items-center justify-between bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden select-none transition-transform duration-300 ${
                          effectiveRotation === 180 ? 'rotate-180' : ''
                        }`}
                        style={{
                          height: '76px', // Scaled height for crisp on-screen preview
                          paddingTop: `${marginTopMm * 2.5}px`,
                          paddingBottom: `${marginBottomMm * 2.5}px`,
                        }}
                      >
                        {/* Printable Content with start origin shift offsets */}
                        <div
                          className="w-full h-full flex items-center justify-between transition-all duration-200"
                          style={{
                            transform: `translate(${offsetXmm * 2.5}px, ${offsetYmm * 2.5}px)`,
                          }}
                        >
                          {/* Leading Flap */}
                          {invertFlaps ? barcodeFlapContent(false) : storeFlapContent(false)}

                          {/* Middle Dumbbell Loop / Tail (Non-Printable Fold Area with Cutaways) */}
                          <div
                            className="h-full flex flex-col items-center justify-between shrink-0 bg-slate-100/90 relative"
                            style={{ width: `${middleWidthPct}%` }}
                          >
                            {/* Top Notch Cutaway */}
                            <div className="w-full h-[18px] bg-slate-200/80 border-b border-dashed border-slate-300 rounded-b-md flex items-center justify-center">
                              <span className="text-[6px] text-slate-500 font-mono">Die-Cut Notch</span>
                            </div>

                            {/* Center Folding Bridge Strip */}
                            <div className="w-full h-[22px] bg-amber-500/10 border-y border-dashed border-amber-500/30 flex items-center justify-center px-1">
                              <span className="text-[6.5px] font-bold text-amber-800 uppercase tracking-widest whitespace-nowrap">
                                Fold / Ring String
                              </span>
                            </div>

                            {/* Bottom Notch Cutaway */}
                            <div className="w-full h-[18px] bg-slate-200/80 border-t border-dashed border-slate-300 rounded-t-md flex items-center justify-center">
                              <span className="text-[6px] text-slate-500 font-mono">No-Print Zone</span>
                            </div>
                          </div>

                          {/* Trailing Flap (Optional Fold Inversion) */}
                          {invertFlaps ? storeFlapContent(flipBackFlap180) : barcodeFlapContent(flipBackFlap180)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Standard Sheet / Large Label Simulation */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isThermal ? '1fr' : `repeat(${columnsCount}, 1fr)`,
                gap: isThermal ? '10px' : '8px',
              }}
            >
              {currentSheetCodes.map((code, idx) => (
                <div
                  key={`${code}-${idx}`}
                  className="flex flex-row items-stretch justify-start border border-slate-200 p-2 text-[#065f3d] rounded-md bg-white shadow-sm overflow-hidden"
                  style={{ minHeight: `${Math.max(70, labelHeightMm * 3.78)}px` }}
                >
                  <div className="flex flex-col items-center justify-between w-[32%] shrink-0 px-1 border-r border-slate-200">
                    {showStoreName && (
                      <img src={LOGO_EMBLEM_BASE64} alt="Logo" className="w-[85%] max-h-[22px] object-contain mb-1" />
                    )}
                    <div className="w-full flex justify-center my-0.5 px-0.5 box-border">
                      <Barcode
                        value={code}
                        width={Math.max(1.0, barcodeBarWidth * 0.85)}
                        height={barcodeBarHeight * 0.8}
                        fontSize={0}
                        displayValue={false}
                        margin={4}
                        background="transparent"
                      />
                    </div>
                    {showBarcodeText && (
                      <div className="text-[7.5px] font-bold tracking-wider text-black font-mono text-center">
                        {code}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 justify-between min-w-0 pl-2">
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[8.5px] font-extrabold text-black uppercase truncate">{itemName}</span>
                      <span className="text-[12px] font-black text-black">₹{priceVal}</span>
                    </div>
                    <div className="text-[7.5px] text-slate-600">
                      W: {weightVal} • {karatVal}
                    </div>
                    <div className="text-[7.5px] font-mono text-slate-500">
                      CODE: {selectedProduct?.sareeCode || code}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
