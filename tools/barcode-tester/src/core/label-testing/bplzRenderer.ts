/**
 * BPLZ (ZPL-II) and BPLE (EPL-2) Printer Command Generator
 * Converts canonical LabelDefinition into raw command streams for TVS LP 46 Neo / SNBC printers.
 */

import type { LabelDefinition, TextElement, BarcodeElement, ShapeElement, ImageElement } from './labelModel.ts';

export interface CommandStreamResult {
  emulation: 'BPLZ' | 'BPLE';
  rawCommands: string;
  commandLines: string[];
  totalBytes: number;
  printSettings: {
    speedIps: number;
    darkness: number;
    widthDots: number;
    heightDots: number;
  };
}

/**
 * Generates BPLZ (ZPL-II Compatible) command stream for TVS LP 46 Neo
 */
export function generateBplz(label: LabelDefinition): CommandStreamResult {
  const { widthDots, heightDots } = label.dimensions;
  const speed = label.printSettings.speedIps || 4;
  const darkness = label.printSettings.darkness || 15;
  const copies = label.printSettings.copies || 1;

  const lines: string[] = [
    '^XA', // Start Format
    `^PW${widthDots}`, // Print Width in dots (e.g. 640 for 80mm @ 203 DPI)
    `^LL${heightDots}`, // Label Length in dots (e.g. 96 for 12mm @ 203 DPI)
    '^LH0,0', // Label Home origin at (0,0)
    `^PR${speed},${speed}`, // Print Speed (e.g. 3 ips optimal for 12mm jewelry labels)
    `~SD${darkness}`, // Set Darkness (0..30)
    '^MNY', // Media Tracking: Non-continuous (Web / Gap sensing)
    '^MTT', // Media Type: Thermal Transfer with Ribbon
    '^MMT', // Print Mode: Tear-off
    '^LS0', // Label Shift: 0
    '^PON', // Normal Print Orientation
  ];

  for (const el of label.elements) {
    if (el.type === 'shape') {
      const s = el as ShapeElement;
      if (s.shape === 'line') {
        const w = s.width || widthDots - s.x * 2;
        const th = s.thickness || 2;
        lines.push(`^FO${s.x},${s.y}^GB${w},${th},${th},B,0^FS`);
      } else {
        const w = s.width || 40;
        const h = s.height || 20;
        const th = s.thickness || 2;
        lines.push(`^FO${s.x},${s.y}^GB${w},${h},${th},B,0^FS`);
      }
    } else if (el.type === 'text') {
      const t = el as TextElement;
      // Convert font size in dots to ZPL font height and width
      const fontHeight = Math.max(10, Math.round(t.fontSizeDots));
      const fontWidth = Math.max(8, Math.round(t.fontSizeDots * 0.85));

      // Alignment handling in ZPL
      let x = t.x;
      if (t.align === 'center') {
        const maxW = t.maxWidth || 200;
        lines.push(`^FO${x - maxW / 2},${t.y - fontHeight / 2}^FB${maxW},1,0,C,0^A0N,${fontHeight},${fontWidth}^FD${t.text}^FS`);
      } else if (t.align === 'right') {
        const maxW = t.maxWidth || 100;
        lines.push(`^FO${x - maxW},${t.y - fontHeight / 2}^FB${maxW},1,0,R,0^A0N,${fontHeight},${fontWidth}^FD${t.text}^FS`);
      } else {
        lines.push(`^FO${x},${t.y - fontHeight / 2}^A0N,${fontHeight},${fontWidth}^FD${t.text}^FS`);
      }
    } else if (el.type === 'barcode') {
      const b = el as BarcodeElement;
      const modWidth = Math.max(1, Math.min(10, Math.round(b.moduleWidthDots)));
      const barHeight = b.barHeightDots;
      const cleanData = (b.data || '').trim();

      if (b.format === 'QR') {
        // ZPL QR Code: ^BQN,2,moduleWidth
        lines.push(`^FO${b.x},${b.y}^BQN,2,${Math.max(2, Math.min(10, modWidth * 2))}^FDMA,${cleanData}^FS`);
      } else if (b.format === 'EAN13' || (!b.format && /^\d{13}$/.test(cleanData))) {
        // ZPL EAN-13: ^BEN,height,printInterpretationLine
        const showInterp = b.displayValue ? 'Y' : 'N';
        lines.push(`^BY${modWidth},2,${barHeight}`);
        lines.push(`^FO${b.x},${b.y}^BEN,${barHeight},${showInterp},N^FD${cleanData}^FS`);
      } else {
        // Default Code 128: ^BCN,height,printInterpretationLine,uccCheck,mode
        const showInterp = b.displayValue ? 'Y' : 'N';
        lines.push(`^BY${modWidth},3,${barHeight}`);
        lines.push(`^FO${b.x},${b.y}^BCN,${barHeight},${showInterp},N,N^FD>:${cleanData}^FS`);
      }
    }
  }

  // Print Quantity & End
  lines.push(`^PQ${copies},0,1,Y`);
  lines.push('^XZ');

  const rawCommands = lines.join('\r\n') + '\r\n';

  return {
    emulation: 'BPLZ',
    rawCommands,
    commandLines: lines,
    totalBytes: rawCommands.length,
    printSettings: {
      speedIps: speed,
      darkness,
      widthDots,
      heightDots,
    },
  };
}

