/**
 * Barcode Print Sheet & Page Layout Engine
 * Calculates optimal row/column distribution to fit any paper size and label dimensions.
 */

export interface PaperSize {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
}

export const STANDARD_PAPER_SIZES: Record<string, PaperSize> = {
  JEWELRY_DUMBBELL: { id: 'JEWELRY_DUMBBELL', name: 'TVS LP 46 Neo Dumbbell (80 × 12 mm)', widthMm: 80, heightMm: 12 },
  A4: { id: 'A4', name: 'A4 Sheet (210 × 297 mm)', widthMm: 210, heightMm: 297 },
  A5: { id: 'A5', name: 'A5 Sheet (148 × 210 mm)', widthMm: 148, heightMm: 210 },
  LETTER: { id: 'LETTER', name: 'Letter (215.9 × 279.4 mm)', widthMm: 215.9, heightMm: 279.4 },
  THERMAL_50X25: { id: 'THERMAL_50X25', name: 'Thermal Roll 50×25 mm', widthMm: 50, heightMm: 25 },
  THERMAL_50X35: { id: 'THERMAL_50X35', name: 'Thermal Roll 50×35 mm', widthMm: 50, heightMm: 35 },
  JEWELRY_TAG: { id: 'JEWELRY_TAG', name: 'Jewelry/Apparel Tag 100×50 mm', widthMm: 100, heightMm: 50 },
  CUSTOM: { id: 'CUSTOM', name: 'Custom Dimensions', widthMm: 80, heightMm: 12 },
};

export interface SheetPreset {
  id: string;
  name: string;
  paperSizeId: string;
  columns: number;
  rows: number;
  labelWidthMm: number;
  labelHeightMm: number;
  gapHorizontalMm: number;
  gapVerticalMm: number;
  marginMm: number;
  labelsPerSheet: number;
}

export const POPULAR_SHEET_PRESETS: SheetPreset[] = [
  {
    id: 'preset_jewelry_dumbbell',
    name: 'TVS LP 46 Neo Dumbbell (80 × 12 mm)',
    paperSizeId: 'JEWELRY_DUMBBELL',
    columns: 1,
    rows: 1,
    labelWidthMm: 80,
    labelHeightMm: 12,
    gapHorizontalMm: 0,
    gapVerticalMm: 0,
    marginMm: 0,
    labelsPerSheet: 1,
  },
  {
    id: 'preset_jewelry_a4',
    name: 'Jewelry Dumbbell A4 (80 × 12 mm • 44/sheet)',
    paperSizeId: 'A4',
    columns: 2,
    rows: 22,
    labelWidthMm: 80,
    labelHeightMm: 12,
    gapHorizontalMm: 4,
    gapVerticalMm: 1,
    marginMm: 8,
    labelsPerSheet: 44,
  },
  {
    id: 'preset_roll_single',
    name: 'Single Thermal Sticker (50 × 25 mm)',
    paperSizeId: 'THERMAL_50X25',
    columns: 1,
    rows: 1,
    labelWidthMm: 50,
    labelHeightMm: 25,
    gapHorizontalMm: 0,
    gapVerticalMm: 0,
    marginMm: 1,
    labelsPerSheet: 1,
  },
  {
    id: 'preset_24',
    name: '24 Labels / A4 Sheet (3 × 8)',
    paperSizeId: 'A4',
    columns: 3,
    rows: 8,
    labelWidthMm: 63.5,
    labelHeightMm: 38.1,
    gapHorizontalMm: 2.5,
    gapVerticalMm: 0,
    marginMm: 6,
    labelsPerSheet: 24,
  },
  {
    id: 'preset_40',
    name: '40 Labels / A4 Sheet (4 × 10)',
    paperSizeId: 'A4',
    columns: 4,
    rows: 10,
    labelWidthMm: 48.5,
    labelHeightMm: 25.4,
    gapHorizontalMm: 2,
    gapVerticalMm: 0,
    marginMm: 5,
    labelsPerSheet: 40,
  },
  {
    id: 'preset_65',
    name: '65 Labels / A4 Sheet (5 × 13)',
    paperSizeId: 'A4',
    columns: 5,
    rows: 13,
    labelWidthMm: 38.1,
    labelHeightMm: 21.2,
    gapHorizontalMm: 1.5,
    gapVerticalMm: 0,
    marginMm: 4,
    labelsPerSheet: 65,
  },
  {
    id: 'preset_84',
    name: '84 Labels / A4 Sheet (6 × 14)',
    paperSizeId: 'A4',
    columns: 6,
    rows: 14,
    labelWidthMm: 38,
    labelHeightMm: 18,
    gapHorizontalMm: 1,
    gapVerticalMm: 0,
    marginMm: 4,
    labelsPerSheet: 84,
  },
];

export interface LayoutParams {
  paperWidthMm: number;
  paperHeightMm: number;
  labelWidthMm: number;
  labelHeightMm: number;
  marginMm?: number;
  gapHorizontalMm?: number;
  gapVerticalMm?: number;
  totalCount: number;
  userColumnsOverride?: number;
}

export interface LayoutResult {
  columns: number;
  rows: number;
  labelsPerPage: number;
  totalPages: number;
  printableWidthMm: number;
  printableHeightMm: number;
  spaceUtilizationPercent: number;
  isCustomColumns: boolean;
}

/**
 * Calculates optimal columns, rows, and page distribution
 */
export function calculateOptimalLayout(params: LayoutParams): LayoutResult {
  const {
    paperWidthMm,
    paperHeightMm,
    labelWidthMm,
    labelHeightMm,
    marginMm = 5,
    gapHorizontalMm = 2,
    gapVerticalMm = 2,
    totalCount = 1,
    userColumnsOverride,
  } = params;

  const printableWidthMm = Math.max(0, paperWidthMm - 2 * marginMm);
  const printableHeightMm = Math.max(0, paperHeightMm - 2 * marginMm);

  // Auto-calculated optimal columns
  const autoColumns = Math.max(
    1,
    Math.floor((printableWidthMm + gapHorizontalMm) / (labelWidthMm + gapHorizontalMm))
  );

  const columns = userColumnsOverride && userColumnsOverride > 0 ? userColumnsOverride : autoColumns;

  // Auto-calculated rows based on height
  const rows = Math.max(
    1,
    Math.floor((printableHeightMm + gapVerticalMm) / (labelHeightMm + gapVerticalMm))
  );

  const labelsPerPage = Math.max(1, columns * rows);
  const totalPages = Math.max(1, Math.ceil(totalCount / labelsPerPage));

  // Calculate paper space utilization percentage
  const totalLabelArea = columns * rows * (labelWidthMm * labelHeightMm);
  const totalPaperArea = paperWidthMm * paperHeightMm;
  const spaceUtilizationPercent = totalPaperArea > 0 ? Math.min(100, (totalLabelArea / totalPaperArea) * 100) : 0;

  return {
    columns,
    rows,
    labelsPerPage,
    totalPages,
    printableWidthMm,
    printableHeightMm,
    spaceUtilizationPercent: Number(spaceUtilizationPercent.toFixed(1)),
    isCustomColumns: !!userColumnsOverride && userColumnsOverride !== autoColumns,
  };
}
