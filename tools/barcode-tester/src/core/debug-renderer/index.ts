import { LabelDefinition, LabelElement, mmToDots, dotsToMm } from '../label';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  elementId?: string;
  message: string;
}

export interface RenderResult {
  svg: string;
  widthDots: number;
  heightDots: number;
  widthMm: number;
  heightMm: number;
  issues: ValidationIssue[];
}

export class DebugRenderer {
  /**
   * Generates crisp 203-DPI SVG reference matching thermal printhead geometry
   */
  public renderToSvg(label: LabelDefinition, options: { showGrid?: boolean; showDumbbellZones?: boolean } = {}): RenderResult {
    const widthDots = mmToDots(label.width, label.dpi);
    const heightDots = mmToDots(label.height, label.dpi);
    const issues: ValidationIssue[] = [];

    // Background & Paper definition
    let svgContent = `
      <rect width="${widthDots}" height="${heightDots}" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
    `;

    // Visual grid at 1mm and 5mm increments
    if (options.showGrid) {
      const step1mm = mmToDots(1, label.dpi);
      const step5mm = mmToDots(5, label.dpi);
      let gridLines = '';
      for (let x = step5mm; x < widthDots; x += step5mm) {
        gridLines += `<line x1="${x}" y1="0" x2="${x}" y2="${heightDots}" stroke="#e2e8f0" stroke-width="1" />`;
      }
      for (let y = step5mm; y < heightDots; y += step5mm) {
        gridLines += `<line x1="0" y1="${y}" x2="${widthDots}" y2="${y}" stroke="#e2e8f0" stroke-width="1" />`;
      }
      svgContent += `<g class="grid" opacity="0.6">${gridLines}</g>`;
    }

    // Dumbbell Zones (Flap 1, Tail, Flap 2)
    if (options.showDumbbellZones && label.width >= 70 && label.height <= 15) {
      const flap1Dots = mmToDots(26, label.dpi);
      const flap2StartDots = mmToDots(54, label.dpi);
      const flap2WidthDots = widthDots - flap2StartDots;
      svgContent += `
        <!-- Flap 1 Zone -->
        <rect x="0" y="0" width="${flap1Dots}" height="${heightDots}" fill="rgba(59, 130, 246, 0.04)" stroke="rgba(59, 130, 246, 0.3)" stroke-dasharray="3,3" />
        <text x="4" y="${heightDots - 4}" font-family="sans-serif" font-size="8" fill="#3b82f6" font-weight="bold">FLAP 1</text>
        
        <!-- Tail / Loop Zone (non-printable) -->
        <rect x="${flap1Dots}" y="0" width="${flap2StartDots - flap1Dots}" height="${heightDots}" fill="rgba(239, 68, 68, 0.04)" stroke="rgba(239, 68, 68, 0.3)" stroke-dasharray="3,3" />
        <text x="${flap1Dots + 10}" y="${heightDots / 2 + 3}" font-family="sans-serif" font-size="8" fill="#ef4444" font-weight="bold">TAIL / LOOP</text>
        
        <!-- Flap 2 Zone -->
        <rect x="${flap2StartDots}" y="0" width="${flap2WidthDots}" height="${heightDots}" fill="rgba(16, 185, 129, 0.04)" stroke="rgba(16, 185, 129, 0.3)" stroke-dasharray="3,3" />
        <text x="${flap2StartDots + 4}" y="${heightDots - 4}" font-family="sans-serif" font-size="8" fill="#10b981" font-weight="bold">FLAP 2</text>
      `;
    }

    // Render Elements
    for (const elem of label.elements) {
      const xDots = mmToDots(elem.x, label.dpi);
      const yDots = mmToDots(elem.y, label.dpi);
      const wDots = elem.width ? mmToDots(elem.width, label.dpi) : undefined;
      const hDots = elem.height ? mmToDots(elem.height, label.dpi) : undefined;

      // Boundary Check
      if (xDots < 0 || yDots < 0 || (wDots && xDots + wDots > widthDots) || (hDots && yDots + hDots > heightDots)) {
        issues.push({
          severity: 'warning',
          elementId: elem.id,
          message: `Element '${elem.id}' extends beyond label boundary (x: ${elem.x}mm, y: ${elem.y}mm)`
        });
      }

      if (elem.type === 'text') {
        const fontPx = elem.fontSizeMm ? mmToDots(elem.fontSizeMm, label.dpi) : 16;
        const fontWeight = elem.bold ? 'bold' : 'normal';
        const fontFamily = elem.fontFamily || 'Inter, sans-serif';
        const textVal = elem.value || '';

        svgContent += `
          <text 
            id="${elem.id}"
            x="${xDots}" 
            y="${yDots + fontPx * 0.85}" 
            font-family="${fontFamily}" 
            font-size="${fontPx}" 
            font-weight="${fontWeight}" 
            fill="#000000"
            style="letter-spacing: -0.2px;"
          >${escapeXml(textVal)}</text>
        `;
      } else if (elem.type === 'barcode') {
        const barcodeCode = elem.value || '8901234567890';
        const barcodeHeight = hDots || 48;
        const moduleWidth = elem.moduleWidthDots || 2;

        if (moduleWidth < 2) {
          issues.push({
            severity: 'error',
            elementId: elem.id,
            message: `Barcode module width is ${moduleWidth} dots. Must be >= 2 dots for 203 DPI laser reliability.`
          });
        }

        const barcodeSvg = this.generateBarcodeInnerSvg(barcodeCode, barcodeHeight, moduleWidth, elem.format || 'CODE128');
        svgContent += `
          <g id="${elem.id}" transform="translate(${xDots}, ${yDots})">
            ${barcodeSvg}
          </g>
        `;

        if (elem.displayValue) {
          svgContent += `
            <text 
              x="${xDots + (wDots ? wDots / 2 : 50)}" 
              y="${yDots + barcodeHeight + 12}" 
              font-family="monospace" 
              font-size="12" 
              font-weight="bold" 
              text-anchor="middle"
              fill="#000000"
            >${escapeXml(barcodeCode)}</text>
          `;
        }
      }
    }

    const svg = `
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 ${widthDots} ${heightDots}" 
        width="${widthDots}" 
        height="${heightDots}" 
        shape-rendering="crispEdges"
      >
        ${svgContent}
      </svg>
    `.trim();

    return {
      svg,
      widthDots,
      heightDots,
      widthMm: label.width,
      heightMm: label.height,
      issues
    };
  }

