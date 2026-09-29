import React, { useState, useRef, useEffect } from 'react';
import { Printer, Maximize2, FileText, CheckCircle2, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { BillReceipt, BillReceiptItem } from './BillReceipt';
import { StoreSettings } from '@/types';

interface BillingPreviewCardProps {
  paperType: 'thermal' | 'a4';
  items: BillReceiptItem[];
  customerName?: string;
  customerMobile?: string;
  customerPlace?: string;
  subTotal: number;
  totalDiscountAmount: number;
  totalTaxAmount: number;
  roundOff: number;
  grandTotal: number;
  paymentMethod: string;
  settings?: StoreSettings;
  onPrint: () => void;
}

export const BillingPreviewCard: React.FC<BillingPreviewCardProps> = ({
  paperType,
  items,
  customerName,
  customerMobile,
  customerPlace,
  subTotal,
  totalDiscountAmount,
  totalTaxAmount,
  roundOff,
  grandTotal,
  paymentMethod,
  settings,
  onPrint,
}) => {
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
  const [a4ViewMode, setA4ViewMode] = useState<'sheet' | 'summary'>('sheet');
  const [zoomMode, setZoomMode] = useState<'fit-page' | 'fit-width' | '100%'>('fit-page');

  // Exact standard A4 dimensions at 96 DPI: 210mm x 297mm = 794px x 1123px
  const A4_WIDTH = 794;
  const A4_BASE_HEIGHT = 1123;

  // Measurement references
  const cardContentRef = useRef<HTMLDivElement>(null);
  const invoiceMeasureRef = useRef<HTMLDivElement>(null);
  const dialogScrollRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState<number>(380);
  const [containerHeight, setContainerHeight] = useState<number>(520);
  const [actualDocHeight, setActualDocHeight] = useState<number>(A4_BASE_HEIGHT);

  // Measure card container dimensions
  useEffect(() => {
    if (!cardContentRef.current) return;
    const updateContainer = () => {
      if (cardContentRef.current) {
        setContainerWidth(cardContentRef.current.clientWidth || 380);
        setContainerHeight(cardContentRef.current.clientHeight || 520);
      }
    };
    updateContainer();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateContainer);
      observer.observe(cardContentRef.current);
      return () => observer.disconnect();
    }
  }, [a4ViewMode]);

  // Measure actual document height to prevent any clipping when bill has multiple items
  useEffect(() => {
    if (!invoiceMeasureRef.current) return;
    const updateHeight = () => {
      if (invoiceMeasureRef.current) {
        const measured = invoiceMeasureRef.current.scrollHeight || invoiceMeasureRef.current.offsetHeight || A4_BASE_HEIGHT;
        setActualDocHeight(Math.max(A4_BASE_HEIGHT, measured));
      }
    };
    updateHeight();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateHeight);
      observer.observe(invoiceMeasureRef.current);
      return () => observer.disconnect();
    }
  }, [items, customerName, customerMobile, customerPlace]);

  // Available container bounds for preview calculations (accounting for container padding)
  const availableW = Math.max(220, containerWidth - 24);
  const availableH = Math.max(320, containerHeight - 24);

  // Exact scale calculations:
  // 1. Fit Entire Page: guarantees both full width AND full 1123px length fit without any vertical scrolling
  const fitPageScale = Math.min(availableW / A4_WIDTH, availableH / actualDocHeight, 1.0);
  // 2. Fit Width: fills the card width with comfortable reading size, enables smooth vertical scrolling
  const fitWidthScale = Math.min(availableW / A4_WIDTH, 1.0);

  // Compute active scale based on chosen mode
  const activeScale = Number(
    (zoomMode === 'fit-page' ? fitPageScale : zoomMode === 'fit-width' ? fitWidthScale : 1.0).toFixed(3)
  );

  // Scaled dimensions for the layout box
  const scaledWidth = Math.round(A4_WIDTH * activeScale);
  const scaledHeight = Math.round(actualDocHeight * activeScale);

  // Dialog zoom state
  const [dialogZoomMode, setDialogZoomMode] = useState<'fit-page' | '100%'>('fit-page');

  return (
    <>
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="py-2.5 px-3 sm:px-4 bg-muted/20 border-b flex flex-row items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 truncate">
            <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">Preview ({paperType === 'thermal' ? '80mm Thermal' : 'A4 Invoice'})</span>
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {paperType === 'a4' && (
              <>
                {a4ViewMode === 'sheet' && (
                  <div className="flex items-center border rounded px-1 bg-background text-[11px]">
                    <button
                      type="button"
                      onClick={() => setZoomMode('fit-page')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        zoomMode === 'fit-page' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Fit Entire Page (Full length visible, no clipping)"
                    >
                      Full Page
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomMode('fit-width')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        zoomMode === 'fit-width' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Fit Width (Fill card width, scrollable)"
                    >
                      Fit Width
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomMode('100%')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        zoomMode === '100%' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="100% Actual Print Resolution"
                    >
                      100%
                    </button>
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setA4ViewMode(a4ViewMode === 'sheet' ? 'summary' : 'sheet')}
                  className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                >
                  {a4ViewMode === 'sheet' ? 'Summary' : 'Sheet'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullPreviewOpen(true)}
                  className="h-7 text-xs px-2 gap-1 text-primary"
                  title="Expand to Full Screen A4 View"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Expand
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onPrint}
              disabled={items.length === 0}
              className="h-7 text-xs px-2.5 gap-1 shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>
        </CardHeader>

        <CardContent
          ref={cardContentRef}
          className="p-2 sm:p-3 bg-slate-100 min-h-[400px] max-h-[620px] overflow-y-auto overflow-x-auto flex justify-center items-start"
        >
          {paperType === 'thermal' ? (
            /* Thermal 80mm POS receipt format */
            <div className="w-full flex justify-center py-2">
              <BillReceipt
                paperType="thermal"
                billNo="PREVIEW"
                customerName={customerName}
                customerMobile={customerMobile}
                customerPlace={customerPlace}
                items={items}
                subTotal={subTotal}
                discountAmount={totalDiscountAmount}
                taxAmount={totalTaxAmount}
                roundOff={roundOff}
                grandTotal={grandTotal}
                paymentMethod={paymentMethod}
                settings={settings}
              />
            </div>
          ) : a4ViewMode === 'sheet' ? (
            /* Mathematically exact scaled A4 document box (zero clipping, full length shown) */
            <div className="w-full flex flex-col items-center py-2">
              <div
                className="relative rounded-md border border-gray-300 shadow-md bg-white transition-all duration-150 overflow-hidden shrink-0"
                style={{
                  width: `${scaledWidth}px`,
                  height: `${scaledHeight}px`,
                }}
              >
                <div
                  ref={invoiceMeasureRef}
                  style={{
                    width: `${A4_WIDTH}px`,
                    minHeight: `${A4_BASE_HEIGHT}px`,
                    transform: `scale(${activeScale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                >
                  <BillReceipt
                    paperType="a4"
                    billNo="PREVIEW"
                    customerName={customerName}
                    customerMobile={customerMobile}
                    customerPlace={customerPlace}
                    items={items}
                    subTotal={subTotal}
                    discountAmount={totalDiscountAmount}
                    taxAmount={totalTaxAmount}
                    roundOff={roundOff}
                    grandTotal={grandTotal}
                    paymentMethod={paymentMethod}
                    settings={settings}
                  />
                </div>
              </div>

              <div className="text-center mt-2 text-[10px] text-muted-foreground">
                A4 Dimensions: 210 × 297 mm ({A4_WIDTH} × {actualDocHeight} px) • Scale: {Math.round(activeScale * 100)}%
              </div>
            </div>
          ) : (
            /* Fast compact summary card */
            <div className="w-full space-y-3 bg-white border border-gray-200 rounded-lg p-4 shadow-xs text-xs my-1">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 leading-tight">A4 GST Tax Invoice</h4>
                    <span className="text-[10px] text-muted-foreground">Standard 210 × 297 mm format</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsFullPreviewOpen(true)}
                  className="h-7 text-xs gap-1"
                >
                  <Maximize2 className="h-3 w-3" />
                  Inspect Full A4
                </Button>
              </div>

              <div className="space-y-1.5 py-1 text-[11px] text-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-semibold">{customerName || 'Walk-in Customer'}</span>
                </div>
                {customerMobile && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Mobile:</span>
                    <span className="font-mono">{customerMobile}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Line Items:</span>
                  <span className="font-medium">{items.length} items ({items.reduce((s, i) => s + i.qty, 0)} qty)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Gross Subtotal:</span>
                  <span className="font-mono">₹{subTotal.toFixed(2)}</span>
                </div>
                {totalDiscountAmount > 0 && (
                  <div className="flex justify-between items-center text-amber-700">
                    <span>Total Discount:</span>
                    <span className="font-mono">-₹{totalDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                {totalTaxAmount > 0 && (
                  <div className="flex justify-between items-center text-sky-700">
                    <span>GST (CGST+SGST):</span>
                    <span className="font-mono">+₹{totalTaxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-xs pt-1.5 border-t text-primary">
                  <span>NET TOTAL:</span>
                  <span className="font-mono text-sm">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-[10.5px] text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Standard A4 layout ready for laser or desktop printing.</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full-Page High-Res Dialog for Inspecting Standard A4 Tax Invoice */}
      <Dialog open={isFullPreviewOpen} onOpenChange={setIsFullPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[96vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="p-3 sm:p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Standard A4 Tax Invoice Preview (210 × 297 mm)
            </DialogTitle>

            <div className="flex items-center gap-2 mr-6">
              <div className="flex items-center border rounded px-1 bg-background text-xs">
                <button
                  type="button"
                  onClick={() => setDialogZoomMode('fit-page')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    dialogZoomMode === 'fit-page' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Fit Window
                </button>
                <button
                  type="button"
                  onClick={() => setDialogZoomMode('100%')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    dialogZoomMode === '100%' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  100% Size
                </button>
              </div>
            </div>
          </DialogHeader>

          <div
            ref={dialogScrollRef}
            className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 bg-slate-200/80 flex justify-center items-start"
          >
            {dialogZoomMode === 'fit-page' ? (
              /* Scaled to fit dialog viewport cleanly without clipping */
              <div
                className="relative rounded-lg shadow-2xl bg-white transition-all overflow-hidden my-auto"
                style={{
                  width: `${Math.round(A4_WIDTH * 0.72)}px`,
                  height: `${Math.round(actualDocHeight * 0.72)}px`,
                }}
              >
                <div
                  style={{
                    width: `${A4_WIDTH}px`,
                    minHeight: `${A4_BASE_HEIGHT}px`,
                    transform: 'scale(0.72)',
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                >
                  <BillReceipt
                    paperType="a4"
                    billNo="PREVIEW"
                    customerName={customerName}
                    customerMobile={customerMobile}
                    customerPlace={customerPlace}
                    items={items}
                    subTotal={subTotal}
                    discountAmount={totalDiscountAmount}
                    taxAmount={totalTaxAmount}
                    roundOff={roundOff}
                    grandTotal={grandTotal}
                    paymentMethod={paymentMethod}
                    settings={settings}
                  />
                </div>
              </div>
            ) : (
              /* Full 100% standard A4 sheet (794px by actual height) */
              <div className="shadow-2xl rounded-lg my-1">
                <BillReceipt
                  paperType="a4"
                  billNo="PREVIEW"
                  customerName={customerName}
                  customerMobile={customerMobile}
                  customerPlace={customerPlace}
                  items={items}
                  subTotal={subTotal}
                  discountAmount={totalDiscountAmount}
                  taxAmount={totalTaxAmount}
                  roundOff={roundOff}
                  grandTotal={grandTotal}
                  paymentMethod={paymentMethod}
                  settings={settings}
                />
              </div>
            )}
          </div>

          <DialogFooter className="p-3 border-t bg-muted/10 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Standard A4 Sheet (210 × 297 mm • 794 × 1123 px at 96 DPI)</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsFullPreviewOpen(false)}>
                Close
              </Button>
              <Button size="sm" onClick={onPrint} className="gap-1.5">
                <Printer className="h-4 w-4" />
                Print A4 Invoice
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
