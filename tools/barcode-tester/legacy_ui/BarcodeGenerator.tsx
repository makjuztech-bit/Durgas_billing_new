import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, RotateCcw, FileDown } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Saree } from '@/types';
import { Button } from '@/components/ui/button';
import { BarcodeConfigSidebar } from '@/components/barcode/BarcodeConfigSidebar';
import { BarcodePreviewPanel } from '@/components/barcode/BarcodePreviewPanel';
import { printBarcodeLabels, downloadBarcodePdf } from '@/components/barcode/barcodePrintService';
import { useBarcodeGenerator } from '@/components/barcode/useBarcodeGenerator';


const BarcodeGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { sarees, settings } = useData();

  // Mode & Product state
  const [mode, setMode] = useState<'single' | 'sequence' | 'product'>('product');
  const [prefix, setPrefix] = useState('SK-');
  const [startNum, setStartNum] = useState(1001);
  const [count, setCount] = useState(12);
  const [copies, setCopies] = useState(1);
  const [labelType, setLabelType] = useState('Dumbbell-80x12');
  const [labelWidthMm, setLabelWidthMm] = useState(80);
  const [labelHeightMm, setLabelHeightMm] = useState(12);
  const [columnsCount, setColumnsCount] = useState(1);

  // Dumbbell flaps and safe 4-way margins (calibrated for TVS LP 46 Neo 203 DPI)
  const [flapLeftWidthPct, setFlapLeftWidthPct] = useState(33);
  const [flapRightWidthPct, setFlapRightWidthPct] = useState(33);
  const [marginTopMm, setMarginTopMm] = useState(0.8);
  const [marginBottomMm, setMarginBottomMm] = useState(0.8);
  const [marginLeftMm, setMarginLeftMm] = useState(1.0);
  const [marginRightMm, setMarginRightMm] = useState(1.0);

  // TVS LP 46 Neo Odd-Shape & Hardware Alignment Controls
  const [offsetXmm, setOffsetXmm] = useState(0);
  const [offsetYmm, setOffsetYmm] = useState(0);
  const [invertFlaps, setInvertFlaps] = useState(false);
  const [rotate180, setRotate180] = useState(false);
  const [rotate90, setRotate90] = useState(false);
  const [rotationAngle, setRotationAngle] = useState<0 | 90 | 180 | 270>(0);
  const [flipBackFlap180, setFlipBackFlap180] = useState(false);
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait' | 'auto'>('landscape');

  const [selectedProduct, setSelectedProduct] = useState<Saree | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSeries, setIsSeries] = useState(false);

  // Display & Sizing options
  const [showStoreName, setShowStoreName] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showBarcodeText, setShowBarcodeText] = useState(true);
  const [barcodeBarWidth, setBarcodeBarWidth] = useState(1.1);
  const [barcodeBarHeight, setBarcodeBarHeight] = useState(22);

  // Preview page pagination
  const [previewSheetIndex, setPreviewSheetIndex] = useState(0);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const filteredProducts = sarees
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sareeCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 5);

  const {
    barcodes,
    isThermal,
    labelsPerSheet,
    sheets,
    currentSheetIndexSafe,
    activeBarcodeString,
    barcodeValidation,
  } = useBarcodeGenerator({
    mode,
    prefix,
    startNum,
    count,
    copies,
    labelType,
    labelHeightMm,
    columnsCount,
    selectedProduct,
    isSeries,
    previewSheetIndex,
  });

  const storeName = settings?.shopName || 'DURGAS';

  const handleLabelTypeChange = (val: string) => {
    setLabelType(val);
    if (val === 'Dumbbell-80x12') {
      setLabelWidthMm(80); setLabelHeightMm(12); setColumnsCount(1);
      setBarcodeBarHeight(22); setBarcodeBarWidth(1.1);
      setFlapLeftWidthPct(33); setFlapRightWidthPct(33);
      setMarginTopMm(0.8); setMarginBottomMm(0.8); setMarginLeftMm(1.0); setMarginRightMm(1.0);
      setOffsetXmm(0); setOffsetYmm(0); setInvertFlaps(false); setRotate180(false); setRotate90(false); setRotationAngle(0); setFlipBackFlap180(false);
      setPrintOrientation('landscape');
    } else if (val === 'A4-24') {
      setLabelWidthMm(63.5); setLabelHeightMm(38.1); setColumnsCount(3);
      setBarcodeBarHeight(26); setBarcodeBarWidth(1.2);
    } else if (val === 'A4-40') {
      setLabelWidthMm(48.5); setLabelHeightMm(25.4); setColumnsCount(4);
      setBarcodeBarHeight(18); setBarcodeBarWidth(1.0);
    } else if (val === 'A4-65') {
      setLabelWidthMm(38.1); setLabelHeightMm(21.2); setColumnsCount(5);
      setBarcodeBarHeight(14); setBarcodeBarWidth(0.85);
    } else if (val === 'Thermal') {
      setLabelWidthMm(50); setLabelHeightMm(25); setColumnsCount(1);
      setBarcodeBarHeight(22); setBarcodeBarWidth(1.2);
    } else if (val === 'Thermal-Large') {
      setLabelWidthMm(100); setLabelHeightMm(50); setColumnsCount(1);
      setBarcodeBarHeight(36); setBarcodeBarWidth(1.8);
    }
  };

  const handlePrint = () => {
    printBarcodeLabels({
      barcodes, sheets, isThermal, storeName, selectedProduct,
      showStoreName, showProductName, showPrice, showBarcodeText,
      columnsCount, labelWidthMm, labelHeightMm,
      barcodeBarHeight, barcodeBarWidth,
      flapLeftWidthPct, flapRightWidthPct,
      marginTopMm, marginBottomMm, marginLeftMm, marginRightMm,
      offsetXmm, offsetYmm, invertFlaps, rotate180, rotate90, rotationAngle, flipBackFlap180, printOrientation,
    });
  };

  const handleDownloadPdf = () => {
    downloadBarcodePdf({
      barcodes, sheets, isThermal, storeName, selectedProduct,
      showStoreName, showProductName, showPrice, showBarcodeText,
      columnsCount, labelWidthMm, labelHeightMm,
      flapLeftWidthPct, flapRightWidthPct,
      marginTopMm, marginBottomMm, marginLeftMm, marginRightMm,
      offsetXmm, offsetYmm, invertFlaps, rotate180, rotate90, rotationAngle, flipBackFlap180, printOrientation,
    });
  };

  const handleReset = () => {
    setStartNum(1001);
    setCount(24);
    setSelectedProduct(null);
    setSearchTerm('');
    setPreviewSheetIndex(0);
    setOffsetXmm(0);
    setOffsetYmm(0);
    setInvertFlaps(false);
    setRotate180(false);
    setRotate90(false);
    setRotationAngle(0);
    setFlipBackFlap180(false);
    setPrintOrientation('landscape');
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-primary">Print Barcode Labels</h1>
          <p className="text-muted-foreground">Select products, configure stickers, and print on A4 sheets or thermal roll printers.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button onClick={handlePrint} disabled={barcodes.length === 0} className="shadow-sm">
            <Printer className="mr-2 h-4 w-4" /> Print {barcodes.length} Labels
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf} disabled={barcodes.length === 0} className="shadow-sm">
            <FileDown className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr] no-print">
        {/* Decomposed Sidebar */}
        <BarcodeConfigSidebar
          mode={mode}
          setMode={setMode}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredProducts={filteredProducts}
          isSeries={isSeries}
          setIsSeries={setIsSeries}
          prefix={prefix}
          setPrefix={setPrefix}
          startNum={startNum}
          setStartNum={setStartNum}
          count={count}
          setCount={setCount}
          copies={copies}
          setCopies={setCopies}
          labelType={labelType}
          onLabelTypeChange={handleLabelTypeChange}
          labelWidthMm={labelWidthMm}
          setLabelWidthMm={setLabelWidthMm}
          labelHeightMm={labelHeightMm}
          setLabelHeightMm={setLabelHeightMm}
          columnsCount={columnsCount}
          setColumnsCount={setColumnsCount}
          isThermal={isThermal}
          flapLeftWidthPct={flapLeftWidthPct}
          setFlapLeftWidthPct={setFlapLeftWidthPct}
          flapRightWidthPct={flapRightWidthPct}
          setFlapRightWidthPct={setFlapRightWidthPct}
          marginTopMm={marginTopMm}
          setMarginTopMm={setMarginTopMm}
          marginBottomMm={marginBottomMm}
          setMarginBottomMm={setMarginBottomMm}
          marginLeftMm={marginLeftMm}
          setMarginLeftMm={setMarginLeftMm}
          marginRightMm={marginRightMm}
          setMarginRightMm={setMarginRightMm}
          offsetXmm={offsetXmm}
          setOffsetXmm={setOffsetXmm}
          offsetYmm={offsetYmm}
          setOffsetYmm={setOffsetYmm}
          invertFlaps={invertFlaps}
          setInvertFlaps={setInvertFlaps}
          rotate180={rotate180}
          setRotate180={setRotate180}
          rotate90={rotate90}
          setRotate90={setRotate90}
          rotationAngle={rotationAngle}
          setRotationAngle={setRotationAngle}
          flipBackFlap180={flipBackFlap180}
          setFlipBackFlap180={setFlipBackFlap180}
          printOrientation={printOrientation}
          setPrintOrientation={setPrintOrientation}
          showStoreName={showStoreName}
          setShowStoreName={setShowStoreName}
          showProductName={showProductName}
          setShowProductName={setShowProductName}
          showPrice={showPrice}
          setShowPrice={setShowPrice}
          showBarcodeText={showBarcodeText}
          setShowBarcodeText={setShowBarcodeText}
          barcodeBarWidth={barcodeBarWidth}
          setBarcodeBarWidth={setBarcodeBarWidth}
          barcodeBarHeight={barcodeBarHeight}
          setBarcodeBarHeight={setBarcodeBarHeight}
          barcodeValidationValid={barcodeValidation.valid}
          totalLabels={barcodes.length}
          sheetsCount={sheets.length}
          labelsPerSheet={labelsPerSheet}
        />

        {/* Decomposed Preview Panel */}
        <BarcodePreviewPanel
          previewContainerRef={previewContainerRef}
          isThermal={isThermal}
          sheets={sheets}
          currentSheetIndex={currentSheetIndexSafe}
          onSheetChange={setPreviewSheetIndex}
          barcodes={barcodes}
          columnsCount={columnsCount}
          labelHeightMm={labelHeightMm}
          labelWidthMm={labelWidthMm}
          labelType={labelType}
          flapLeftWidthPct={flapLeftWidthPct}
          flapRightWidthPct={flapRightWidthPct}
          marginTopMm={marginTopMm}
          marginBottomMm={marginBottomMm}
          marginLeftMm={marginLeftMm}
          marginRightMm={marginRightMm}
          offsetXmm={offsetXmm}
          offsetYmm={offsetYmm}
          invertFlaps={invertFlaps}
          rotate180={rotate180}
          rotate90={rotate90}
          rotationAngle={rotationAngle}
          setRotationAngle={setRotationAngle}
          flipBackFlap180={flipBackFlap180}
          printOrientation={printOrientation}
          showStoreName={showStoreName}
          storeName={storeName}
          showProductName={showProductName}
          selectedProduct={selectedProduct}
          barcodeBarWidth={barcodeBarWidth}
          barcodeBarHeight={barcodeBarHeight}
          showBarcodeText={showBarcodeText}
          showPrice={showPrice}
        />
      </div>
    </div>
  );
};

export default BarcodeGenerator;
