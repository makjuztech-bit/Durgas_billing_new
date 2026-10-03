import { LabelDefinition, LabelElement } from './types';

/**
 * TVS LP 46 Neo / BPLZ (ZPL-compatible) Compiler
 * Converts mm coordinates to 203 DPI printer dots and produces raw command byte streams.
 *
 * 203 DPI Resolution:
 * 1 inch = 25.4 mm = 203 dots
 * dots = Math.round(mm * 203 / 25.4)
 * 1 mm ≈ 7.992 dots (~8 dots/mm)
 */
export class BPLZCompiler {
  private dpi: number;

  constructor(dpi: number = 203) {
    this.dpi = dpi;
  }

  public mmToDots(mm: number): number {
    return Math.round((mm * this.dpi) / 25.4);
  }

  public dotsToMm(dots: number): number {
    return Number(((dots * 25.4) / this.dpi).toFixed(2));
  }

  /**
   * Normalizes runtime data ensuring common alias fields (name, productName, price, mrp, barcode)
   * are dynamically and cleanly resolved.
   */
  public normalizeData(data?: Record<string, any>): Record<string, any> {
    if (!data) return {};
    const name = data.name ?? data.productName ?? data.itemName ?? data.title ?? '';
    const rawPrice = data.price ?? data.mrp ?? data.sellingPrice ?? '';
    const numericPrice = typeof rawPrice === 'number' ? rawPrice : String(rawPrice).replace(/[^\d.]/g, '');
    const formattedPrice = numericPrice ? Number(numericPrice).toLocaleString('en-IN') : String(rawPrice);
    const priceDisplay = String(rawPrice).startsWith('₹') ? String(rawPrice) : formattedPrice;
    const barcode = data.barcode ?? data.sareeCode ?? data.sku ?? data.code ?? '';
    const storeName = data.storeName ?? data.shopName ?? 'DURGAS';

    return {
      ...data,
      name,
      productName: name,
      itemName: name,
      title: name,
      price: priceDisplay,
      rawPrice: numericPrice,
      mrp: data.mrp ?? priceDisplay,
      sellingPrice: data.sellingPrice ?? priceDisplay,
      barcode,
      sku: data.sku ?? barcode,
      code: barcode,
      storeName,
      shopName: storeName
    };
  }

