import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { BPLZCompiler } from '../lib/printer/BPLZCompiler';
import { createDurgas80x12DumbbellLabelDefinition } from '../lib/printer';

describe('Dynamic Label Variables (Price and Item Name)', () => {
  const compiler = new BPLZCompiler(203);

  it('dynamically interpolates item name, price, and barcode in raw label.zpl', () => {
    const labelZplPath = path.resolve(process.cwd(), 'label.zpl');
    const zplTemplate = fs.readFileSync(labelZplPath, 'utf8');

    const itemData = {
      name: 'Diamond Ring 18K',
      price: '45,000',
      barcode: 'DURGAS-99102'
    };

    const compiledZpl = compiler.compileZplTemplate(zplTemplate, itemData);

    // 1. Verify item name is populated dynamically
    expect(compiledZpl).toContain('^FDDiamond Ring 18K^FS');
    expect(compiledZpl).not.toContain('^FN1^FD^FS');

    // 2. Verify item price is populated dynamically
    expect(compiledZpl).toContain('^FD45,000^FS');
    expect(compiledZpl).not.toContain('^FN2^FD^FS');

    // 3. Verify QR code and barcode text are populated dynamically
    expect(compiledZpl).toContain('^FDQA,DURGAS-99102^FS');
    expect(compiledZpl).toContain('^FDDURGAS-99102^FS');

    // 4. Verify static Durgas branding is preserved
    expect(compiledZpl).toContain('^FDDurgas^FS');
  });

  it('handles alias field names (productName, mrp) smoothly', () => {
    const labelZplPath = path.resolve(process.cwd(), 'label.zpl');
    const zplTemplate = fs.readFileSync(labelZplPath, 'utf8');

    const itemData = {
      productName: 'Kanchipuram Silk',
      mrp: 12500,
      sareeCode: 'SK-2001'
    };

    const compiledZpl = compiler.compileZplTemplate(zplTemplate, itemData);

    expect(compiledZpl).toContain('^FDKanchipuram Silk^FS');
    expect(compiledZpl).toContain('12,500');
    expect(compiledZpl).toContain('^FDQA,SK-2001^FS');
    expect(compiledZpl).toContain('^FDSK-2001^FS');
  });

  it('compiles Durgas 80x12mm dumbbell LabelDefinition with dynamic values', async () => {
    const template = createDurgas80x12DumbbellLabelDefinition();
    const itemData = {
      name: 'Gold Necklace 22KT',
      price: '1,20,000',
      barcode: 'NK-8821'
    };

    const zpl = await compiler.compile(template, itemData);

    // Verify label dimensions (80mm is 639-640 dots at 203 DPI, 12mm is 96 dots)
    expect(zpl).toMatch(/\^PW639|\^PW640/);
    expect(zpl).toContain('^LL96');

    // Verify Left Flap has Durgas
    expect(zpl).toContain('^FDDurgas^FS');

    // Verify Right Flap has dynamic Item Name
    expect(zpl).toContain('^FDGold Necklace 22KT^FS');

    // Verify Right Flap has dynamic Price
    expect(zpl).toContain('₹1,20,000');

    // Verify Right Flap has dynamic QR Code and human readable text
    expect(zpl).toContain('^FDQA,NK-8821^FS');
    expect(zpl).toContain('^FDNK-8821^FS');
  });

  it('generates valid QR SVG markup using createQrSvg', async () => {
    const { createQrSvg } = await import('../components/barcode/barcodePrintService');
    const svg = createQrSvg('TEST-QR-12345', 48);

    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0');
    expect(svg).toContain('fill="#000000"');
    expect(svg).toContain('</svg>');
  }, 30000);
});
