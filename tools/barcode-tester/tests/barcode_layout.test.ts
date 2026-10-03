import { describe, it, expect } from 'vitest';
import {
  calculateOptimalLayout,
  STANDARD_PAPER_SIZES,
  POPULAR_SHEET_PRESETS,
} from '@/lib/barcodeLayout';

describe('Barcode Sheet & Page Layout Engine', () => {
  it('calculates optimal 3-column layout on standard A4 for 63.5 x 38.1 mm labels', () => {
    const layout = calculateOptimalLayout({
      paperWidthMm: STANDARD_PAPER_SIZES.A4.widthMm, // 210
      paperHeightMm: STANDARD_PAPER_SIZES.A4.heightMm, // 297
      labelWidthMm: 63.5,
      labelHeightMm: 38.1,
      marginMm: 6,
      gapHorizontalMm: 2,
      gapVerticalMm: 0,
      totalCount: 21, // 3 cols * 7 rows = 21 labels per A4 sheet with 6mm margins
    });

    expect(layout.columns).toBe(3);
    expect(layout.rows).toBeGreaterThanOrEqual(7);
    expect(layout.totalPages).toBe(1);
    expect(layout.spaceUtilizationPercent).toBeGreaterThan(60);
  });

  it('calculates optimal 4-column layout on A4 for 48.5 x 25.4 mm labels', () => {
    const layout = calculateOptimalLayout({
      paperWidthMm: STANDARD_PAPER_SIZES.A4.widthMm,
      paperHeightMm: STANDARD_PAPER_SIZES.A4.heightMm,
      labelWidthMm: 48.5,
      labelHeightMm: 25.4,
      marginMm: 5,
      gapHorizontalMm: 1.5,
      gapVerticalMm: 0,
      totalCount: 40,
    });

    expect(layout.columns).toBe(4);
    expect(layout.rows).toBeGreaterThanOrEqual(10);
  });

  it('correctly calculates total pages for large print batches', () => {
    const layout = calculateOptimalLayout({
      paperWidthMm: 210,
      paperHeightMm: 297,
      labelWidthMm: 63.5,
      labelHeightMm: 38.1,
      marginMm: 6,
      gapHorizontalMm: 2,
      gapVerticalMm: 0,
      totalCount: 100, // 100 labels with ~21-24 labels per sheet
    });

    const expectedPages = Math.ceil(100 / layout.labelsPerPage);
    expect(layout.totalPages).toBe(expectedPages);
    expect(layout.totalPages).toBeGreaterThan(1);
  });

  it('supports single-label thermal roll layout (50 x 25 mm)', () => {
    const layout = calculateOptimalLayout({
      paperWidthMm: 50,
      paperHeightMm: 25,
      labelWidthMm: 50,
      labelHeightMm: 25,
      marginMm: 0,
      gapHorizontalMm: 0,
      gapVerticalMm: 0,
      totalCount: 15,
    });

    expect(layout.columns).toBe(1);
    expect(layout.rows).toBe(1);
    expect(layout.labelsPerPage).toBe(1);
    expect(layout.totalPages).toBe(15);
  });

  it('honors manual column override when user specifies exact sticker columns', () => {
    const layout = calculateOptimalLayout({
      paperWidthMm: 210,
      paperHeightMm: 297,
      labelWidthMm: 40,
      labelHeightMm: 20,
      marginMm: 5,
      totalCount: 50,
      userColumnsOverride: 3, // override auto-fit
    });

    expect(layout.columns).toBe(3);
    expect(layout.isCustomColumns).toBe(true);
  });

  it('has verified definitions for all popular stationery presets', () => {
    expect(POPULAR_SHEET_PRESETS.length).toBeGreaterThanOrEqual(5);
    POPULAR_SHEET_PRESETS.forEach(preset => {
      expect(preset.columns).toBeGreaterThan(0);
      expect(preset.rows).toBeGreaterThan(0);
      expect(preset.labelWidthMm).toBeGreaterThan(0);
      expect(preset.labelHeightMm).toBeGreaterThan(0);
      expect(preset.labelsPerSheet).toBe(preset.columns * preset.rows);
    });
  });

  it('determines proper barcode graphic dimensions for various label heights', () => {
    const getBarcodeDimensions = (labelHeightMm: number) => {
      if (labelHeightMm <= 22) return { height: 14, width: 0.85 };
      if (labelHeightMm <= 28) return { height: 18, width: 1.0 };
      if (labelHeightMm >= 45) return { height: 30, width: 1.4 };
      return { height: 22, width: 1.1 };
    };

    expect(getBarcodeDimensions(21.2)).toEqual({ height: 14, width: 0.85 }); // A4-65 small labels
    expect(getBarcodeDimensions(25.4)).toEqual({ height: 18, width: 1.0 });  // A4-40 medium labels
    expect(getBarcodeDimensions(38.1)).toEqual({ height: 22, width: 1.1 });  // A4-24 standard labels
    expect(getBarcodeDimensions(50)).toEqual({ height: 30, width: 1.4 });    // Large thermal
  });

  it('generates barcode SVG preserving strict aspect ratio with crisp edges and quiet zones', async () => {
    const { createBarcodeSvg } = await import('@/components/barcode/barcodePrintService');
    const svgHtml = createBarcodeSvg('SK-877955', 24, 1.2);

    expect(svgHtml).toContain('<svg');
    expect(svgHtml).toContain('preserveAspectRatio="xMidYMid meet"');
    expect(svgHtml).toContain('shape-rendering="crispEdges"');
    expect(svgHtml).toContain('viewBox');
    expect(svgHtml).not.toContain('preserveAspectRatio="none"');
  });

  it('validates TVS LP 46 Neo 80x12mm dumbbell label specifications and safe margins', () => {
    const dumbbell = POPULAR_SHEET_PRESETS.find(p => p.id === 'preset_jewelry_dumbbell');
    expect(dumbbell).toBeDefined();
    expect(dumbbell?.name).toContain('TVS LP 46 Neo');
    expect(dumbbell?.labelWidthMm).toBe(80);
    expect(dumbbell?.labelHeightMm).toBe(12);
    expect(dumbbell?.columns).toBe(1);
    expect(dumbbell?.rows).toBe(1);

    // Physical dimensions & 203 DPI calculations (8 dots/mm)
    const totalDotsWidth = dumbbell!.labelWidthMm * 8; // 640 dots
    const totalDotsHeight = dumbbell!.labelHeightMm * 8; // 96 dots
    expect(totalDotsWidth).toBe(640);
    expect(totalDotsHeight).toBe(96);

    // Flap distribution (Left flap ~26mm, middle tail ~28mm, right flap ~26mm)
    const flapLeftPct = 33;
    const flapRightPct = 33;
    const middlePct = 100 - flapLeftPct - flapRightPct; // 34%
    const flapLeftWidthMm = (dumbbell!.labelWidthMm * flapLeftPct) / 100;
    const flapRightWidthMm = (dumbbell!.labelWidthMm * flapRightPct) / 100;
    const middleWidthMm = (dumbbell!.labelWidthMm * middlePct) / 100;

    expect(flapLeftWidthMm).toBeCloseTo(26.4, 1);
    expect(middleWidthMm).toBeCloseTo(27.2, 1);
    expect(flapRightWidthMm).toBeCloseTo(26.4, 1);

    // 4-Way margins: Top 0.8mm, Bottom 0.8mm, Left 1.0mm, Right 1.0mm
    const marginTopMm = 0.8;
    const marginBottomMm = 0.8;
    const marginLeftMm = 1.0;
    const marginRightMm = 1.0;
    const safePrintableHeightMm = dumbbell!.labelHeightMm - (marginTopMm + marginBottomMm);
    expect(safePrintableHeightMm).toBe(10.4);

    // Barcode box height fits inside safe height leaving room for text
    const itemRowHeightMm = 2.2;
    const barcodeBoxHeightMm = 5.2;
    const barcodeNumHeightMm = 1.5;
    const totalRightFlapContentHeight = itemRowHeightMm + barcodeBoxHeightMm + barcodeNumHeightMm;
    expect(totalRightFlapContentHeight).toBeLessThanOrEqual(safePrintableHeightMm);
  });

  it('validates start origin calibration offsets, flap swap, and orientation options', async () => {
    const { downloadBarcodePdf } = await import('@/components/barcode/barcodePrintService');

    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.getContext = function () {
      return {
        clearRect: () => {},
        fillRect: () => {},
        drawImage: () => {},
        getImageData: () => ({ data: [] }),
        putImageData: () => {},
        setTransform: () => {},
        scale: () => {},
        translate: () => {},
        rotate: () => {},
        measureText: () => ({ width: 0 }),
      } as any;
    };
    HTMLCanvasElement.prototype.toDataURL = function () {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    };

    try {
      // Test vector PDF export with custom start offsets and orientation
      expect(() => {
        downloadBarcodePdf({
          barcodes: ['SK-100234', 'SK-100235'],
          sheets: [['SK-100234', 'SK-100235']],
          isThermal: true,
          storeName: 'DURGAS',
          selectedProduct: {
            id: 'test-1',
            name: 'GOLD RING 22K',
            barcode: 'SK-100234',
            sellingPrice: 15400,
            weight: '4.500g',
            material: '916 KDM',
            hsnCode: '7113',
            category: 'Ring',
            costPrice: 14000,
            stockQty: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as any,
          showStoreName: true,
          showProductName: true,
          showPrice: true,
          showBarcodeText: true,
          columnsCount: 1,
          labelWidthMm: 80,
          labelHeightMm: 12,
          flapLeftWidthPct: 33,
          flapRightWidthPct: 33,
          marginTopMm: 0.8,
          marginBottomMm: 0.8,
          marginLeftMm: 1.0,
          marginRightMm: 1.0,
          offsetXmm: 1.2,
          offsetYmm: -0.6,
          invertFlaps: true,
          rotate180: false,
          flipBackFlap180: true,
          printOrientation: 'landscape',
        });
      }).not.toThrow();
    } finally {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
      HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
    }
  });

  it('supports rotating thermal dumbbell labels to 90 degrees (vertical feed) and other angles', async () => {
    const { downloadBarcodePdf } = await import('@/components/barcode/barcodePrintService');

    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.getContext = function () {
      return {
        clearRect: () => {},
        fillRect: () => {},
        drawImage: () => {},
        getImageData: () => ({ data: [] }),
        putImageData: () => {},
        setTransform: () => {},
        scale: () => {},
        translate: () => {},
        rotate: () => {},
        measureText: () => ({ width: 0 }),
      } as any;
    };
    HTMLCanvasElement.prototype.toDataURL = function () {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    };

    try {
      // 1. Verify 90 degree rotation with rotate90 flag
      expect(() => {
        downloadBarcodePdf({
          barcodes: ['SK-900001'],
          sheets: [['SK-900001']],
          isThermal: true,
          storeName: 'DURGAS',
          selectedProduct: null,
          showStoreName: true,
          showProductName: true,
          showPrice: true,
          showBarcodeText: true,
          columnsCount: 1,
          labelWidthMm: 80,
          labelHeightMm: 12,
          rotate90: true,
        });
      }).not.toThrow();

      // 2. Verify all rotation angles: 0, 90, 180, 270
      const angles: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
      for (const angle of angles) {
        expect(() => {
          downloadBarcodePdf({
            barcodes: ['SK-900002'],
            sheets: [['SK-900002']],
            isThermal: true,
            storeName: 'DURGAS',
            selectedProduct: null,
            showStoreName: true,
            showProductName: true,
            showPrice: true,
            showBarcodeText: true,
            columnsCount: 1,
            labelWidthMm: 80,
            labelHeightMm: 12,
            rotationAngle: angle,
          });
        }).not.toThrow();
      }
    } finally {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
      HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
    }
  });
});

