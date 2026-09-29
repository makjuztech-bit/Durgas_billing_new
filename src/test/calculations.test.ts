import { describe, it, expect } from 'vitest';

describe('Billing & Tax Math Calculations', () => {
    it('should correctly calculate subtotal for items', () => {
        const items = [
            { qty: 2, price: 4500 },
            { qty: 1, price: 1200 },
            { qty: 3, price: 800 }
        ];

        const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
        expect(subtotal).toBe(12600);
    });

    it('should calculate 5% GST on apparel accurately', () => {
        const subtotal = 10000;
        const discount = 500;
        const taxableAmount = subtotal - discount;
        const taxRate = 5;
        const taxAmount = (taxableAmount * taxRate) / 100;

        expect(taxableAmount).toBe(9500);
        expect(taxAmount).toBe(475);
    });

    it('should calculate accurate round-off and grand total', () => {
        const subtotal = 2499.75;
        const rounded = Math.round(subtotal);
        const roundOff = Number((rounded - subtotal).toFixed(2));

        expect(rounded).toBe(2500);
        expect(roundOff).toBe(0.25);
    });

    it('should calculate remaining stock after sale', () => {
        const currentStock = 15;
        const soldQty = 4;
        const remainingStock = Math.max(0, currentStock - soldQty);

        expect(remainingStock).toBe(11);
    });

    it('should protect against negative stock', () => {
        const currentStock = 2;
        const soldQty = 5;
        const remainingStock = Math.max(0, currentStock - soldQty);

        expect(remainingStock).toBe(0);
    });
});