  private generateBarcodeInnerSvg(code: string, height: number, moduleWidthDots: number, format: string): string {
    try {
      if (typeof document !== 'undefined') {
        const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        JsBarcode(svgNode, code, {
          format: format === 'EAN13' ? 'EAN13' : 'CODE128',
          displayValue: false,
          margin: 0,
          height: height,
          width: moduleWidthDots,
          background: 'transparent',
          lineColor: '#000000'
        });
        return svgNode.innerHTML;
      }
    } catch {
      // Fallback below
    }
    // Static fallback representation if off-dom
    return `<rect width="180" height="${height}" fill="#000000" opacity="0.8" />`;
  }

  /**
   * Generates a calibrated PDF file at true 203 DPI scale
   */
  public generatePdf(label: LabelDefinition): jsPDF {
    const orientation = label.width > label.height ? 'landscape' : 'portrait';
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: [label.width, label.height]
    });

    const rendered = this.renderToSvg(label);
    doc.setProperties({
      title: `${label.name} Thermal Label Reference`,
      creator: 'Durgas Barcode Testing Studio'
    });

    // Add elements
    for (const elem of label.elements) {
      if (elem.type === 'text') {
        doc.setFontSize(elem.fontSizeMm ? elem.fontSizeMm * 2.83 : 9);
        doc.text(elem.value || '', elem.x, elem.y + (elem.fontSizeMm || 2));
      }
    }

    return doc;
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
