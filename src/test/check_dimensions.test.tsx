import { describe, it, expect } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BillReceipt } from '../components/billing/BillReceipt';
import { BillingPreviewCard } from '../components/billing/BillingPreviewCard';

function render(ui: React.ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return { container, unmount: () => root.unmount() };
}

describe('A4 Bill Dimensions & Full Length Calculations', () => {
  it('BillReceipt renders with exact A4 geometry 794px by 1123px directly on the invoice element', () => {
    const { container } = render(
      <BillReceipt
        paperType="a4"
        billNo="INV-2026-9999"
        items={[
          { name: 'Kanchipuram Silk Saree', qty: 1, sellingPrice: 6500, discountPercent: 10, taxPercent: 5 },
        ]}
        subTotal={6500}
        grandTotal={6142.5}
      />
    );

    const invoiceEl = container.querySelector('.print-a4-invoice') as HTMLElement;
    expect(invoiceEl).not.toBeNull();
    // Direct element width & min-height matching physical A4 at 96 DPI
    expect(invoiceEl.style.width).toBe('794px');
    expect(invoiceEl.style.minHeight).toBe('1123px');

    // Bottom section must exist with Authorized Signatory
    expect(container.textContent).toContain('Authorized Signatory');
    expect(container.textContent).toContain('Store Terms & Exchange Policy');
    expect(container.textContent).toContain('NET GRAND TOTAL');
  });

  it('BillingPreviewCard provides Full Page, Fit Width and 100% zoom controls for A4 bills', () => {
    const { container } = render(
      <BillingPreviewCard
        paperType="a4"
        items={[
          { name: 'Kanchipuram Silk Saree', qty: 1, sellingPrice: 6500, discountPercent: 10, discountAmount: 650, taxPercent: 5, taxAmount: 292.5, total: 6142.5 },
        ]}
        customerName="Sita Raman"
        customerMobile="9443212345"
        customerPlace="Kanchipuram"
        subTotal={6500}
        totalDiscountAmount={650}
        totalTaxAmount={292.5}
        roundOff={0}
        grandTotal={6142.5}
        paymentMethod="Cash"
        onPrint={() => {}}
      />
    );

    // Zoom buttons present
    const buttons: HTMLButtonElement[] = Array.from(container.querySelectorAll('button'));
    expect(buttons.some(b => b.textContent?.includes('Full Page'))).toBe(true);
    expect(buttons.some(b => b.textContent?.includes('Fit Width'))).toBe(true);
    expect(buttons.some(b => b.textContent?.includes('100%'))).toBe(true);

    // Verify the scaled layout container exists and inner invoice is positioned exactly at top: 0, left: 0
    const invoiceWrapper = container.querySelector('[style*="position: absolute"]') as HTMLElement;
    expect(invoiceWrapper).not.toBeNull();
    expect(invoiceWrapper.style.width).toBe('794px');
    expect(invoiceWrapper.style.minHeight).toBe('1123px');
    expect(invoiceWrapper.style.transformOrigin).toBe('top left');

    // Click Expand to open fullscreen modal
    const expandBtn = buttons.find(b => b.textContent?.includes('Expand'));
    expect(expandBtn).toBeDefined();
    act(() => {
      expandBtn?.click();
    });
    expect(document.body.textContent).toContain('Standard A4 Tax Invoice Preview');
  });
});
