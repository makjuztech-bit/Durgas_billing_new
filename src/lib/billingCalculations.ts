import { BillReceiptItem } from '@/components/billing/BillReceipt';

export interface BillingCalculationsResult {
  items: BillReceiptItem[];
  subTotal: number;
  totalDiscountAmount: number;
  totalTaxAmount: number;
  roundOff: number;
  grandTotal: number;
}

export function computeBillCalculations(items: BillReceiptItem[]): BillingCalculationsResult {
  let subTotal = 0;
  let totalDiscountAmount = 0;
  let totalTaxAmount = 0;

  const calculatedItems = items.map((item) => {
    const base = item.qty * item.sellingPrice;
    const disc = base * ((item.discountPercent || 0) / 100);
    const taxable = base - disc;
    const tax = taxable * ((item.taxPercent || 0) / 100);
    const net = taxable + tax;

    subTotal += base;
    totalDiscountAmount += disc;
    totalTaxAmount += tax;

    return {
      ...item,
      discountAmount: Number(disc.toFixed(2)),
      taxAmount: Number(tax.toFixed(2)),
      total: Number(net.toFixed(2)),
    };
  });

  const exactTotal = subTotal - totalDiscountAmount + totalTaxAmount;
  const grandTotal = Math.round(exactTotal);
  const roundOff = Number((grandTotal - exactTotal).toFixed(2));

  return {
    items: calculatedItems,
    subTotal: Number(subTotal.toFixed(2)),
    totalDiscountAmount: Number(totalDiscountAmount.toFixed(2)),
    totalTaxAmount: Number(totalTaxAmount.toFixed(2)),
    roundOff,
    grandTotal,
  };
}
