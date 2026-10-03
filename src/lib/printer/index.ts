import { Saree } from '@/types';
import { LabelDefinition } from './types';
import { TVSLP46Printer } from './TVSLP46Printer';
import { LabelPrinter } from './types';

export * from './types';
export * from './BPLZCompiler';
export * from './QZTransport';
export * from './TVSLP46Printer';

/**
 * Standard 50 × 35 mm Apparel / General Label Template
 */
export function create50x35LabelDefinition(): LabelDefinition {
  return {
    name: 'Standard 50x35mm',
    width: 50,
    height: 35,
    dpi: 203,
    elements: [
      {
        id: 'title',
        type: 'text',
        x: 4,
        y: 3,
        fontSizeMm: 3.2,
        bold: true,
        value: '{{storeName}}'
      },
      {
        id: 'name',
        type: 'text',
        x: 4,
        y: 8,
        fontSizeMm: 2.6,
        value: '{{productName}}'
      },
      {
        id: 'qr',
        type: 'qr',
        x: 18,
        y: 12,
        width: 14,
        height: 14,
        value: '{{barcode}}'
      },
      {
        id: 'code_text',
        type: 'text',
        x: 18,
        y: 27,
        fontSizeMm: 2.2,
        bold: true,
        value: '{{barcode}}'
      },
      {
        id: 'price',
        type: 'text',
        x: 4,
        y: 28,
        fontSizeMm: 3.4,
        bold: true,
        value: 'MRP: ₹{{mrp}}'
      },
      {
        id: 'code',
        type: 'text',
        x: 28,
        y: 28,
        fontSizeMm: 2.4,
        value: 'SKU: {{sku}}'
      }
    ]
  };
}

/**
 * TVS LP 46 Neo 80 × 12 mm Dumbbell Label Template
 * Left flap (26mm) + Tail/Loop (28mm) + Right flap (26mm) = 80mm
 */
export function create80x12DumbbellLabelDefinition(): LabelDefinition {
  return {
    name: 'TVS Dumbbell 80x12mm',
    width: 80,
    height: 12,
    dpi: 203,
    elements: [
      // Left Wing (Flap 1 - Jewelry details & price)
      {
        id: 'left_store',
        type: 'text',
        x: 1.5,
        y: 1.2,
        fontSizeMm: 2.2,
        bold: true,
        value: '{{storeName}}'
      },
      {
        id: 'left_item',
        type: 'text',
        x: 1.5,
        y: 4.5,
        fontSizeMm: 1.8,
        value: '{{productName}}'
      },
      {
        id: 'left_price',
        type: 'text',
        x: 1.5,
        y: 7.8,
        fontSizeMm: 2.4,
        bold: true,
        value: '₹{{price}}'
      },
      // Right Wing (Flap 2 - Barcode & SKU)
      {
        id: 'right_sku',
        type: 'text',
        x: 55,
        y: 1.2,
        fontSizeMm: 1.8,
        value: '{{sku}}'
      },
      {
        id: 'right_qr',
        type: 'qr',
        x: 54,
        y: 3.5,
        width: 6.0,
        height: 6.0,
        value: '{{barcode}}'
      },
      {
        id: 'right_human',
        type: 'text',
        x: 61.5,
        y: 6.2,
        fontSizeMm: 2.0,
        bold: true,
        value: '{{barcode}}'
      }
    ]
  };
}

/**
 * TVS LP 46 Neo 80 × 12 mm Dumbbell Label Template directly matching label.zpl:
 * - Left Wing: Brand ("Durgas")
 * - Right Wing: Item Name (text block) & Item Price (text block)
 * - Right Wing: Barcode (Code 128 auto)
 */
export function createDurgas80x12DumbbellLabelDefinition(): LabelDefinition {
  return {
    id: 'durgas_dumbbell_80x12',
    name: 'Durgas Dumbbell 80x12mm (label.zpl spec)',
    width: 80,
    height: 12,
    dpi: 203,
    elements: [
      {
        id: 'brand_durgas',
        type: 'text',
        x: 3.75, // 30 dots
        y: 4.25, // 34 dots
        fontSizeMm: 4.8, // 39 dots
        bold: true,
        value: 'Durgas'
      },
      {
        id: 'item_name',
        type: 'text',
        x: 52.5, // 420 dots
        y: 1.6,  // 13 dots
        fontSizeMm: 3.2,
        width: 13.0,
        height: 3.25,
        textBlock: true,
        value: '{{name}}'
      },
      {
        id: 'item_price',
        type: 'text',
        x: 66.5, // 532 dots
        y: 1.6,  // 13 dots
        fontSizeMm: 3.5,
        width: 12.25,
        height: 3.25,
        textBlock: true,
        bold: true,
        value: '₹{{price}}'
      },
      {
        id: 'item_qr',
        type: 'qr',
        x: 53.0, // 424 dots
        y: 5.0,  // 40 dots
        width: 6.0,
        height: 6.0,
        value: '{{barcode}}'
      },
      {
        id: 'item_code_text',
        type: 'text',
        x: 60.5, // 484 dots
        y: 6.5,  // 52 dots
        fontSizeMm: 2.2,
        bold: true,
        value: '{{barcode}}'
      }
    ]
  };
}

// Global default printer instance
const defaultPrinter = new TVSLP46Printer();

/**
 * High-level production function to print a label for a product.
 * Electron application calls this with dynamic product data (name, price, barcode).
 */
export async function printProductLabel(
  product: Saree,
  options: {
    printer?: LabelPrinter;
    storeName?: string;
    copies?: number;
    template?: LabelDefinition;
    useDurgasZplSpec?: boolean;
    rotate90?: boolean;
  } = {}
): Promise<void> {
  const printer = options.printer || defaultPrinter;
  const template = options.template || (options.useDurgasZplSpec ? createDurgas80x12DumbbellLabelDefinition() : create80x12DumbbellLabelDefinition());
  template.copies = options.copies || 1;
  
  if (options.rotate90) {
    template.printRotation = 90;
  }

  const rawPrice = product.sellingPrice || product.mrp || 0;
  const formattedPrice = typeof rawPrice === 'number' ? rawPrice.toLocaleString('en-IN') : String(rawPrice);

  const data = {
    storeName: options.storeName || 'DURGAS',
    name: product.name || product.category || 'JEWELRY',
    productName: product.name || product.category || 'JEWELRY',
    barcode: product.barcode || product.sareeCode || '',
    price: formattedPrice,
    mrp: product.mrp ? String(product.mrp) : formattedPrice,
    sellingPrice: formattedPrice,
    sku: product.sareeCode || product.barcode || '',
    weight: product.weight || ''
  };

  await printer.print(template, data);
}
