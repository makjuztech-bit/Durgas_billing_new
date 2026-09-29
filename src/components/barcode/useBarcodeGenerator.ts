import { useMemo } from 'react';
import { Saree } from '@/types';
import { verifyBarcodeSoftware } from '@/lib/barcodeValidator';

export interface UseBarcodeGeneratorProps {
  mode: 'single' | 'sequence' | 'product';
  prefix: string;
  startNum: number;
  count: number;
  copies: number;
  labelType: string;
  labelHeightMm: number;
  columnsCount: number;
  selectedProduct: Saree | null;
  isSeries: boolean;
  previewSheetIndex: number;
}

export function useBarcodeGenerator({
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
}: UseBarcodeGeneratorProps) {
  const barcodes = useMemo(() => {
    const codes: string[] = [];
    if (mode === 'product') {
      if (!selectedProduct) return [];
      if (isSeries) {
        const baseBarcode = selectedProduct.barcode;
        const match = baseBarcode.match(/^(.*?)(\d+)$/);
        const basePrefix = match ? match[1] : baseBarcode;
        const baseNum = match ? parseInt(match[2], 10) : 0;

        for (let i = 0; i < count; i++) {
          codes.push(`${basePrefix}${baseNum + i}`);
        }
      } else {
        for (let i = 0; i < count; i++) {
          codes.push(selectedProduct.barcode);
        }
      }
    } else if (mode === 'single') {
      const val = `${prefix}${startNum}`;
      for (let i = 0; i < count; i++) {
        codes.push(val);
      }
    } else {
      for (let i = 0; i < count; i++) {
        codes.push(`${prefix}${startNum + i}`);
      }
    }

    const finalCodes: string[] = [];
    codes.forEach((c) => {
      for (let j = 0; j < copies; j++) {
        finalCodes.push(c);
      }
    });

    return finalCodes;
  }, [mode, selectedProduct, isSeries, count, prefix, startNum, copies]);

  const isThermal = labelType.startsWith('Thermal') || labelType.includes('Dumbbell') || labelType === 'Dumbbell-80x12';

  const labelsPerSheet = useMemo(() => {
    if (isThermal) return 1;
    if (labelType === 'A4-24') return 24;
    if (labelType === 'A4-40') return 40;
    if (labelType === 'A4-65') return 65;
    const rows = Math.max(1, Math.floor(280 / Math.max(15, labelHeightMm)));
    return Math.max(1, columnsCount * rows);
  }, [isThermal, labelType, labelHeightMm, columnsCount]);

  const sheets = useMemo(() => {
    if (barcodes.length === 0) return [[]];
    if (isThermal) {
      return barcodes.map((c) => [c]);
    }
    const pages: string[][] = [];
    for (let i = 0; i < barcodes.length; i += labelsPerSheet) {
      pages.push(barcodes.slice(i, i + labelsPerSheet));
    }
    return pages.length > 0 ? pages : [[]];
  }, [barcodes, isThermal, labelsPerSheet]);

  const currentSheetIndexSafe = Math.min(previewSheetIndex, Math.max(0, sheets.length - 1));

  const activeBarcodeString = barcodes[0] || (selectedProduct ? selectedProduct.barcode : `${prefix}${startNum}`);
  const barcodeValidation = useMemo(() => {
    return verifyBarcodeSoftware(activeBarcodeString);
  }, [activeBarcodeString]);

  return {
    barcodes,
    isThermal,
    labelsPerSheet,
    sheets,
    currentSheetIndexSafe,
    activeBarcodeString,
    barcodeValidation,
  };
}
