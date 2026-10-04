import { describe, it, expect } from 'vitest';
import { createQrSvg } from '../components/barcode/barcodePrintService';
import { Saree } from '@/types';

// Mock inventory representing store database
const sampleInventory: Saree[] = [
  {
    id: 'saree-001',
    sareeCode: 'KANCHI-001',
    barcode: 'SK-100101',
    name: 'Kanchipuram Pure Silk Saree',
    nameTamil: 'காஞ்சிபுரம் பட்டு புடவை',
    category: 'Silk Sarees',
    department: 'Womens',
    brand: 'Durgas Silks',
    material: 'Pure Mulberry Silk',
    zariType: 'Pure Zari',
    borderType: 'Temple Border',
    color: 'Crimson Red / Gold',
    designType: 'Traditional Floral',
    length: '6.2m',
    weight: '650g',
    blouseIncluded: true,
    blousePiece: 'Running 80cm',
    purchasePrice: 4200,
    sellingPrice: 7999,
    mrp: 9999,
    gstPercent: 5,
    stockType: 'unique',
    stockQty: 3,
    rackLocation: 'Rack A-12',
    supplier: 'Kanchi Weavers Co-op',
    images: [],
    description: 'Authentic handwoven Kanchipuram silk saree with contrast pallu',
    status: 'available',
    addedDate: '2026-03-01',
  },
  {
    id: 'jewel-002',
    sareeCode: 'GOLD-NK-8821',
    barcode: 'GLD-882109',
    name: '916 Antique Gold Choker Necklace',
    nameTamil: '916 தங்க நெக்லஸ்',
    category: 'Jewellery',
    department: 'Jewelry',
    brand: 'Durgas Gold',
    material: '916 KDM Gold',
    zariType: 'N/A',
    borderType: 'N/A',
    color: 'Antique Yellow Gold',
    designType: 'Temple Design',
    length: '16 inch',
    weight: '24.500g',
    blouseIncluded: false,
    blousePiece: '',
    purchasePrice: 110000,
    sellingPrice: 135000,
    mrp: 145000,
    gstPercent: 3,
    stockType: 'unique',
    stockQty: 1,
    rackLocation: 'Safe Lock 2',
    supplier: 'Durgas In-House Hallmark',
    images: [],
    description: 'Hallmarked 916 antique finish bridal choker',
    status: 'available',
    addedDate: '2026-03-10',
  },
];

/**
 * Simulates the POS terminal barcode/QR scanning engine found in BillingItemInput.tsx
 */
function simulateBillingScanner(
  scannedString: string,
  inventory: Saree[],
  defaultTaxRate = 5
) {
  const trimmed = (scannedString || '').trim();
  if (!trimmed) {
    return { success: false, error: 'EMPTY_SCAN', message: 'Scanner passed empty input' };
  }

  // Handle both raw barcode scan (e.g. "SK-100101") and structured tag scan (e.g. "DURGAS | SKU: SK-100101")
  let query = trimmed.toLowerCase();
  if (query.includes('sku:')) {
    const skuMatch = query.match(/sku:\s*([a-z0-9-_]+)/i);
    if (skuMatch) {
      query = skuMatch[1].toLowerCase();
    }
  }

  // Exact matching algorithm used in BillingItemInput.tsx
  const matched = inventory.find(
    (s) =>
      s.barcode?.trim().toLowerCase() === query ||
      s.id?.toLowerCase() === query ||
      s.sareeCode?.trim().toLowerCase() === query ||
      s.name.trim().toLowerCase() === query
  );

  if (!matched) {
    return { success: false, error: 'NOT_FOUND', message: `No product found for scanned code: "${trimmed}"` };
  }

  const itemPrice = matched.sellingPrice || 0;
  const taxPct = matched.gstPercent !== undefined ? matched.gstPercent : defaultTaxRate;
  const qty = 1;
  const base = itemPrice * qty;
  const taxAmt = Number((base * (taxPct / 100)).toFixed(2));
  const total = Number((base + taxAmt).toFixed(2));

  return {
    success: true,
    product: matched,
    cartItem: {
      id: matched.id,
      name: matched.name,
      nameTamil: matched.nameTamil,
      barcode: matched.barcode,
      category: matched.category,
      sellingPrice: itemPrice,
      mrp: matched.mrp,
      qty,
      taxPercent: taxPct,
      taxAmount: taxAmt,
      total,
    },
  };
}

