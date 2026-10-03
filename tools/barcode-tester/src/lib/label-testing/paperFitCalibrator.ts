/**
 * Physical Paper Fit, Media Alignment & Hardware Calibration Engine
 * Calibrated for TVS LP 46 Neo / SNBC 203 DPI Thermal Barcode Printers.
 *
 * Specifically addresses odd-shape jewelry dumbbell die-cut rolls,
 * carrier liner margins, transmissive optical sensor placement,
 * and Windows driver / browser print configurations.
 */

import type { LabelDefinition } from './labelModel.ts';
import { mmToDots, dotsToMm } from './labelModel.ts';

export interface PhysicalRollConfig {
  labelWidthMm: number;        // e.g. 80.0 mm
  labelHeightMm: number;       // e.g. 12.0 mm
  carrierLinerWidthMm: number; // e.g. 84.0 mm (total wax paper backing width)
  carrierMarginLeftMm: number; // e.g. 2.0 mm (left unprinted carrier margin)
  carrierMarginRightMm: number;// e.g. 2.0 mm (right unprinted carrier margin)
  interLabelGapMm: number;     // e.g. 2.5 mm (gap between consecutive labels)
  sensorType: 'transmissive-gap' | 'reflective-black-mark' | 'continuous';
  sensorPositionMm: number;    // Distance of sensor eye from left edge of paper guide
  ribbonType: 'resin' | 'wax-resin' | 'direct-thermal';
  printerModel: string;
}

export interface PaperFitCheck {
  id: string;
  name: string;
  category: 'dimension' | 'sensor' | 'carrier' | 'feed-pitch' | 'driver-config';
  status: 'pass' | 'warn' | 'fail';
  message: string;
  recommendation?: string;
}

export interface PaperFitReport {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  rollConfig: PhysicalRollConfig;
  calculatedMetrics: {
    labelWidthDots: number;
    labelHeightDots: number;
    carrierWidthDots: number;
    carrierLeftDots: number;
    gapDots: number;
    pitchMm: number;           // Total feed distance per label (height + gap)
    pitchDots: number;
    maxPrintHeadDots: number;  // TVS LP 46 Neo 4.09" printhead = 832 dots
    leftHeadMarginDots: number;
    sensorSafeZone: {
      leftFlapSafe: [number, number];   // Safe mm range on left paddle
      middleTailNotch: [number, number]; // Hazardous notch zone (DO NOT place sensor here)
      rightFlapSafe: [number, number];  // Safe mm range on right paddle
    };
  };
  checks: PaperFitCheck[];
  windowsDriverSettings: {
    stockName: string;
    mediaType: string;
    sensorMode: string;
    printMethod: string;
    paperWidthMm: number;
    paperHeightMm: number;
    gapLengthMm: number;
    leftMarginMm: number;
    speedIps: number;
    darkness: number;
  };
  browserPrintSettings: {
    paperSize: string;
    margins: string;
    scale: string;
    headersAndFooters: string;
    backgroundGraphics: string;
  };
}

/**
 * Default physical specifications for standard 80x12 mm jewelry dumbbell tag rolls
 */
export const DEFAULT_JEWELRY_ROLL: PhysicalRollConfig = {
  labelWidthMm: 80.0,
  labelHeightMm: 12.0,
  carrierLinerWidthMm: 84.0,
  carrierMarginLeftMm: 2.0,
  carrierMarginRightMm: 2.0,
  interLabelGapMm: 2.5,
  sensorType: 'transmissive-gap',
  sensorPositionMm: 14.0, // 14mm from left guide = safely inside the 26.4mm Left Flap
  ribbonType: 'resin',
  printerModel: 'TVS LP 46 Neo / SNBC 203 DPI',
};

/**
 * Audits physical paper fit, sensor positioning, and hardware driver parameters
 */
