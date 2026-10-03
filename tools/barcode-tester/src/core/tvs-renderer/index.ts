import { LabelDefinition, LabelElement, mmToDots, dotsToMm } from '../label';

export interface BplzCompilationResult {
  emulation: 'BPLZ' | 'BPLE';
  rawCommands: string;
  totalBytes: number;
  widthDots: number;
  heightDots: number;
  elementsCompiled: number;
  dpi: number;
}

export class TvsRenderer {
  private dpi: number;

  constructor(dpi: number = 203) {
    this.dpi = dpi;
  }

  /**
   * Compiles LabelDefinition into BPLZ (ZPL-compatible for TVS LP 46 Neo / SNBC)
   */
  public compileBplz(label: LabelDefinition): BplzCompilationResult {
    const widthDots = mmToDots(label.width, this.dpi);
    const heightDots = mmToDots(label.height, this.dpi);
    const copies = label.copies || 1;

    const lines: string[] = [];
    lines.push('^XA');
    lines.push(`^PW${widthDots}`);
    lines.push(`^LL${heightDots}`);
    lines.push('^LH0,0');
    lines.push('^PR4,4'); // 4 inches/sec print speed
    lines.push('~SD20');  // Darkness setting

    for (const elem of label.elements) {
      const x = Math.max(0, mmToDots(elem.x, this.dpi));
      const y = Math.max(0, mmToDots(elem.y, this.dpi));
      const rot = this.toBplzRotation(elem.rotation);

      if (elem.type === 'text') {
        const text = (elem.value || '').replace(/[\^~]/g, '');
        const fontH = elem.fontSizeMm ? Math.max(14, mmToDots(elem.fontSizeMm, this.dpi)) : 22;
        const fontW = Math.round(fontH * 0.85);

        lines.push(`^FO${x},${y}^A0${rot},${fontH},${fontW}^FD${text}^FS`);
      } else if (elem.type === 'barcode') {
        const code = (elem.value || '8901234567890').replace(/[\^~]/g, '');
        const heightDots = elem.height ? mmToDots(elem.height, this.dpi) : 48;
        const moduleWidth = Math.max(2, elem.moduleWidthDots || 2);

        lines.push(`^BY${moduleWidth},3.0,${heightDots}`);
        lines.push(`^FO${x},${y}`);

        if (elem.format === 'EAN13' && /^\d{12,13}$/.test(code)) {
          lines.push(`^BE${rot},${heightDots},${elem.displayValue ? 'Y' : 'N'},N^FD${code}^FS`);
        } else {
          lines.push(`^BC${rot},${heightDots},${elem.displayValue ? 'Y' : 'N'},N,N,N^FD>:${code}^FS`);
        }
      } else if (elem.type === 'shape' && elem.shape === 'line') {
        const wDots = elem.width ? mmToDots(elem.width, this.dpi) : widthDots;
        const thickness = elem.lineWidthMm ? Math.max(1, mmToDots(elem.lineWidthMm, this.dpi)) : 2;
        lines.push(`^FO${x},${y}^GB${wDots},${thickness},${thickness}^FS`);
      }
    }

    if (copies > 1) {
      lines.push(`^PQ${copies}`);
    }

    lines.push('^XZ');

    const rawCommands = lines.join('\n');
    return {
      emulation: 'BPLZ',
      rawCommands,
      totalBytes: new TextEncoder().encode(rawCommands).length,
      widthDots,
      heightDots,
      elementsCompiled: label.elements.length,
      dpi: this.dpi
    };
  }

  /**
   * Compiles LabelDefinition into BPLE (EPL-compatible emulation)
   */
  public compileBple(label: LabelDefinition): BplzCompilationResult {
    const widthDots = mmToDots(label.width, this.dpi);
    const heightDots = mmToDots(label.height, this.dpi);
    const copies = label.copies || 1;

    const lines: string[] = [];
    lines.push('');
    lines.push('N'); // Clear image buffer
    lines.push(`q${widthDots}`); // Label width
    lines.push(`Q${heightDots},24`); // Label length + gap

    for (const elem of label.elements) {
      const x = Math.max(0, mmToDots(elem.x, this.dpi));
      const y = Math.max(0, mmToDots(elem.y, this.dpi));
      const rot = elem.rotation === 90 ? '1' : elem.rotation === 180 ? '2' : elem.rotation === 270 ? '3' : '0';

      if (elem.type === 'text') {
        const text = (elem.value || '').replace(/"/g, "'");
        lines.push(`A${x},${y},${rot},2,1,1,N,"${text}"`);
      } else if (elem.type === 'barcode') {
        const code = (elem.value || '8901234567890').replace(/"/g, '');
        const heightDots = elem.height ? mmToDots(elem.height, this.dpi) : 48;
        const moduleWidth = Math.max(2, elem.moduleWidthDots || 2);
        lines.push(`B${x},${y},${rot},1,${moduleWidth},4,${heightDots},${elem.displayValue ? 'B' : 'N'},"${code}"`);
      }
    }

    lines.push(`P${copies}`); // Print command

    const rawCommands = lines.join('\n');
    return {
      emulation: 'BPLE',
      rawCommands,
      totalBytes: new TextEncoder().encode(rawCommands).length,
      widthDots,
      heightDots,
      elementsCompiled: label.elements.length,
      dpi: this.dpi
    };
  }

  private toBplzRotation(deg?: number): 'N' | 'R' | 'I' | 'B' {
    switch (deg) {
      case 90: return 'R';
      case 180: return 'I';
      case 270: return 'B';
      default: return 'N';
    }
  }
}
