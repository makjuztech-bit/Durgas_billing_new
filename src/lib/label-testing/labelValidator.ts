/**
 * Automated Label Geometry & Compliance Validator
 * Verifies boundaries, quiet zones, minimum bar dimensions, and print-head safety before printing.
 */

import type { LabelDefinition, LabelElement, TextElement, BarcodeElement, ShapeElement, ImageElement } from './labelModel.ts';

export interface ValidationCheck {
  id: string;
  category: 'boundary' | 'quiet-zone' | 'min-size' | 'collision' | 'media-margin';
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  elementId?: string;
  dotsExceeded?: number;
}

export interface ValidationReport {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  checks: ValidationCheck[];
  summary: string;
}

/**
 * Calculates element bounding box in printer dots
 */
export function getElementBoundingBox(el: LabelElement, label: LabelDefinition): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  let minX = el.x;
  let minY = el.y;
  let width = el.width || 40;
  let height = el.height || 20;

  if (el.type === 'text') {
    const t = el as TextElement;
    height = t.fontSizeDots;
    minY = t.y - t.fontSizeDots / 2;
    width = t.maxWidth || (t.text.length * (t.fontSizeDots * 0.6));

    if (t.align === 'center') {
      minX = t.x - width / 2;
    } else if (t.align === 'right') {
      minX = t.x - width;
    }
  } else if (el.type === 'barcode') {
    const b = el as BarcodeElement;
    minX = b.x;
    minY = b.y;
    width = b.width || 200;
    height = b.height || (b.barHeightDots + b.quietZoneDots.top + b.quietZoneDots.bottom);
  } else if (el.type === 'shape') {
    const s = el as ShapeElement;
    minX = s.x;
    minY = s.y;
    width = s.width || (label.dimensions.widthDots - s.x * 2);
    height = s.height || s.thickness || 1;
  }

  return {
    minX: Math.round(minX),
    minY: Math.round(minY),
    maxX: Math.round(minX + width),
    maxY: Math.round(minY + height),
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Validates a LabelDefinition against physical printer dots and thermal printing standards
 */
export function validateLabel(label: LabelDefinition): ValidationReport {
  const { widthDots, heightDots } = label.dimensions;
  const checks: ValidationCheck[] = [];

  // Check 1: Canvas dimensions are valid positive numbers
  if (widthDots <= 0 || heightDots <= 0) {
    checks.push({
      id: 'canvas-validity',
      category: 'boundary',
      name: 'Canvas Dimension Check',
      status: 'fail',
      message: `Invalid canvas dot dimensions: ${widthDots}x${heightDots}`,
    });
  } else {
    checks.push({
      id: 'canvas-validity',
      category: 'boundary',
      name: 'Canvas Dimension Check',
      status: 'pass',
      message: `Canvas initialized to ${widthDots} x ${heightDots} dots (${label.dimensions.widthMm} x ${label.dimensions.heightMm} mm @ ${label.dimensions.dpi} DPI)`,
    });
  }

  // Check 2: Element Boundary & Clipping Checks
  let totalBoundaryErrors = 0;
  for (const el of label.elements) {
    const box = getElementBoundingBox(el, label);

    // Left boundary
    if (box.minX < 0) {
      const exceeded = Math.abs(box.minX);
      totalBoundaryErrors++;
      checks.push({
        id: `boundary-left-${el.id}`,
        category: 'boundary',
        name: `Left Boundary (${el.id})`,
        status: 'fail',
        elementId: el.id,
        dotsExceeded: exceeded,
        message: `Element "${el.id}" exceeds left boundary by ${exceeded} dots (x = ${box.minX})`,
      });
    }

    // Right boundary
    if (box.maxX > widthDots) {
      const exceeded = box.maxX - widthDots;
      totalBoundaryErrors++;
      checks.push({
        id: `boundary-right-${el.id}`,
        category: 'boundary',
        name: `Right Boundary (${el.id})`,
        status: 'fail',
        elementId: el.id,
        dotsExceeded: exceeded,
        message: `Element "${el.id}" exceeds right boundary by ${exceeded} dots (right edge = ${box.maxX}, canvas width = ${widthDots})`,
      });
    }

    // Top boundary
    if (box.minY < 0) {
      const exceeded = Math.abs(box.minY);
      totalBoundaryErrors++;
      checks.push({
        id: `boundary-top-${el.id}`,
        category: 'boundary',
        name: `Top Boundary (${el.id})`,
        status: 'fail',
        elementId: el.id,
        dotsExceeded: exceeded,
        message: `Element "${el.id}" exceeds top boundary by ${exceeded} dots (y = ${box.minY})`,
      });
    }

    // Bottom boundary
    if (box.maxY > heightDots) {
      const exceeded = box.maxY - heightDots;
      totalBoundaryErrors++;
      checks.push({
        id: `boundary-bottom-${el.id}`,
        category: 'boundary',
        name: `Bottom Boundary (${el.id})`,
        status: 'fail',
        elementId: el.id,
        dotsExceeded: exceeded,
        message: `Element "${el.id}" exceeds bottom boundary by ${exceeded} dots (bottom edge = ${box.maxY}, canvas height = ${heightDots})`,
      });
    }
  }

  if (totalBoundaryErrors === 0) {
    checks.push({
      id: 'all-boundaries-containment',
      category: 'boundary',
      name: 'All Elements Inside Canvas',
      status: 'pass',
      message: `All ${label.elements.length} elements are fully contained within the ${widthDots}x${heightDots} canvas.`,
    });
  }

  // Check 3: Barcode-Specific Standards Checks
  const barcodes = label.elements.filter((e) => e.type === 'barcode') as BarcodeElement[];
  if (barcodes.length === 0) {
    checks.push({
      id: 'barcode-presence',
      category: 'min-size',
      name: 'Barcode Presence',
      status: 'warn',
      message: 'No barcode element found in label definition.',
    });
  } else {
    for (const b of barcodes) {
      // 3a. Minimum Bar Width (Module Width)
      if (b.moduleWidthDots < 1) {
        checks.push({
          id: `barcode-module-width-${b.id}`,
          category: 'min-size',
          name: `Barcode Bar Width (${b.id})`,
          status: 'fail',
          elementId: b.id,
          message: `Module width ${b.moduleWidthDots} is invalid. Must be >= 1 dot.`,
        });
      } else if (b.moduleWidthDots < 2 && label.dimensions.dpi === 203) {
        checks.push({
          id: `barcode-module-width-${b.id}`,
          category: 'min-size',
          name: `Barcode Bar Width (${b.id})`,
          status: 'warn',
          elementId: b.id,
          message: `Module width is ${b.moduleWidthDots} dots (~0.125mm). Optical scan rate improves with >= 2 dots (~0.25mm) on 203 DPI thermal printers.`,
        });
      } else {
        checks.push({
          id: `barcode-module-width-${b.id}`,
          category: 'min-size',
          name: `Barcode Bar Width (${b.id})`,
          status: 'pass',
          elementId: b.id,
          message: `Module width is ${b.moduleWidthDots} dots (~${((b.moduleWidthDots * 25.4) / 203).toFixed(2)} mm) - excellent contrast and legibility.`,
        });
      }

      // 3b. Quiet Zone Requirement
      const minRequiredQuietDots = Math.max(10, Math.round(b.moduleWidthDots * 10));
      if (b.quietZoneDots.left < minRequiredQuietDots || b.quietZoneDots.right < minRequiredQuietDots) {
        checks.push({
          id: `barcode-quiet-zone-${b.id}`,
          category: 'quiet-zone',
          name: `Barcode Quiet Zone (${b.id})`,
          status: 'fail',
          elementId: b.id,
          message: `Quiet zone insufficient: Left ${b.quietZoneDots.left} dots, Right ${b.quietZoneDots.right} dots. Required minimum: ${minRequiredQuietDots} dots (10x module width).`,
        });
      } else {
        checks.push({
          id: `barcode-quiet-zone-${b.id}`,
          category: 'quiet-zone',
          name: `Barcode Quiet Zone (${b.id})`,
          status: 'pass',
          elementId: b.id,
          message: `Quiet zones sufficient: Left ${b.quietZoneDots.left} dots, Right ${b.quietZoneDots.right} dots (>= ${minRequiredQuietDots} dots).`,
        });
      }

      // 3c. Minimum Bar Height Check
      if (b.barHeightDots < 20) {
        checks.push({
          id: `barcode-height-${b.id}`,
          category: 'min-size',
          name: `Barcode Height (${b.id})`,
          status: 'warn',
          elementId: b.id,
          message: `Barcode height is ${b.barHeightDots} dots (~${((b.barHeightDots * 25.4) / 203).toFixed(1)} mm). Minimum recommended height is 25 dots for reliable omnidirectional scanning.`,
        });
      } else {
        checks.push({
          id: `barcode-height-${b.id}`,
          category: 'min-size',
          name: `Barcode Height (${b.id})`,
          status: 'pass',
          elementId: b.id,
          message: `Barcode height is ${b.barHeightDots} dots (~${((b.barHeightDots * 25.4) / 203).toFixed(1)} mm).`,
        });
      }

      // 3d. Non-empty Data
      if (!b.data || b.data.trim().length === 0) {
        checks.push({
          id: `barcode-data-${b.id}`,
          category: 'min-size',
          name: `Barcode Data (${b.id})`,
          status: 'fail',
          elementId: b.id,
          message: 'Barcode data is empty.',
        });
      }
    }
  }

  // Check 4: Media Edge Safety Margins (thermal heads have ~1mm non-printable margin)
  const safeMarginDots = 6; // ~0.75mm
  for (const el of label.elements) {
    if (el.type === 'shape' && (el as ShapeElement).shape === 'line') continue;
    const box = getElementBoundingBox(el, label);
    if (
      box.minX < safeMarginDots ||
      box.minY < safeMarginDots ||
      box.maxX > widthDots - safeMarginDots ||
      box.maxY > heightDots - safeMarginDots
    ) {
      checks.push({
        id: `media-margin-${el.id}`,
        category: 'media-margin',
        name: `Edge Bleed Margin (${el.id})`,
        status: 'warn',
        elementId: el.id,
        message: `Element "${el.id}" is closer than ${safeMarginDots} dots to the label edge. Minor printer feed shift may clip content.`,
      });
    }
  }

  // Check 5: Dumbbell Middle Gap (Zero Print Zone) validation if applicable
  if (label.dimensions.widthMm >= 75 && label.dimensions.heightMm <= 15) {
    // 80x12 Dumbbell: Middle 34% (approx dots 215..425) should not have text or barcodes
    const middleZoneStart = Math.round(widthDots * 0.33);
    const middleZoneEnd = Math.round(widthDots * 0.67);

    for (const el of label.elements) {
      if (el.type === 'text' || el.type === 'barcode') {
        const box = getElementBoundingBox(el, label);
        if (box.minX < middleZoneEnd && box.maxX > middleZoneStart) {
          checks.push({
            id: `dumbbell-middle-${el.id}`,
            category: 'collision',
            name: `Dumbbell Fold Zone (${el.id})`,
            status: 'fail',
            elementId: el.id,
            message: `Element "${el.id}" encroaches into dumbbell center fold bridge (dots ${middleZoneStart}..${middleZoneEnd}). This is a zero-print fold area.`,
          });
        }
      }
    }
  }

  const errors = checks.filter((c) => c.status === 'fail');
  const warnings = checks.filter((c) => c.status === 'warn');
  const valid = errors.length === 0;

  const summary = valid
    ? `PASSED: Label verified. 0 errors, ${warnings.length} warning(s). Safe to send to printer.`
    : `FAILED: Label validation rejected. Found ${errors.length} error(s) that will cause label waste or scan failures.`;

  return {
    valid,
    errorCount: errors.length,
    warningCount: warnings.length,
    checks,
    summary,
  };
}