export function verifyPaperFit(
  label: LabelDefinition,
  customRoll?: Partial<PhysicalRollConfig>
): PaperFitReport {
  const roll: PhysicalRollConfig = { ...DEFAULT_JEWELRY_ROLL, ...customRoll };
  const dpi = label.dimensions.dpi || 203;

  const labelWidthDots = mmToDots(roll.labelWidthMm, dpi);
  const labelHeightDots = mmToDots(roll.labelHeightMm, dpi);
  const carrierWidthDots = mmToDots(roll.carrierLinerWidthMm, dpi);
  const carrierLeftDots = mmToDots(roll.carrierMarginLeftMm, dpi);
  const gapDots = mmToDots(roll.interLabelGapMm, dpi);
  const pitchMm = Number((roll.labelHeightMm + roll.interLabelGapMm).toFixed(2));
  const pitchDots = labelHeightDots + gapDots;
  const maxPrintHeadDots = 832; // 104 mm printhead width @ 203 DPI

  const isDumbbell =
    (roll.labelWidthMm === 80 && roll.labelHeightMm === 12) ||
    label.id.includes('dumbbell');

  // Transmissive Sensor Safe Zones (in mm from left edge of paper roll)
  // Left Flap: 2mm liner + 0..26.4mm label = 2.0 to 28.4mm
  // Center Tail Cutout: 28.4mm to 55.6mm (Bridge with top/bottom die-cut notches)
  // Right Flap: 55.6mm to 82.0mm
  const sensorSafeZone = {
    leftFlapSafe: [6.0, 24.0] as [number, number],
    middleTailNotch: [27.0, 55.0] as [number, number],
    rightFlapSafe: [58.0, 78.0] as [number, number],
  };

  const checks: PaperFitCheck[] = [];

  // Check 1: Printhead Width Fit
  if (labelWidthDots <= maxPrintHeadDots) {
    checks.push({
      id: 'printhead-width-fit',
      name: 'Printhead Width Fit',
      category: 'dimension',
      status: 'pass',
      message: `Label width (${roll.labelWidthMm}mm / ${labelWidthDots} dots) fits comfortably within the 104mm (832 dots) thermal printhead.`,
    });
  } else {
    checks.push({
      id: 'printhead-width-fit',
      name: 'Printhead Width Fit',
      category: 'dimension',
      status: 'fail',
      message: `Label width (${roll.labelWidthMm}mm / ${labelWidthDots} dots) exceeds the 104mm printhead limit (${maxPrintHeadDots} dots).`,
      recommendation: 'Rotate print orientation or select a wider printer.',
    });
  }

  // Check 2: Carrier Web vs Media Guide Width
  if (roll.carrierLinerWidthMm >= 25.4 && roll.carrierLinerWidthMm <= 110.0) {
    checks.push({
      id: 'carrier-web-fit',
      name: 'Media Guide Width Fit',
      category: 'carrier',
      status: 'pass',
      message: `Carrier web width (${roll.carrierLinerWidthMm}mm) is within the TVS LP 46 Neo media guide range (25.4mm - 110mm).`,
    });
  } else {
    checks.push({
      id: 'carrier-web-fit',
      name: 'Media Guide Width Fit',
      category: 'carrier',
      status: 'fail',
      message: `Carrier web width (${roll.carrierLinerWidthMm}mm) is outside physical media guide limits.`,
    });
  }

  // Check 3: Transmissive Gap Sensor Alignment (CRITICAL FOR DUMBBELLS)
  if (isDumbbell && roll.sensorType === 'transmissive-gap') {
    const sPos = roll.sensorPositionMm;
    const inHazard = sPos >= sensorSafeZone.middleTailNotch[0] && sPos <= sensorSafeZone.middleTailNotch[1];
    const inLeftSafe = sPos >= sensorSafeZone.leftFlapSafe[0] && sPos <= sensorSafeZone.leftFlapSafe[1];
    const inRightSafe = sPos >= sensorSafeZone.rightFlapSafe[0] && sPos <= sensorSafeZone.rightFlapSafe[1];

    if (inHazard) {
      checks.push({
        id: 'dumbbell-sensor-hazard',
        name: 'Transmissive Sensor Position (Dumbbell Notch Hazard)',
        category: 'sensor',
        status: 'fail',
        message: `Sensor is positioned at ${sPos}mm, which lands directly inside the Dumbbell Center Fold Notch (27mm - 55mm). The printer will mistake the die-cut cutout for an inter-label gap and skip labels or jam!`,
        recommendation: `Slide the movable transmissive sensor to ${sensorSafeZone.leftFlapSafe[0]}mm - ${sensorSafeZone.leftFlapSafe[1]}mm (Left Flap Paddle) or ${sensorSafeZone.rightFlapSafe[0]}mm - ${sensorSafeZone.rightFlapSafe[1]}mm (Right Flap Paddle).`,
      });
    } else if (inLeftSafe || inRightSafe) {
      checks.push({
        id: 'dumbbell-sensor-hazard',
        name: 'Transmissive Sensor Alignment',
        category: 'sensor',
        status: 'pass',
        message: `Sensor position (${sPos}mm) correctly aligns with the solid ${inLeftSafe ? 'Left Flap' : 'Right Flap'} paddle. Accurate gap detection guaranteed.`,
      });
    } else {
      checks.push({
        id: 'dumbbell-sensor-hazard',
        name: 'Transmissive Sensor Alignment',
        category: 'sensor',
        status: 'warn',
        message: `Sensor position (${sPos}mm) is near the edge of the label. Recommended position is 14mm to 18mm from left paper guide.`,
        recommendation: 'Position sensor near 14mm for optimal detection of the 2.5mm inter-label gap.',
      });
    }
  }

  // Check 4: Inter-Label Gap & Pitch Cycle
  if (roll.interLabelGapMm >= 2.0 && roll.interLabelGapMm <= 4.0) {
    checks.push({
      id: 'inter-label-gap',
      name: 'Inter-Label Gap Dimension',
      category: 'feed-pitch',
      status: 'pass',
      message: `Gap length of ${roll.interLabelGapMm}mm (${gapDots} dots) provides reliable optical sensor transition at 203 DPI.`,
    });
  } else if (roll.interLabelGapMm < 2.0) {
    checks.push({
      id: 'inter-label-gap',
      name: 'Inter-Label Gap Dimension',
      category: 'feed-pitch',
      status: 'fail',
      message: `Gap length of ${roll.interLabelGapMm}mm is too small (< 2.0mm). Optical sensor may fail to register label boundaries at normal print speed.`,
      recommendation: 'Ensure jewelry label roll stock has at least 2.5mm die-cut gap.',
    });
  } else {
    checks.push({
      id: 'inter-label-gap',
      name: 'Inter-Label Gap Dimension',
      category: 'feed-pitch',
      status: 'warn',
      message: `Gap length of ${roll.interLabelGapMm}mm is wider than standard (2.5mm). Adjust printer Q-command to avoid feed drift.`,
    });
  }

  // Check 5: Media Type & Ribbon Requirement
  if (roll.ribbonType === 'resin') {
    checks.push({
      id: 'ribbon-compatibility',
      name: 'Ribbon & Synthetic Tag Compatibility',
      category: 'driver-config',
      status: 'pass',
      message: 'Full Resin ribbon selected. Impervious to jewelry ultrasonic cleaning baths, steam cleaning, and rub wear.',
    });
  } else if (roll.ribbonType === 'wax-resin') {
    checks.push({
      id: 'ribbon-compatibility',
      name: 'Ribbon & Synthetic Tag Compatibility',
      category: 'driver-config',
      status: 'warn',
      message: 'Wax-Resin ribbon selected. Acceptable for retail display, but may smudge during ultrasonic chemical jewelry cleaning.',
      recommendation: 'Use Full Resin thermal transfer ribbon for gold/silver jewelry tags.',
    });
  } else {
    checks.push({
      id: 'ribbon-compatibility',
      name: 'Ribbon & Synthetic Tag Compatibility',
      category: 'driver-config',
      status: 'fail',
      message: 'Direct Thermal selected. Synthetic jewelry tags cannot be printed direct-thermal and will turn black under display case halogens.',
      recommendation: 'Equip printer with Resin Thermal Ribbon and set print method to Thermal Transfer (^MTT).',
    });
  }

  // Check 6: Print Speed Calibration for 12mm Micro-Height
  const configuredSpeed = label.printSettings.speedIps || 3;
  if (configuredSpeed <= 3) {
    checks.push({
      id: 'print-speed-calibration',
      name: 'Print Speed Calibration (12mm Tag Height)',
      category: 'driver-config',
      status: 'pass',
      message: `Print speed of ${configuredSpeed} ips (inches/sec) is optimal for 12mm jewelry tags. Prevents ribbon slippage and text jitter.`,
    });
  } else {
    checks.push({
      id: 'print-speed-calibration',
      name: 'Print Speed Calibration (12mm Tag Height)',
      category: 'driver-config',
      status: 'warn',
      message: `Configured speed of ${configuredSpeed} ips may cause ribbon drag and registration drift on small 12mm labels.`,
      recommendation: 'Cap print speed at 2.5 or 3.0 ips (^PR3,3 / S3) for jewelry tags.',
    });
  }

  const errorCount = checks.filter((c) => c.status === 'fail').length;
  const warningCount = checks.filter((c) => c.status === 'warn').length;

  return {
    valid: errorCount === 0,
    errorCount,
    warningCount,
    rollConfig: roll,
    calculatedMetrics: {
      labelWidthDots,
      labelHeightDots,
      carrierWidthDots,
      carrierLeftDots,
      gapDots,
      pitchMm,
      pitchDots,
      maxPrintHeadDots,
      leftHeadMarginDots: carrierLeftDots,
      sensorSafeZone,
    },
    windowsDriverSettings: {
      stockName: `Dumbbell_${roll.labelWidthMm}x${roll.labelHeightMm}mm`,
      mediaType: roll.sensorType === 'transmissive-gap' ? 'Labels with Gaps' : 'Mark Sensing',
      sensorMode: 'Transmissive / Gap',
      printMethod: 'Thermal Transfer (Ribbon)',
      paperWidthMm: roll.labelWidthMm,
      paperHeightMm: roll.labelHeightMm,
      gapLengthMm: roll.interLabelGapMm,
      leftMarginMm: roll.carrierMarginLeftMm,
      speedIps: configuredSpeed,
      darkness: label.printSettings.darkness || 14,
    },
    browserPrintSettings: {
      paperSize: `Custom (${roll.labelWidthMm}mm × ${roll.labelHeightMm}mm) Landscape`,
      margins: 'None (0 mm)',
      scale: '100% (Actual Size - Do NOT use "Fit to Printable Area")',
      headersAndFooters: 'Unchecked (Off)',
      backgroundGraphics: 'Checked (On)',
    },
    checks,
  };
}
