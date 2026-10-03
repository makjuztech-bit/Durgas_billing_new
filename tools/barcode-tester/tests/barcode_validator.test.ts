import { describe, it, expect } from 'vitest';
import {
  calculateEan13CheckDigit,
  validateEan13,
  validateCode128,
  verifyBarcodeSoftware,
} from '@/lib/barcodeValidator';

describe('Barcode Software Verification & Validator', () => {
  describe('EAN-13 Modulo-10 Checksum Algorithm', () => {
    it('calculates correct check digit for standard 12-digit payloads', () => {
      // Test vector 1: 890103038345 -> check digit 8 (8901030383458)
      expect(calculateEan13CheckDigit('890103038345')).toBe(8);

      // Test vector 2: 400638133393 -> check digit 1 (Stabilo Boss highlighter EAN)
      expect(calculateEan13CheckDigit('400638133393')).toBe(1);

      // Test vector 3: 978020137962 -> check digit 4
      expect(calculateEan13CheckDigit('978020137962')).toBe(4);
    });

    it('throws error when payload is not exactly 12 numeric digits', () => {
      expect(() => calculateEan13CheckDigit('12345')).toThrow();
      expect(() => calculateEan13CheckDigit('1234567890123')).toThrow();
      expect(() => calculateEan13CheckDigit('12345ABC8901')).toThrow();
    });

    it('validates a genuine 13-digit EAN-13 barcode', () => {
      const result = validateEan13('4006381333931');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('EAN13');
      expect(result.error).toBeUndefined();
    });

    it('detects and rejects corrupted EAN-13 check digit', () => {
      // 4006381333931 is valid, alter check digit to 9
      const result = validateEan13('4006381333939');
      expect(result.valid).toBe(false);
      expect(result.format).toBe('EAN13');
      expect(result.error).toContain('Checksum mismatch');
    });

    it('rejects non-numeric EAN barcodes', () => {
      const result = validateEan13('400638133393A');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must contain exactly 13 digits');
    });
  });

  describe('Code 128 Character & Format Verification', () => {
    it('validates standard Durgas SKU formats (SK-xxxxxx)', () => {
      const result = validateCode128('SK-100201');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('CODE128');
    });

    it('accepts alphanumeric characters and printable ASCII symbols', () => {
      const result = validateCode128('KAN-SILK-2026-A1');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('CODE128');
    });

    it('rejects empty strings', () => {
      const result = validateCode128('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('detects unprintable control characters and emojis', () => {
      // Contains null byte or non-ASCII
      const result = validateCode128('SK-100\x00-TEST');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid character');
    });
  });

  describe('Autonomous verifyBarcodeSoftware Dispatcher', () => {
    it('detects 13-digit string as EAN-13 and verifies checksum', () => {
      const validEan = verifyBarcodeSoftware('8901030383458');
      expect(validEan.valid).toBe(true);
      expect(validEan.format).toBe('EAN13');

      const corruptedEan = verifyBarcodeSoftware('8901030383450');
      expect(corruptedEan.valid).toBe(false);
      expect(corruptedEan.error).toBeDefined();
    });

    it('detects alphanumeric SKU string as Code 128', () => {
      const result = verifyBarcodeSoftware('SK-889922');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('CODE128');
    });

    it('handles invalid inputs gracefully', () => {
      expect(verifyBarcodeSoftware(null as any).valid).toBe(false);
      expect(verifyBarcodeSoftware('').valid).toBe(false);
    });
  });
});
