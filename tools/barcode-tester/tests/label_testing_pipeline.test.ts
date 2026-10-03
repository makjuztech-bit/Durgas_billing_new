import { describe, it, expect } from 'vitest';
import {
  mmToDots,
  dotsToMm,
  createDimensions,
  createStandard50x35Label,
  createDumbbell80x12Label,
  renderLabelToCanvas,
  renderLabelToSvg,
  renderLabelToPdf,
  generateVerificationArtifacts,
  validateLabel,
  verifyRenderedBarcode,
  compareLabelCanvases,
  generateBplz,
  generateBple,
  analyzePrinterInstructions,
  compareInstructionStreams,
} from '@/lib/label-testing';

describe('Label Testing & Verification Pipeline', () => {
  describe('Canonical Coordinate & Unit Conversion', () => {
    it('converts 50x35 mm to approx 400x280 printer dots at 203 DPI (TVS LP 46 Neo)', () => {
      const widthDots = mmToDots(50, 203);
      const heightDots = mmToDots(35, 203);

      expect(widthDots).toBe(400);
      expect(heightDots).toBe(280);

      expect(dotsToMm(400, 203)).toBeCloseTo(50, 0);
      expect(dotsToMm(280, 203)).toBeCloseTo(35, 0);
    });

    it('converts 80x12 mm dumbbell to 640x96 printer dots at 203 DPI', () => {
      const widthDots = mmToDots(80, 203);
      const heightDots = mmToDots(12, 203);

      expect(widthDots).toBe(640);
      expect(heightDots).toBe(96);
    });

    it('creates dimensions object correctly', () => {
      const dims = createDimensions(50, 35, 203);
      expect(dims.widthMm).toBe(50);
      expect(dims.heightMm).toBe(35);
      expect(dims.dpi).toBe(203);
      expect(dims.widthDots).toBe(400);
      expect(dims.heightDots).toBe(280);
    });
  });

  describe('Label Definition Factories', () => {
    it('creates standard 50x35mm label definition with required elements', () => {
      const label = createStandard50x35Label({
        storeName: 'DURGAS TEST',
        productName: 'SILK SAREE',
        price: 9999,
        barcodeData: '8901234567890',
      });

      expect(label.dimensions.widthDots).toBe(400);
      expect(label.dimensions.heightDots).toBe(280);
      expect(label.elements.length).toBeGreaterThanOrEqual(4);

      const barcode = label.elements.find((e) => e.type === 'barcode');
      expect(barcode).toBeDefined();
      expect(barcode?.type).toBe('barcode');
    });

    it('creates 80x12mm dumbbell label definition with separate flaps', () => {
      const label = createDumbbell80x12Label({
        storeName: 'DURGAS',
        productName: 'GOLD RING',
        price: 15000,
        barcodeData: '9988776655',
      });

      expect(label.dimensions.widthDots).toBe(640);
      expect(label.dimensions.heightDots).toBe(96);

      // Verify barcode is on the right paddle (> 400 dots)
      const barcode = label.elements.find((e) => e.type === 'barcode');
      expect(barcode).toBeDefined();
      expect(barcode?.x).toBeGreaterThan(400);
    });
  });

  describe('Visual Renderer (Canvas, SVG, PDF)', () => {
    it('renders exact 400x280 canvas for 50x35mm label', () => {
      const label = createStandard50x35Label({
        productName: 'TEST PRODUCT',
        price: 499,
        barcodeData: '123456789',
      });

      const canvas = renderLabelToCanvas(label, { enabled: false });
      expect(canvas.width).toBe(400);
      expect(canvas.height).toBe(280);
    });

    it('renders canvas with debug overlay without throwing', () => {
      const label = createStandard50x35Label({});
      const canvas = renderLabelToCanvas(label, {
        enabled: true,
        showGrid: true,
        showBoundingBoxes: true,
        showQuietZones: true,
        showCenterLines: true,
      });

      expect(canvas.width).toBe(400);
      expect(canvas.height).toBe(280);
      const ctx = canvas.getContext('2d');
      expect(ctx).toBeTruthy();
    });

    it('renders clean vector SVG with exact mm and dot dimensions', () => {
      const label = createStandard50x35Label({
        productName: 'KANJEEVARAM SAREE',
        price: 12999,
        barcodeData: '890111222333',
      });

      const svg = renderLabelToSvg(label);
      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('width="50mm"');
      expect(svg).toContain('height="35mm"');
      expect(svg).toContain('viewBox="0 0 400 280"');
      expect(svg).toContain('KANJEEVARAM SAREE');
    });

    it('renders exact 1:1 Vector PDF verification artifact', () => {
      const label = createStandard50x35Label({});
      const pdf = renderLabelToPdf(label);

      expect(pdf.doc).toBeDefined();
      expect(pdf.dataUri).toContain('data:application/pdf');
      expect(pdf.blob.size).toBeGreaterThan(500);
    });

    it('generates all three verification artifacts at once', () => {
      const label = createStandard50x35Label({});
      const result = generateVerificationArtifacts(label);

      expect(result.widthDots).toBe(400);
      expect(result.heightDots).toBe(280);
      expect(result.pngDataUrl).toContain('data:image/png');
      expect(result.svgString).toContain('viewBox="0 0 400 280"');
      expect(result.pdfDataUri).toContain('data:application/pdf');
    });
  });

  describe('Automated Geometry & Compliance Validator (validateLabel)', () => {
    it('passes a standard well-configured 50x35mm label', () => {
      const label = createStandard50x35Label({
        storeName: 'DURGAS',
        productName: 'SILK SAREE',
        price: 8500,
        barcodeData: '8901234567890',
      });

      const report = validateLabel(label);
      expect(report.valid).toBe(true);
      expect(report.errorCount).toBe(0);
      expect(report.summary).toContain('PASSED');
    });

    it('detects boundary clipping when an element exceeds the canvas', () => {
      const label = createStandard50x35Label({});
      // Deliberately push an element outside the 400-dot right boundary
      label.elements.push({
        id: 'overflow-test',
        type: 'text',
        text: 'OVERFLOWING TEXT',
        fontFamily: 'Inter',
        fontSizeDots: 20,
        x: 390,
        y: 100,
        maxWidth: 100, // 390 + 100 = 490 > 400
      });

      const report = validateLabel(label);
      expect(report.valid).toBe(false);
      expect(report.errorCount).toBeGreaterThanOrEqual(1);

      const boundaryError = report.checks.find((c) => c.id === 'boundary-right-overflow-test');
      expect(boundaryError).toBeDefined();
      expect(boundaryError?.dotsExceeded).toBeGreaterThan(0);
      expect(boundaryError?.message).toContain('exceeds right boundary');
    });

    it('fails when barcode quiet zone is insufficient', () => {
      const label = createStandard50x35Label({});
      const barcode = label.elements.find((e) => e.type === 'barcode');
      if (barcode && barcode.type === 'barcode') {
        barcode.quietZoneDots = { left: 2, right: 2, top: 0, bottom: 0 }; // Required is >= 20 dots
      }

      const report = validateLabel(label);
      expect(report.valid).toBe(false);
      const quietError = report.checks.find((c) => c.category === 'quiet-zone');
      expect(quietError).toBeDefined();
      expect(quietError?.status).toBe('fail');
      expect(quietError?.message).toContain('Quiet zone insufficient');
    });

    it('fails when element encroaches into dumbbell zero-print fold bridge', () => {
      const label = createDumbbell80x12Label({});
      // Add text right in the middle bridge (dots 250..350)
      label.elements.push({
        id: 'illegal-bridge-text',
        type: 'text',
        text: 'FOLD VIOLATION',
        fontFamily: 'Inter',
        fontSizeDots: 12,
        x: 300,
        y: 48,
        maxWidth: 80,
      });

      const report = validateLabel(label);
      expect(report.valid).toBe(false);
      const bridgeError = report.checks.find((c) => c.id === 'dumbbell-middle-illegal-bridge-text');
      expect(bridgeError).toBeDefined();
      expect(bridgeError?.status).toBe('fail');
      expect(bridgeError?.message).toContain('zero-print fold area');
    });
  });

  describe('Barcode Verification & Scanline Decode', () => {
    it('verifies rendered Code 128 barcode from canvas scanlines', () => {
      const label = createStandard50x35Label({
        barcodeData: '8901234567890',
        barcodeFormat: 'CODE128',
      });

      const canvas = renderLabelToCanvas(label);
      const barcodeEl = label.elements.find((e) => e.type === 'barcode');
      expect(barcodeEl).toBeDefined();

      if (barcodeEl && barcodeEl.type === 'barcode') {
        const verifyResult = verifyRenderedBarcode(canvas, barcodeEl);
        expect(verifyResult.barsCount).toBeGreaterThan(20);
        expect(verifyResult.quietZoneDetectedDots.left).toBeGreaterThanOrEqual(10);
        expect(verifyResult.verified).toBe(true);
      }
    });
  });

  describe('Visual Regression & Difference Engine (compareLabelCanvases)', () => {
    it('reports identical verdict for identical canvas renders', () => {
      const label = createStandard50x35Label({ barcodeData: '123456' });
      const canvas1 = renderLabelToCanvas(label);
      const canvas2 = renderLabelToCanvas(label);

      const diff = compareLabelCanvases(canvas1, canvas2);
      expect(diff.diffPercentage).toBe(0);
      expect(diff.similarityScore).toBe(100);
      expect(diff.verdict).toBe('identical');
      expect(diff.shiftXdots).toBe(0);
      expect(diff.shiftYdots).toBe(0);
    });

    it('detects layout shift and mismatched pixels between candidate and shifted reference', () => {
      const label1 = createStandard50x35Label({ price: 1000 });
      const label2 = createStandard50x35Label({ price: 9999 }); // Changed price text

      const canvas1 = renderLabelToCanvas(label1);
      const canvas2 = renderLabelToCanvas(label2);

      const diff = compareLabelCanvases(canvas1, canvas2);
      expect(diff.mismatchedPixels).toBeGreaterThan(0);
      expect(diff.diffDataUrl).toContain('data:image/png');
    });
  });

  describe('Printer Command Generators (BPLZ & BPLE)', () => {
    it('generates standard BPLZ (ZPL-II) commands matching 400x280 dot canvas', () => {
      const label = createStandard50x35Label({
        storeName: 'DURGAS JEWELLERS',
        productName: 'GOLD NECKLACE',
        price: 45000,
        barcodeData: '8901234567890',
      });

      const bplz = generateBplz(label);
      expect(bplz.emulation).toBe('BPLZ');
      expect(bplz.rawCommands).toContain('^XA');
      expect(bplz.rawCommands).toContain('^PW400');
      expect(bplz.rawCommands).toContain('^LL280');
      expect(bplz.rawCommands).toContain('^LH0,0');
      expect(bplz.rawCommands).toContain('^BC'); // Code 128
      expect(bplz.rawCommands).toContain('^FD>:8901234567890^FS');
      expect(bplz.rawCommands).toContain('^XZ');
      expect(bplz.totalBytes).toBeGreaterThan(100);
    });

    it('generates standard BPLE (EPL-2) commands for SNBC TVSE LP 46 NEO BPLE', () => {
      const label = createStandard50x35Label({
        storeName: 'DURGAS',
        productName: 'GOLD BRACELET',
        price: 25000,
        barcodeData: '8901234567890',
      });

      const bple = generateBple(label);
      expect(bple.emulation).toBe('BPLE');
      expect(bple.rawCommands).toContain('N\r\n');
      expect(bple.rawCommands).toContain('q400\r\n');
      expect(bple.rawCommands).toContain('Q280,24\r\n');
      expect(bple.rawCommands).toContain('P1\r\n');
      expect(bple.rawCommands).toContain('"8901234567890"');
    });
  });

  describe('Instruction Log & Stream Analyzer', () => {
    it('parses, disassembles, and audits BPLZ instruction stream', () => {
      const sampleBplz = `
        ^XA
        ^PW400
        ^LL280
        ^LH0,0
        ^PR4,4
        ~SD15
        ^FO40,24^A0N,22,18^FDDURGAS JEWELLERS^FS
        ^FO40,112^BY2,3,90^BCN,90,N,N,N^FD>:8901234567890^FS
        ^PQ1,0,1,Y
        ^XZ
      `;

      const audit = analyzePrinterInstructions(sampleBplz);
      expect(audit.valid).toBe(true);
      expect(audit.aspects.emulation).toBe('BPLZ');
      expect(audit.aspects.widthDots).toBe(400);
      expect(audit.aspects.heightDots).toBe(280);
      expect(audit.aspects.speedIps).toBe(4);
      expect(audit.aspects.darkness).toBe(15);
      expect(audit.aspects.barcodes.length).toBe(1);
      expect(audit.aspects.barcodes[0].data).toBe('8901234567890');
      expect(audit.commands.length).toBeGreaterThanOrEqual(8);
    });

    it('detects out-of-bounds coordinates in instruction stream', () => {
      const faultyBplz = `
        ^XA
        ^PW400
        ^LL280
        ^FO450,100^A0N,20,20^FDCLIPPED TEXT^FS
        ^XZ
      `;

      const audit = analyzePrinterInstructions(faultyBplz, 400, 280);
      expect(audit.valid).toBe(false);
      expect(audit.errors.length).toBeGreaterThan(0);
      expect(audit.errors[0]).toContain('outside canvas boundaries');
    });

    it('parses BPLE (EPL-2) instruction stream', () => {
      const sampleBple = `
        N
        q400
        Q280,24
        S4
        D12
        A40,24,0,3,1,1,N,"DURGAS"
        B40,112,0,1,2,4,90,N,"8901234567890"
        P1
      `;

      const audit = analyzePrinterInstructions(sampleBple);
      expect(audit.valid).toBe(true);
      expect(audit.aspects.emulation).toBe('BPLE');
      expect(audit.aspects.widthDots).toBe(400);
      expect(audit.aspects.heightDots).toBe(280);
      expect(audit.aspects.speedIps).toBe(4);
      expect(audit.aspects.darkness).toBe(12);
      expect(audit.aspects.barcodes.length).toBe(1);
    });

    it('compares candidate BPLZ stream with BarTender reference stream', () => {
      const candidateBplz = `
        ^XA
        ^PW400
        ^LL280
        ^PR4
        ~SD15
        ^FO40,112^BY2,3,90^BCN,90,N,N,N^FD>:8901234567890^FS
        ^XZ
      `;

      const referenceBplz = `
        ^XA
        ^PW400
        ^LL280
        ^PR4
        ~SD15
        ^FO40,112^BY2,3,90^BCN,90,N,N,N^FD>:8901234567890^FS
        ^XZ
      `;

      const comp = compareInstructionStreams(candidateBplz, referenceBplz);
      expect(comp.emulationMatch).toBe(true);
      expect(comp.coordinateShifts[0].deltaX).toBe(0);
      expect(comp.coordinateShifts[0].deltaY).toBe(0);
    });
  });
});
