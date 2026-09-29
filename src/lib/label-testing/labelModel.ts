/**
 * Canonical Thermal Label Definition Model
 * Defines physical dimensions, 203 DPI printer dot coordinate system, and elements.
 */

export interface LabelDimensions {
  widthMm: number;
  heightMm: number;
  dpi: number; // Default: 203 (8 dots/mm for TVS LP 46 Neo / SNBC)
  widthDots: number;
  heightDots: number;
}

export type ElementType = 'text' | 'barcode' | 'image' | 'shape';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number; // in printer dots
  y: number; // in printer dots
  width?: number; // in printer dots
  height?: number; // in printer dots
  rotation?: 0 | 90 | 180 | 270;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: 'Inter' | 'Cinzel' | 'monospace' | 'printer-standard';
  fontSizeDots: number;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  maxWidth?: number; // dots
  lineHeightDots?: number;
}

export interface BarcodeElement extends BaseElement {
  type: 'barcode';
  format: 'CODE128' | 'EAN13' | 'QR' | 'CODE39';
  data: string;
  moduleWidthDots: number; // Narrow bar width in dots (>= 2 for 203 DPI)
  barHeightDots: number; // Bar height in dots
  displayValue?: boolean;
  quietZoneDots: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
}

export interface ImageElement extends BaseElement {
  type: 'image';
  dataUrl: string; // Base64 PNG / JPEG or SVG data
  fit?: 'contain' | 'cover' | 'fill';
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: 'rect' | 'line';
  thickness?: number; // dots
  fill?: boolean;
}

export type LabelElement = TextElement | BarcodeElement | ImageElement | ShapeElement;

export interface LabelDefinition {
  id: string;
  name: string;
  dimensions: LabelDimensions;
  elements: LabelElement[];
  printSettings: {
    speedIps?: number; // Inches per second (e.g. 3, 4, 5)
    darkness?: number; // 0 to 30 (default: 15)
    copies?: number;
    mediaType?: 'gap' | 'continuous' | 'black-mark';
    emulation?: 'BPLZ' | 'BPLE'; // TVS LP 46 Neo supports both ZPL & EPL
  };
}

/**
 * Calculates dots from physical mm for a given DPI
 */
export function mmToDots(mm: number, dpi: number = 203): number {
  const dotsPerMm = Math.abs(dpi - 203) <= 1 ? 8 : dpi / 25.4;
  return Math.round(mm * dotsPerMm);
}

/**
 * Calculates physical mm from printer dots
 */
export function dotsToMm(dots: number, dpi: number = 203): number {
  const dotsPerMm = Math.abs(dpi - 203) <= 1 ? 8 : dpi / 25.4;
  return Number((dots / dotsPerMm).toFixed(2));
}

/**
 * Builds LabelDimensions structure
 */
export function createDimensions(widthMm: number, heightMm: number, dpi: number = 203): LabelDimensions {
  return {
    widthMm,
    heightMm,
    dpi,
    widthDots: mmToDots(widthMm, dpi),
    heightDots: mmToDots(heightMm, dpi),
  };
}

/**
 * Factory for standard 50 x 35 mm thermal label (Canonical 400 x 280 dots @ 203 DPI)
 */
export function createStandard50x35Label(params: {
  storeName?: string;
  productName?: string;
  price?: number;
  barcodeData?: string;
  barcodeFormat?: 'CODE128' | 'EAN13' | 'QR';
  details?: string;
  logoBase64?: string;
}): LabelDefinition {
  const dims = createDimensions(50, 35, 203); // 400 x 280 dots
  const {
    storeName = 'DURGAS JEWELLERS',
    productName = 'GOLD ORNAMENT',
    price = 14999,
    barcodeData = '8901234567890',
    barcodeFormat = 'CODE128',
    details = 'W: 8.000g • 916 KDM',
    logoBase64,
  } = params;

  const elements: LabelElement[] = [];

  // Top Store Name or Logo
  if (logoBase64) {
    elements.push({
      id: 'logo',
      type: 'image',
      dataUrl: logoBase64,
      x: 170,
      y: 12,
      width: 60,
      height: 24,
      fit: 'contain',
    });
  }

  elements.push({
    id: 'store-name',
    type: 'text',
    text: storeName,
    fontFamily: 'Cinzel',
    fontSizeDots: 22,
    bold: true,
    align: 'center',
    x: 200,
    y: logoBase64 ? 42 : 24,
    maxWidth: 360,
  });

  // Details Row
  elements.push({
    id: 'details',
    type: 'text',
    text: details,
    fontFamily: 'Inter',
    fontSizeDots: 16,
    bold: false,
    align: 'center',
    x: 200,
    y: logoBase64 ? 64 : 48,
    maxWidth: 360,
  });

  // Divider Line
  elements.push({
    id: 'divider',
    type: 'shape',
    shape: 'line',
    x: 24,
    y: logoBase64 ? 76 : 60,
    width: 352,
    height: 2,
    thickness: 2,
  });

  // Product Name & Price Row
  elements.push({
    id: 'product-name',
    type: 'text',
    text: productName,
    fontFamily: 'Inter',
    fontSizeDots: 20,
    bold: true,
    align: 'left',
    x: 24,
    y: logoBase64 ? 104 : 88,
    maxWidth: 240,
  });

  elements.push({
    id: 'price',
    type: 'text',
    text: `₹${price.toLocaleString('en-IN')}`,
    fontFamily: 'Inter',
    fontSizeDots: 22,
    bold: true,
    align: 'right',
    x: 376,
    y: logoBase64 ? 104 : 88,
    maxWidth: 120,
  });

  // Barcode Element (centered in 400x280 canvas)
  if (barcodeFormat === 'QR') {
    elements.push({
      id: 'barcode',
      type: 'barcode',
      format: 'QR',
      data: barcodeData,
      x: 140,
      y: logoBase64 ? 122 : 110,
      width: 120,
      height: 120,
      moduleWidthDots: 4,
      barHeightDots: 120,
      displayValue: true,
      quietZoneDots: { left: 16, right: 16, top: 8, bottom: 8 },
    });
  } else {
    // 1D Barcode (Code128 or EAN13)
    elements.push({
      id: 'barcode',
      type: 'barcode',
      format: barcodeFormat,
      data: barcodeData,
      x: 40,
      y: logoBase64 ? 124 : 112,
      width: 320,
      height: 90,
      moduleWidthDots: 2, // 2 dots per module @ 203 DPI = ~0.25mm
      barHeightDots: 90,
      displayValue: false,
      quietZoneDots: { left: 24, right: 24, top: 8, bottom: 8 },
    });

    // Human Readable Barcode Number
    elements.push({
      id: 'barcode-text',
      type: 'text',
      text: barcodeData,
      fontFamily: 'monospace',
      fontSizeDots: 18,
      bold: true,
      align: 'center',
      x: 200,
      y: logoBase64 ? 232 : 220,
      maxWidth: 320,
    });
  }

  return {
    id: `label-50x35-${Date.now()}`,
    name: '50x35mm Standard Thermal Label (203 DPI)',
    dimensions: dims,
    elements,
    printSettings: {
      speedIps: 4,
      darkness: 15,
      copies: 1,
      mediaType: 'gap',
      emulation: 'BPLZ',
    },
  };
}

