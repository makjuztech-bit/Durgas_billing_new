import { describe, it, expect } from 'vitest';
import { Saree } from '@/types';
import { BillReceiptItem } from '@/components/billing/BillReceipt';
import { computeBillCalculations } from '@/lib/billingCalculations';

describe('POS Barcode Scanner Direct Lookup & Cart Integration', () => {
  type TestProduct = Partial<Saree> & {
    id: string;
    name: string;
    barcode: string;
    sellingPrice: number;
    purchasePrice?: number;
    stockQty?: number;
  };

  const inventory: TestProduct[] = [
    {
      id: 'prod-1',
      name: 'Kanchipuram Pure Silk Saree',
      barcode: 'SK-877955', // Code 128 alphanumeric
      sellingPrice: 12500,
      stockQty: 10,
      purchasePrice: 8000,
      category: 'Silk Sarees',
      status: 'available',
      stockType: 'bulk'
    },
    {
      id: 'prod-2',
      name: 'Mysore Silk Saree',
      barcode: '8901030382718', // EAN-13 international standard barcode
      sellingPrice: 4500,
      stockQty: 25,
      purchasePrice: 3000,
      category: 'General',
      status: 'available',
      stockType: 'bulk'
    },
    {
      id: 'prod-3',
      name: 'Cotton Designer Saree',
      barcode: '012345678905', // UPC-A 12-digit format
      sellingPrice: 1800,
      stockQty: 50,
      purchasePrice: 1100,
      category: 'Cotton',
      status: 'available',
      stockType: 'bulk'
    },
    {
      id: 'prod-4',
      name: 'Special Handloom Silk',
      barcode: 'HL-SILK-001', // Code 39 format
      sellingPrice: 9200,
      stockQty: 5,
      purchasePrice: 6000,
      category: 'Handloom',
      status: 'available',
      stockType: 'unique'
    }
  ];

  // Helper matching the POS direct lookup logic
  function lookupProductByBarcode(scannedCode: string, sarees: TestProduct[]): TestProduct | undefined {
    const query = scannedCode.trim().toLowerCase();
    return sarees.find(
      s =>
        s.barcode?.trim().toLowerCase() === query ||
        s.id?.toLowerCase() === query ||
        s.name.trim().toLowerCase() === query
    );
  }

  // Helper matching the Cart direct add & repeat-scan increment logic
  function addItemToCart(
    cart: BillReceiptItem[],
    product: TestProduct,
    defaultTaxRate = 5
  ): BillReceiptItem[] {
    const existingIdx = cart.findIndex(
      i =>
        (product.barcode && i.barcode && i.barcode.toLowerCase() === product.barcode.toLowerCase()) ||
        (product.id && i.id === product.id)
    );

    if (existingIdx >= 0) {
      const updated = [...cart];
      const existing = updated[existingIdx];
      const newQty = existing.qty + 1;
      const base = newQty * existing.sellingPrice;
      const discAmt = base * ((existing.discountPercent || 0) / 100);
      const taxAmt = (base - discAmt) * ((existing.taxPercent || 0) / 100);

      updated[existingIdx] = {
        ...existing,
        qty: newQty,
        discountAmount: discAmt,
        taxAmount: taxAmt,
        total: base - discAmt + taxAmt,
      };
      return updated;
    }

    const base = 1 * product.sellingPrice;
    const taxAmt = base * (defaultTaxRate / 100);

    return [
      ...cart,
      {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        qty: 1,
        sellingPrice: product.sellingPrice,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: defaultTaxRate,
        taxAmount: taxAmt,
        total: base + taxAmt,
      }
    ];
  }

  it('1. Directly matches Code 128 alphanumeric barcode (SK-877955)', () => {
    const matched = lookupProductByBarcode('SK-877955', inventory);
    expect(matched).toBeDefined();
    expect(matched?.name).toBe('Kanchipuram Pure Silk Saree');
    expect(matched?.sellingPrice).toBe(12500);
  });

  it('2. Directly matches EAN-13 barcode (8901030382718)', () => {
    const matched = lookupProductByBarcode('8901030382718', inventory);
    expect(matched).toBeDefined();
    expect(matched?.name).toBe('Mysore Silk Saree');
    expect(matched?.sellingPrice).toBe(4500);
  });

  it('3. Directly matches UPC-A barcode (012345678905)', () => {
    const matched = lookupProductByBarcode('012345678905', inventory);
    expect(matched).toBeDefined();
    expect(matched?.name).toBe('Cotton Designer Saree');
  });

  it('4. Directly matches Code 39 barcode (HL-SILK-001)', () => {
    const matched = lookupProductByBarcode('HL-SILK-001', inventory);
    expect(matched).toBeDefined();
    expect(matched?.name).toBe('Special Handloom Silk');
  });

  it('5. Gracefully returns undefined for unknown barcode without throwing', () => {
    const matched = lookupProductByBarcode('NON-EXISTENT-99999', inventory);
    expect(matched).toBeUndefined();
  });

  it('6. Direct scan adds item to empty cart without manual price entry', () => {
    let cart: BillReceiptItem[] = [];
    const product = lookupProductByBarcode('SK-877955', inventory)!;

    cart = addItemToCart(cart, product, 5);
    expect(cart.length).toBe(1);
    expect(cart[0].qty).toBe(1);
    expect(cart[0].sellingPrice).toBe(12500);
    expect(cart[0].taxAmount).toBe(625); // 5% of 12500
    expect(cart[0].total).toBe(13125);
  });

  it('7. Scanning the same barcode multiple times increments quantity automatically', () => {
    let cart: BillReceiptItem[] = [];
    const product = lookupProductByBarcode('8901030382718', inventory)!;

    // First scan
    cart = addItemToCart(cart, product, 5);
    expect(cart.length).toBe(1);
    expect(cart[0].qty).toBe(1);

    // Second scan of same barcode
    cart = addItemToCart(cart, product, 5);
    expect(cart.length).toBe(1);
    expect(cart[0].qty).toBe(2);
    expect(cart[0].total).toBe(9450); // 2 * 4500 = 9000 + 5% GST = 9450

    // Third scan of same barcode
    cart = addItemToCart(cart, product, 5);
    expect(cart.length).toBe(1);
    expect(cart[0].qty).toBe(3);
    expect(cart[0].total).toBe(14175); // 3 * 4500 = 13500 + 5% GST = 14175
  });

  it('8. Multi-item cart calculation matches financial tally and GST breakdown', () => {
    let cart: BillReceiptItem[] = [];
    cart = addItemToCart(cart, lookupProductByBarcode('SK-877955', inventory)!, 5); // 12500
    cart = addItemToCart(cart, lookupProductByBarcode('012345678905', inventory)!, 5); // 1800
    cart = addItemToCart(cart, lookupProductByBarcode('012345678905', inventory)!, 5); // 1800 (repeat scan)

    expect(cart.length).toBe(2);
    expect(cart[0].qty).toBe(1);
    expect(cart[1].qty).toBe(2);

    const calc = computeBillCalculations(cart);
    expect(calc.subTotal).toBe(16100); // 12500 + (2 * 1800) = 16100
    expect(calc.totalTaxAmount).toBe(805); // 5% of 16100
    expect(calc.grandTotal).toBe(16905); // 16100 + 805
  });
});
