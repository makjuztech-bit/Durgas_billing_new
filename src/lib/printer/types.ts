/**
 * Label and Printer Architecture Types
 *
 * All geometry in LabelDefinition remains strictly in millimetres (mm).
 * Printer compilers convert mm to device dots (e.g. 203 DPI = ~8 dots/mm).
 */

export type ElementType = 'text' | 'barcode' | 'qr' | 'image' | 'shape';

export interface LabelElement {
  id: string;
  type: ElementType;
  x: number; // in mm
  y: number; // in mm
  width?: number; // in mm
  height?: number; // in mm
  value?: string; // String with optional template placeholders e.g. {{productName}}, {{barcode}}
  rotation?: 0 | 90 | 180 | 270;
  
  // Text specific
  fontSizeMm?: number; // Font height in mm
  fontFamily?: string;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  maxWidthMm?: number;
  maxHeightMm?: number;
  textBlock?: boolean;

  // Barcode specific
  format?: 'CODE128' | 'EAN13' | 'CODE39' | 'QR';
  moduleWidthDots?: number; // Narrow bar width in dots (>= 2 for 203 DPI thermal)
  displayValue?: boolean;
  quietZoneMm?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };

  // Image specific
  dataUrl?: string; // Base64 data URL
  
  // Shape specific
  shape?: 'rect' | 'line';
  lineWidthMm?: number;
}

export interface LabelDefinition {
  id?: string;
  name: string;
  width: number; // in mm (e.g. 50 or 80)
  height: number; // in mm (e.g. 35 or 12)
  dpi?: number; // Default: 203 (TVS LP 46 Neo / SNBC)
  elements: LabelElement[];
  copies?: number;
  gapMm?: number;
  orientation?: 'landscape' | 'portrait';
  printRotation?: 0 | 90 | 180 | 270;
  metadata?: Record<string, any>;
}

export interface PrinterStatus {
  connected: boolean;
  printerName: string;
  statusMessage?: string;
  isOnline: boolean;
  hasPaper?: boolean;
}

export interface LabelPrinter {
  name: string;
  print(label: LabelDefinition, data?: Record<string, any>): Promise<void>;
  printRawZpl?(templateZpl: string, data?: Record<string, any>): Promise<void>;
  printItem?(item: { name: string; price: number | string; barcode: string; [key: string]: any }, options?: { copies?: number; template?: LabelDefinition }): Promise<void>;
  getStatus(): Promise<PrinterStatus>;
  cancel(): Promise<void>;
}
