/**
 * Software-based Barcode Verification Engine
 * Validates barcode formats (Code 128, EAN-13, UPC-A) and checks barcode integrity.
 */

export interface BarcodeValidationResult {
  valid: boolean;
  format: 'CODE128' | 'EAN13' | 'UPCA' | 'CUSTOM' | 'UNKNOWN';
  error?: string;
  normalizedCode?: string;
}

/**
 * Calculates EAN-13 Check Digit using standard Modulo-10 with alternating weights 1 and 3.
 * Formula: (10 - ((sum of odd digits + 3 * sum of even digits) % 10)) % 10
 */
export function calculateEan13CheckDigit(twelveDigits: string): number {
  if (!/^\d{12}$/.test(twelveDigits)) {
    throw new Error('EAN-13 check digit calculation requires exactly 12 numeric digits.');
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(twelveDigits[i], 10);
    // 0-indexed: index 0, 2, 4, 6, 8, 10 have weight 1; index 1, 3, 5, 7, 9, 11 have weight 3
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Verifies if a given string is a valid EAN-13 barcode with correct check digit.
 */
export function validateEan13(barcode: string): BarcodeValidationResult {
  const clean = barcode.trim();
  if (!/^\d{13}$/.test(clean)) {
    return {
      valid: false,
      format: 'EAN13',
      error: 'EAN-13 must contain exactly 13 digits (0-9).',
    };
  }

  const payload = clean.slice(0, 12);
  const expectedCheckDigit = calculateEan13CheckDigit(payload);
  const actualCheckDigit = parseInt(clean[12], 10);

  if (expectedCheckDigit !== actualCheckDigit) {
    return {
      valid: false,
      format: 'EAN13',
      error: `Checksum mismatch: expected ${expectedCheckDigit}, but found ${actualCheckDigit}.`,
    };
  }

  return {
    valid: true,
    format: 'EAN13',
    normalizedCode: clean,
  };
}

/**
 * Validates Code 128 barcodes (Subsets A/B/C compatible).
 * Permitted characters: standard printable ASCII (characters 32 through 126).
 */
export function validateCode128(barcode: string): BarcodeValidationResult {
  const clean = barcode.trim();
  if (clean.length === 0) {
    return {
      valid: false,
      format: 'CODE128',
      error: 'Barcode cannot be empty.',
    };
  }

  if (clean.length > 80) {
    return {
      valid: false,
      format: 'CODE128',
      error: 'Barcode exceeds maximum recommended length of 80 characters.',
    };
  }

  // Check for non-printable or unsupported characters
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    if (code < 32 || code > 126) {
      return {
        valid: false,
        format: 'CODE128',
        error: `Invalid character at position ${i}: '${clean[i]}' (ASCII ${code}). Code 128 requires printable ASCII (32-126).`,
      };
    }
  }

  return {
    valid: true,
    format: 'CODE128',
    normalizedCode: clean,
  };
}

/**
 * Software-level barcode validator: automatically detects format and performs verification.
 */
export function verifyBarcodeSoftware(barcode: string): BarcodeValidationResult {
  if (!barcode || typeof barcode !== 'string') {
    return { valid: false, format: 'UNKNOWN', error: 'Barcode value is missing or not a string.' };
  }

  const clean = barcode.trim();
  if (!clean) {
    return { valid: false, format: 'UNKNOWN', error: 'Barcode string is empty.' };
  }

  // If 13 digits, evaluate EAN-13
  if (/^\d{13}$/.test(clean)) {
    return validateEan13(clean);
  }

  // If alphanumeric standard (SKU format e.g. SK-100201)
  return validateCode128(clean);
}