/**
 * Factory for TVS LP 46 Neo Dumbbell (80 x 12 mm = 640 x 96 dots @ 203 DPI)
 */
export function createDumbbell80x12Label(params: {
  storeName?: string;
  productName?: string;
  price?: number;
  barcodeData?: string;
  details?: string;
  logoBase64?: string;
  invertFlaps?: boolean;
}): LabelDefinition {
  const dims = createDimensions(80, 12, 203); // 640 x 96 dots
  const {
    storeName = 'DURGAS',
    productName = 'GOLD RING',
    price = 12500,
    barcodeData = '8901234567890',
    details = 'W: 4.500g 916',
    logoBase64,
    invertFlaps = false,
  } = params;

  // Left flap: dots 0..210 (33%), Middle tail: 211..429 (34%), Right flap: 430..640 (33%)
  const leftFlapCenter = 105;
  const rightFlapCenter = 535;

  const storeFlapX = invertFlaps ? rightFlapCenter : leftFlapCenter;
  const barcodeFlapX = invertFlaps ? leftFlapCenter : rightFlapCenter;
  const barcodeFlapLeft = invertFlaps ? 16 : 446;

  const elements: LabelElement[] = [];

  // Store Flap Elements
  if (logoBase64) {
    elements.push({
      id: 'store-logo',
      type: 'image',
      dataUrl: logoBase64,
      x: storeFlapX - 25,
      y: 8,
      width: 50,
      height: 20,
      fit: 'contain',
    });
  }

  elements.push({
    id: 'store-name',
    type: 'text',
    text: storeName,
    fontFamily: 'Cinzel',
    fontSizeDots: 18,
    bold: true,
    align: 'center',
    x: storeFlapX,
    y: logoBase64 ? 34 : 22,
    maxWidth: 190,
  });

  elements.push({
    id: 'store-details',
    type: 'text',
    text: details,
    fontFamily: 'Inter',
    fontSizeDots: 13,
    bold: true,
    align: 'center',
    x: storeFlapX,
    y: logoBase64 ? 54 : 44,
    maxWidth: 190,
  });

  // Barcode Flap Elements
  elements.push({
    id: 'product-name',
    type: 'text',
    text: productName,
    fontFamily: 'Inter',
    fontSizeDots: 13,
    bold: true,
    align: 'left',
    x: barcodeFlapLeft,
    y: 16,
    maxWidth: 110,
  });

  elements.push({
    id: 'price',
    type: 'text',
    text: `₹${price.toLocaleString('en-IN')}`,
    fontFamily: 'Inter',
    fontSizeDots: 15,
    bold: true,
    align: 'right',
    x: barcodeFlapLeft + 180,
    y: 16,
    maxWidth: 70,
  });

  elements.push({
    id: 'barcode',
    type: 'barcode',
    format: 'CODE128',
    data: barcodeData,
    x: barcodeFlapLeft + 12,
    y: 26,
    width: 156,
    height: 42,
    moduleWidthDots: 1.0,
    barHeightDots: 42,
    displayValue: false,
    quietZoneDots: { left: 12, right: 12, top: 2, bottom: 2 },
  });

  elements.push({
    id: 'barcode-text',
    type: 'text',
    text: barcodeData,
    fontFamily: 'monospace',
    fontSizeDots: 12,
    bold: true,
    align: 'center',
    x: barcodeFlapX,
    y: 80,
    maxWidth: 180,
  });

  return {
    id: `dumbbell-80x12-${Date.now()}`,
    name: 'TVS LP 46 Neo Dumbbell (80x12 mm • 203 DPI)',
    dimensions: dims,
    elements,
    printSettings: {
      speedIps: 3,
      darkness: 14,
      copies: 1,
      mediaType: 'gap',
      emulation: 'BPLZ',
    },
  };
}