  /**
   * Interpolates template string values with product/runtime data
   * e.g. "Price: ₹{{price}}" -> "Price: ₹5,000"
   * e.g. "{{name}}" -> "Gold Stud 22KT"
   */
  public interpolate(template: string, data?: Record<string, any>): string {
    if (!template) return '';
    const norm = this.normalizeData(data);
    return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
      const val = norm[key];
      return val !== undefined && val !== null ? String(val) : '';
    });
  }

  /**
   * Compiles and interpolates a raw ZPL template (such as label.zpl)
   * dynamically populating:
   * 1. {{name}} / {{productName}} -> item name
   * 2. {{price}} / {{mrp}} -> item price
   * 3. {{barcode}} -> barcode value
   * 4. Zebra Field Number tags (^FN1 -> name, ^FN2 -> price)
   * 5. Fallback for unpopulated ^FD^FS fields in barcodes and text boxes.
   */
  public compileZplTemplate(templateZpl: string, data?: Record<string, any>): string {
    const norm = this.normalizeData(data);
    let result = templateZpl;

    // 1. Interpolate mustache placeholders like {{name}}, {{price}}, {{barcode}}
    result = this.interpolate(result, norm);

    // 2. If template still has ^FN1 and ^FN2 tags with empty ^FD^FS, dynamically populate them
    if (norm.name) {
      result = result.replace(/\^FN1\^FD\s*\^FS/g, `^FN1^FD${this.sanitizeZpl(norm.name)}^FS`);
    }
    if (norm.price) {
      result = result.replace(/\^FN2\^FD\s*\^FS/g, `^FN2^FD${this.sanitizeZpl(norm.price)}^FS`);
    }

    // 3. If there are consecutive ^FN1 tags (legacy label.zpl had two ^FN1s: first=name, second=price)
    let fn1Count = 0;
    result = result.replace(/\^FN1\^FD\s*\^FS/g, () => {
      fn1Count++;
      return fn1Count === 1 
        ? `^FN1^FD${this.sanitizeZpl(norm.name)}^FS` 
        : `^FN2^FD${this.sanitizeZpl(norm.price)}^FS`;
    });

    // 4. If barcode has empty ^FD^FS, dynamically insert Code 128 auto barcode
    if (norm.barcode) {
      result = result.replace(/(\^BC[^\^]*)\^FD\s*\^FS/g, `$1^FD>:${this.sanitizeZpl(norm.barcode)}^FS`);
      // 5. If QR code has empty ^FD^FS, dynamically insert QR code
      result = result.replace(/(\^BQ[^\^]*)\^FD\s*\^FS/g, `$1^FDQA,${this.sanitizeZpl(norm.barcode)}^FS`);
    }

    return result;
  }

  /**
   * Compiles a high-level LabelDefinition into raw BPLZ / ZPL commands.
   */
  public async compile(label: LabelDefinition, data?: Record<string, any>): Promise<string> {
    const norm = this.normalizeData(data);
    const widthDots = this.mmToDots(label.width);
    const heightDots = this.mmToDots(label.height);
    const copies = label.copies || 1;

    const commands: string[] = [];

    let renderWidthDots = widthDots;
    let renderHeightDots = heightDots;
    
    if (label.printRotation === 90 || label.printRotation === 270) {
      renderWidthDots = heightDots;
      renderHeightDots = widthDots;
    }

    commands.push('^XA');
    commands.push(`^PW${renderWidthDots}`);
    commands.push(`^LL${renderHeightDots}`);
    commands.push('^LH0,0');
    
    if (label.printRotation === 180) {
      commands.push('^POI');
    } else {
      commands.push('^PON');
    }
    
    commands.push('^PR4,4'); // Recommended 4 ips print rate for high edge sharpness
    commands.push('~SD20');  // Darkness setting (range 00-30)

    for (const elem of label.elements) {
      let x = Math.max(0, this.mmToDots(elem.x));
      let y = Math.max(0, this.mmToDots(elem.y));
      let rotDeg = elem.rotation || 0;

      if (label.printRotation === 90) {
         const temp = x;
         x = renderWidthDots - y - (elem.width ? this.mmToDots(elem.width) : 0);
         y = temp;
         rotDeg = (rotDeg + 90) % 360;
      } else if (label.printRotation === 270) {
         const temp = x;
         x = y;
         y = renderHeightDots - temp - (elem.height ? this.mmToDots(elem.height) : 0);
         rotDeg = (rotDeg + 270) % 360;
      }

      const rot = this.getBplzRotation(rotDeg);

      if (elem.type === 'text') {
        const text = this.interpolate(elem.value || '', norm);
        const fontHeightDots = elem.fontSizeMm ? Math.max(12, this.mmToDots(elem.fontSizeMm)) : 22;
        const fontWidthDots = Math.round(fontHeightDots * 0.85);

        // Support ZPL ^TB (Text Block) if block bounds are specified (matches label.zpl ^TB spec)
        if (elem.textBlock || elem.maxWidthMm || (elem.width && elem.height)) {
          const tbW = elem.maxWidthMm ? this.mmToDots(elem.maxWidthMm) : (elem.width ? this.mmToDots(elem.width) : 0);
          const tbH = elem.maxHeightMm ? this.mmToDots(elem.maxHeightMm) : (elem.height ? this.mmToDots(elem.height) : 0);
          if (tbW > 0 && tbH > 0) {
            commands.push(`^FO${x},${y}`);
            commands.push(`^A0${rot},${fontHeightDots},${fontWidthDots}`);
            commands.push(`^TB${rot},${tbW},${tbH}`);
            commands.push(`^FD${this.sanitizeZpl(text)}^FS`);
            continue;
          }
        }

        commands.push(`^FO${x},${y}`);
        commands.push(`^A0${rot},${fontHeightDots},${fontWidthDots}`);
        commands.push(`^FD${this.sanitizeZpl(text)}^FS`);
      } else if (elem.type === 'barcode') {
        const rawCode = this.interpolate(elem.value || '', norm).trim();
        const heightDots = elem.height ? this.mmToDots(elem.height) : 60;
        // Strictly at least 2 dots module width for reliable 203 DPI laser scanning
        const moduleWidth = Math.max(2, elem.moduleWidthDots || (elem.width ? Math.round(this.mmToDots(elem.width) / 100) : 2));
        
        commands.push(`^BY${moduleWidth},3.0,${heightDots}`);
        commands.push(`^FO${x},${y}`);

        if (elem.format === 'EAN13' && /^\d{12,13}$/.test(rawCode)) {
          const eanCode = rawCode.slice(0, 13).padStart(13, '0');
          commands.push(`^BE${rot},${heightDots},${elem.displayValue ? 'Y' : 'N'},N`);
          commands.push(`^FD${eanCode}^FS`);
        } else {
          // Standard Code 128 Auto
          commands.push(`^BC${rot},${heightDots},${elem.displayValue ? 'Y' : 'N'},N,N,N`);
          // Using >: invocation for Code 128 Subset B/C auto selection
          commands.push(`^FD>:${this.sanitizeZpl(rawCode)}^FS`);
        }
      } else if (elem.type === 'qr') {
        const qrData = this.interpolate(elem.value || '', norm).trim();
        const mag = Math.max(2, Math.min(10, Math.round((elem.width ? this.mmToDots(elem.width) : 48) / 24)));
        commands.push(`^FO${x},${y}`);
        commands.push(`^BQ${rot},2,${mag}`);
        commands.push(`^FDQA,${this.sanitizeZpl(qrData)}^FS`);
      } else if (elem.type === 'shape' && elem.shape === 'line') {
        const wDots = elem.width ? this.mmToDots(elem.width) : widthDots;
        const thickness = elem.lineWidthMm ? Math.max(1, this.mmToDots(elem.lineWidthMm)) : 2;
        commands.push(`^FO${x},${y}`);
        commands.push(`^GB${wDots},${thickness},${thickness}^FS`);
      } else if (elem.type === 'image' && elem.dataUrl) {
        // Image Processing for Browser Environments using Canvas
        try {
          const { hexString, byteWidth, imgHeight } = await this.convertImageToZPLHex(elem.dataUrl, elem.width ? this.mmToDots(elem.width) : undefined, elem.height ? this.mmToDots(elem.height) : undefined);
          if (hexString) {
             commands.push(`^FO${x},${y}`);
             const totalBytes = byteWidth * imgHeight;
             commands.push(`^GFA,${totalBytes},${totalBytes},${byteWidth},${hexString}^FS`);
          }
        } catch (err) {
          console.error("Failed to convert image for ZPL", err);
        }
      }
    }

    if (copies > 1) {
      commands.push(`^PQ${copies}`);
    }

    commands.push('^XZ');
    return commands.join('\n');
  }

  private getBplzRotation(deg?: number): 'N' | 'R' | 'I' | 'B' {
    switch (deg) {
      case 90: return 'R';
      case 180: return 'I';
      case 270: return 'B';
      default: return 'N';
    }
  }

  private sanitizeZpl(val: string): string {
    return (val || '').replace(/[\^~]/g, '');
  }

  /**
   * Converts a base64 DataURL (or image URL) to ZPL hex graphic string using HTML Canvas.
   * Note: This strictly relies on the browser DOM (Canvas API).
   */
  private async convertImageToZPLHex(dataUrl: string, targetWidthDots?: number, targetHeightDots?: number): Promise<{ hexString: string, byteWidth: number, imgHeight: number }> {
    if (typeof document === 'undefined') {
      throw new Error("convertImageToZPLHex requires a browser environment (DOM Canvas).");
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        let width = targetWidthDots || img.width;
        let height = targetHeightDots || img.height;
        
        // ZPL requires byte width to be a multiple of 8
        const byteWidth = Math.ceil(width / 8);
        width = byteWidth * 8; 
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("No 2d context");

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        let hexString = '';
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < byteWidth; x++) {
            let byte = 0;
            for (let bit = 0; bit < 8; bit++) {
              const pxX = x * 8 + bit;
              if (pxX < width) {
                const idx = (y * width + pxX) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3];
                
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                // If pixel is dark and opaque, make it black (1 in ZPL)
                if (a > 128 && gray < 128) {
                  byte |= (1 << (7 - bit));
                }
              }
            }
            hexString += byte.toString(16).padStart(2, '0').toUpperCase();
          }
          hexString += '\n';
        }
        
        resolve({ hexString, byteWidth, imgHeight: height });
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }
}