/**
 * Generates BPLE (EPL-2 Compatible) command stream for SNBC TVSE LP 46 NEO BPLE
 */
export function generateBple(label: LabelDefinition): CommandStreamResult {
  const { widthDots, heightDots } = label.dimensions;
  const speed = Math.max(1, Math.min(5, label.printSettings.speedIps || 3));
  const darkness = Math.max(0, Math.min(15, label.printSettings.darkness || 10));
  const copies = label.printSettings.copies || 1;

  const lines: string[] = [
    'N', // Clear image buffer
    `q${widthDots}`, // Set label width in dots
    `Q${heightDots},24`, // Set label length in dots and gap (24 dots ≈ 3mm gap)
    'R0,0', // Reference Point (0,0)
    `S${speed}`, // Print Speed (1-5, 3 recommended)
    `D${darkness}`, // Density/Darkness (0-15)
    'ZB', // Print buffer direction (Top to bottom)
    'OC', // Disable cutter / Tear-off mode
  ];

  for (const el of label.elements) {
    if (el.type === 'shape') {
      const s = el as ShapeElement;
      const w = s.width || widthDots - s.x * 2;
      const th = s.thickness || 2;
      lines.push(`LO${s.x},${s.y},${w},${th}`);
    } else if (el.type === 'text') {
      const t = el as TextElement;
      // EPL fonts: 1 (8x12), 2 (10x16), 3 (12x20), 4 (14x24), 5 (32x48)
      let eplFont = 2;
      if (t.fontSizeDots < 16) eplFont = 1;
      else if (t.fontSizeDots <= 20) eplFont = 2;
      else if (t.fontSizeDots <= 26) eplFont = 3;
      else if (t.fontSizeDots <= 36) eplFont = 4;
      else eplFont = 5;

      let x = t.x;
      if (t.align === 'center') {
        const estWidth = t.text.length * (eplFont * 4.5);
        x = Math.max(0, Math.round(t.x - estWidth / 2));
      } else if (t.align === 'right') {
        const estWidth = t.text.length * (eplFont * 4.5);
        x = Math.max(0, Math.round(t.x - estWidth));
      }

      const y = Math.max(0, Math.round(t.y - t.fontSizeDots / 2));
      lines.push(`A${x},${y},0,${eplFont},1,1,N,"${t.text.replace(/"/g, "'")}"`);
    } else if (el.type === 'barcode') {
      const b = el as BarcodeElement;
      const cleanData = (b.data || '').trim();
      const modWidth = Math.max(1, Math.min(4, Math.round(b.moduleWidthDots)));
      const wideWidth = modWidth * 2;
      const showReadable = b.displayValue ? 'B' : 'N';

      if (b.format === 'QR') {
        // EPL-2 QR Code: b p1,p2,p3,[p4...],"data"
        lines.push(`b${b.x},${b.y},Q,s4,eM,"${cleanData}"`);
      } else if (b.format === 'EAN13' || (/^\d{13}$/.test(cleanData) && b.format !== 'CODE39')) {
        // EPL-2 EAN-13: type 'E30'
        lines.push(`B${b.x},${b.y},0,E30,${modWidth},${wideWidth},${b.barHeightDots},${showReadable},"${cleanData}"`);
      } else {
        // EPL-2 Code 128: type '1'
        lines.push(`B${b.x},${b.y},0,1,${modWidth},${wideWidth},${b.barHeightDots},${showReadable},"${cleanData}"`);
      }
    }
  }

  // Print Quantity
  lines.push(`P${copies}`);

  const rawCommands = lines.join('\r\n') + '\r\n';

  return {
    emulation: 'BPLE',
    rawCommands,
    commandLines: lines,
    totalBytes: rawCommands.length,
    printSettings: {
      speedIps: speed,
      darkness,
      widthDots,
      heightDots,
    },
  };
}
