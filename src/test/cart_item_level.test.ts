import { describe, it, expect } from 'vitest';
import { BillReceiptItem } from '@/components/billing/BillReceipt';
import { computeBillCalculations } from '@/lib/billingCalculations';

describe('Item-Level Discount and Tax Billing Calculation Suite', () => {
  it('correctly calculates independent discount and GST tax per item', () => {
    const sampleItems: BillReceiptItem[] = [
      {
        id: 'item-1',
        name: 'Kanchipuram Pure Silk Saree',
        qty: 1,
        sellingPrice: 10000,
        discountPercent: 10, // 10% disc -> ₹1,000 off -> taxable ₹9,000
        taxPercent: 5,       // 5% GST on ₹9,000 -> ₹450 tax -> net ₹9,450
      },
      {
        id: 'item-2',
        name: 'Cotton Dhoti Set',
        qty: 2,
        sellingPrice: 500,  // Base ₹1,000
        discountPercent: 0,  // 0% disc
        taxPercent: 5,       // 5% GST on ₹1,000 -> ₹50 tax -> net ₹1,050
      },
    ];

    const result = computeBillCalculations(sampleItems);

    expect(result.subTotal).toBe(11000);
    expect(result.totalDiscountAmount).toBe(1000);
    expect(result.totalTaxAmount).toBe(500); // 450 + 50
    expect(result.grandTotal).toBe(10500);   // (11000 - 1000) + 500 = 10500
    expect(result.roundOff).toBe(0);
  });

  it('handles mixed tax slabs (0% exempt, 5% textile, 12% readymade)', () => {
    const mixedItems: BillReceiptItem[] = [
      {
        id: 'i1',
        name: 'Handloom Cotton Towel (Exempt)',
        qty: 1,
        sellingPrice: 200,
        discountPercent: 0,
        taxPercent: 0, // 0% GST
      },
      {
        id: 'i2',
        name: 'Silk Saree (5% GST)',
        qty: 1,
        sellingPrice: 4000,
        discountPercent: 5, // ₹200 off -> ₹3800 taxable
        taxPercent: 5,      // 5% of 3800 = ₹190
      },
      {
        id: 'i3',
        name: 'Embroidered Sherwani (12% GST)',
        qty: 1,
        sellingPrice: 5000,
        discountPercent: 0,
        taxPercent: 12,     // 12% of 5000 = ₹600
      },
    ];

    const result = computeBillCalculations(mixedItems);

    expect(result.subTotal).toBe(9200);
    expect(result.totalDiscountAmount).toBe(200);
    expect(result.totalTaxAmount).toBe(790); // 0 + 190 + 600
    expect(result.grandTotal).toBe(9790);
  });

  it('handles fractional paise with exact roundoff calculation', () => {
    const items: BillReceiptItem[] = [
      {
        id: 'item-fractional',
        name: 'Designer Blouse Piece',
        qty: 3,
        sellingPrice: 333, // 3 * 333 = 999
        discountPercent: 7.5, // 7.5% of 999 = 74.925
        taxPercent: 5,        // taxable = 924.075; 5% tax = 46.20375
      },
    ];

    const result = computeBillCalculations(items);

    // Exact net = 924.075 + 46.20375 = 970.27875 -> Math.round = 970
    expect(result.grandTotal).toBe(970);
    // Roundoff is ~ -0.28
    expect(Math.abs(result.roundOff)).toBeLessThan(1.0);
    expect(result.grandTotal - (result.subTotal - result.totalDiscountAmount + result.totalTaxAmount)).toBeCloseTo(result.roundOff, 2);
  });

  it('validates active draft serialization & restoration', () => {
    const draft = {
      customerName: 'Kavitha Devi',
      customerMobile: '9840123456',
      customerPlace: 'Kanchipuram',
      paymentMethod: 'UPI / GPay',
      items: [
        {
          id: 'draft-item-1',
          name: 'Arani Silk Saree',
          qty: 1,
          sellingPrice: 3500,
          discountPercent: 10,
          taxPercent: 5,
        },
      ],
      paperType: 'thermal' as const,
    };

    // Serialize
    const serialized = JSON.stringify(draft);
    expect(typeof serialized).toBe('string');

    // Deserialize
    const parsed = JSON.parse(serialized);
    expect(parsed.customerName).toBe('Kavitha Devi');
    expect(parsed.items.length).toBe(1);
    expect(parsed.items[0].discountPercent).toBe(10);
    expect(parsed.paperType).toBe('thermal');
  });
});