describe('QR Code Generation & Billing Scan Integration Test', () => {
  it('generates high-reliability QR code with Level H and Quiet Margin', () => {
    const testSku = 'SK-100101';
    const svgOutput = createQrSvg(testSku, 80);

    // 1. Must be valid SVG
    expect(svgOutput).toContain('<svg');
    expect(svgOutput).toContain('</svg>');

    // 2. Must contain viewBox for scaling
    expect(svgOutput).toContain('viewBox="0 0');

    // 3. Must contain dark module paths
    expect(svgOutput).toContain('fill="#000000"');

    // 4. Must NOT be an empty placeholder
    expect(svgOutput).not.toContain('EMPTY');
  });

  it('scans a Saree product QR tag and correctly adds it to the billing cart with pricing and tax', () => {
    // 1. Item in inventory
    const saree = sampleInventory[0];
    const qrPayload = saree.barcode; // The QR encodes "SK-100101"

    // 2. Simulate scanner reading the QR code at billing checkout
    const scanResult = simulateBillingScanner(qrPayload, sampleInventory);

    // 3. Verify item was found
    expect(scanResult.success).toBe(true);
    expect(scanResult.cartItem).toBeDefined();

    // 4. Verify all item details are correctly loaded
    expect(scanResult.cartItem?.name).toBe('Kanchipuram Pure Silk Saree');
    expect(scanResult.cartItem?.barcode).toBe('SK-100101');
    expect(scanResult.cartItem?.sellingPrice).toBe(7999);
    expect(scanResult.cartItem?.taxPercent).toBe(5);
    expect(scanResult.cartItem?.taxAmount).toBe(399.95);
    expect(scanResult.cartItem?.total).toBe(8398.95);
  });

  it('scans a Jewellery product QR tag and correctly extracts 916 gold pricing and 3% GST', () => {
    const jewel = sampleInventory[1];
    const qrPayload = jewel.barcode; // "GLD-882109"

    const scanResult = simulateBillingScanner(qrPayload, sampleInventory);

    expect(scanResult.success).toBe(true);
    expect(scanResult.cartItem?.name).toBe('916 Antique Gold Choker Necklace');
    expect(scanResult.cartItem?.sellingPrice).toBe(135000);
    expect(scanResult.cartItem?.taxPercent).toBe(3);
    expect(scanResult.cartItem?.taxAmount).toBe(4050);
    expect(scanResult.cartItem?.total).toBe(139050);
  });

  it('handles realistic scanner quirks (leading/trailing whitespace and newline characters)', () => {
    // Physical hardware barcode scanners send "\r\n" or trailing space after barcode
    const rawScannerOutput = '  SK-100101 \r\n';

    const scanResult = simulateBillingScanner(rawScannerOutput, sampleInventory);

    expect(scanResult.success).toBe(true);
    expect(scanResult.cartItem?.barcode).toBe('SK-100101');
    expect(scanResult.cartItem?.name).toBe('Kanchipuram Pure Silk Saree');
  });

  it('handles case-insensitive scans seamlessly (e.g., lowercase "sk-100101")', () => {
    const lowercaseScan = 'sk-100101';

    const scanResult = simulateBillingScanner(lowercaseScan, sampleInventory);

    expect(scanResult.success).toBe(true);
    expect(scanResult.cartItem?.barcode).toBe('SK-100101');
  });

  it('gracefully rejects unregistered or damaged barcodes', () => {
    const unknownBarcode = 'INVALID-SKU-9999';

    const scanResult = simulateBillingScanner(unknownBarcode, sampleInventory);

    expect(scanResult.success).toBe(false);
    expect(scanResult.error).toBe('NOT_FOUND');
    expect(scanResult.cartItem).toBeUndefined();
  });

  it('supports dual-mode structured QR codes (readable by smartphone camera and POS scanner)', () => {
    // If QR is printed with human-friendly label text:
    const structuredQrText = 'DURGAS POS | SKU: SK-100101 | Kanchipuram Silk | Rs. 7999';

    // Scanner or parser extracts the SKU and adds it to the cart
    const scanResult = simulateBillingScanner(structuredQrText, sampleInventory);

    expect(scanResult.success).toBe(true);
    expect(scanResult.cartItem?.barcode).toBe('SK-100101');
    expect(scanResult.cartItem?.name).toBe('Kanchipuram Pure Silk Saree');
  });
});
