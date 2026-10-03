export interface LabelDimensions {
  widthMm: number;
  heightMm: number;
  dpi: number; // Default: 203
  widthDots: number;
  heightDots: number;
}

export type ElementType = 'text' | 'barcode' | 'qr' | 'image' | 'shape';

export interface LabelElement {
  id: string;
  type: ElementType;
  x: number; // mm
  y: number; // mm
  width?: number; // mm
  height?: number; // mm
  value?: string;
  rotation?: 0 | 90 | 180 | 270;
  
  fontSizeMm?: number;
  fontFamily?: string;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  
  format?: 'CODE128' | 'EAN13' | 'QR';
  moduleWidthDots?: number;
  displayValue?: boolean;
  quietZoneMm?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  
  dataUrl?: string;
  shape?: 'rect' | 'line';
  lineWidthMm?: number;
}

export interface LabelDefinition {
  id: string;
  name: string;
  width: number; // mm
  height: number; // mm
  dpi: number; // 203
  elements: LabelElement[];
  copies?: number;
  gapMm?: number;
  orientation?: 'landscape' | 'portrait';
  metadata?: Record<string, any>;
}

export function mmToDots(mm: number, dpi: number = 203): number {
  return Math.round((mm * dpi) / 25.4);
}

export function dotsToMm(dots: number, dpi: number = 203): number {
  return Number(((dots * 25.4) / dpi).toFixed(2));
}

/**
 * 50 × 35 mm Reference Label (≈ 400 × 280 dots at 203 DPI)
 */
export function create50x35ReferenceLabel(): LabelDefinition {
  return {
    id: 'std_50x35',
    name: 'Standard Apparel (50 × 35 mm)',
    width: 50,
    height: 35,
    dpi: 203,
    elements: [
      {
        id: 'store_header',
        type: 'text',
        x: 4,
        y: 3,
        fontSizeMm: 3.5,
        bold: true,
        value: 'DURGAS SILKS'
      },
      {
        id: 'product_name',
        type: 'text',
        x: 4,
        y: 8,
        fontSizeMm: 2.5,
        value: 'Kanchipuram Silk Saree'
      },
      {
        id: 'barcode_main',
        type: 'barcode',
        x: 4,
        y: 13,
        width: 42,
        height: 11,
        format: 'CODE128',
        moduleWidthDots: 2,
        value: '8901234567890',
        displayValue: true
      },
      {
        id: 'price_tag',
        type: 'text',
        x: 4,
        y: 28,
        fontSizeMm: 3.8,
        bold: true,
        value: 'MRP: ₹4,999.00'
      },
      {
        id: 'sku_tag',
        type: 'text',
        x: 30,
        y: 28,
        fontSizeMm: 2.4,
        value: 'SKU: SK-1042'
      }
    ]
  };
}

/**
 * TVS LP 46 Neo 80 × 12 mm Dumbbell Label (≈ 640 × 96 dots at 203 DPI)
 */
export function create80x12DumbbellLabel(): LabelDefinition {
  return {
    id: 'tvs_dumbbell_80x12',
    name: 'TVS Jewelry Dumbbell (80 × 12 mm)',
    width: 80,
    height: 12,
    dpi: 203,
    elements: [
      // Left Wing (Flap 1: 0 - 26mm)
      {
        id: 'fl1_store',
        type: 'text',
        x: 1.5,
        y: 1.2,
        fontSizeMm: 2.2,
        bold: true,
        value: 'DURGAS JEWELLERS'
      },
      {
        id: 'fl1_name',
        type: 'text',
        x: 1.5,
        y: 4.5,
        fontSizeMm: 1.8,
        value: 'Gold Stud 22KT 3.4g'
      },
      {
        id: 'fl1_price',
        type: 'text',
        x: 1.5,
        y: 7.8,
        fontSizeMm: 2.5,
        bold: true,
        value: '₹24,850'
      },
      // Right Wing (Flap 2: 54 - 80mm)
      {
        id: 'fl2_sku',
        type: 'text',
        x: 55,
        y: 1.2,
        fontSizeMm: 1.8,
        value: 'SKU: JW-9921'
      },
      {
        id: 'fl2_barcode',
        type: 'barcode',
        x: 54.5,
        y: 3.5,
        width: 23.5,
        height: 5.6,
        format: 'CODE128',
        moduleWidthDots: 2,
        value: '8901234567890',
        displayValue: false
      },
      {
        id: 'fl2_human',
        type: 'text',
        x: 55,
        y: 9.8,
        fontSizeMm: 1.8,
        bold: true,
        value: '8901234567890'
      }
    ]
  };
}
