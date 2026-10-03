import { LabelPrinter, LabelDefinition, PrinterStatus } from './types';
import { BPLZCompiler } from './BPLZCompiler';
import { QZTransport } from './QZTransport';

/**
 * Concrete implementation of LabelPrinter targeting the TVS LP 46 Neo (203 DPI)
 * Composes BPLZCompiler and QZTransport.
 */
export class TVSLP46Printer implements LabelPrinter {
  public name: string = 'TVS LP 46 Neo';
  private compiler: BPLZCompiler;
  private transport: QZTransport;
  private targetPrinterName: string;

  constructor(targetPrinterName: string = 'TVS LP 46 Neo') {
    this.targetPrinterName = targetPrinterName;
    this.compiler = new BPLZCompiler(203);
    this.transport = new QZTransport();
  }

  public setPrinterName(name: string) {
    this.targetPrinterName = name;
  }

  public async print(label: LabelDefinition, data?: Record<string, any>): Promise<void> {
    // 1. Compile label into raw BPLZ commands
    const bplzCommands = await this.compiler.compile(label, data);

    // 2. Discover available printers if target not explicitly matched
    const printers = await this.transport.findPrinters();
    const matched = printers.find(p => p.toLowerCase().includes('tvs') || p.toLowerCase().includes('lp 46')) 
      || this.targetPrinterName;

    // 3. Send raw commands over transport
    await this.transport.printRaw(matched, bplzCommands);
  }

  /**
   * Directly print a raw ZPL template (such as label.zpl)
   * with dynamically interpolated item name, price, and barcode.
   */
  public async printRawZpl(templateZpl: string, data?: Record<string, any>): Promise<void> {
    const interpolatedZpl = this.compiler.compileZplTemplate(templateZpl, data);

    const printers = await this.transport.findPrinters();
    const matched = printers.find(p => p.toLowerCase().includes('tvs') || p.toLowerCase().includes('lp 46')) 
      || this.targetPrinterName;

    await this.transport.printRaw(matched, interpolatedZpl);
  }

  /**
   * Convenience helper to print dynamic Item Price, Name, and Barcode for an item
   */
  public async printItem(
    item: { name: string; price: number | string; barcode: string; [key: string]: any },
    options: { copies?: number; template?: LabelDefinition } = {}
  ): Promise<void> {
    const template: LabelDefinition = options.template || {
      id: 'durgas_dumbbell_80x12',
      name: 'Durgas Dumbbell 80x12mm',
      width: 80,
      height: 12,
      dpi: 203,
      copies: options.copies || 1,
      elements: [
        {
          id: 'brand',
          type: 'text',
          x: 3.75,
          y: 4.25,
          fontSizeMm: 4.8,
          bold: true,
          value: 'Durgas'
        },
        {
          id: 'name',
          type: 'text',
          x: 52.5,
          y: 1.6,
          fontSizeMm: 3.7,
          width: 11.5,
          height: 3.25,
          textBlock: true,
          value: '{{name}}'
        },
        {
          id: 'price',
          type: 'text',
          x: 66.5,
          y: 1.6,
          fontSizeMm: 3.7,
          width: 12.25,
          height: 3.25,
          textBlock: true,
          bold: true,
          value: '₹{{price}}'
        },
        {
          id: 'qr',
          type: 'qr',
          x: 53.0,
          y: 5.0,
          width: 6.0,
          height: 6.0,
          value: '{{barcode}}'
        },
        {
          id: 'code_text',
          type: 'text',
          x: 60.5,
          y: 6.5,
          fontSizeMm: 2.2,
          bold: true,
          value: '{{barcode}}'
        }
      ]
    };

    if (options.copies) {
      template.copies = options.copies;
    }

    await this.print(template, item);
  }

  public async getStatus(): Promise<PrinterStatus> {
    const isConnected = await this.transport.connect();
    return {
      connected: isConnected,
      printerName: this.targetPrinterName,
      statusMessage: isConnected ? 'Ready' : 'QZ Tray bridge offline',
      isOnline: isConnected,
      hasPaper: true
    };
  }

  public async cancel(): Promise<void> {
    // Soft cancel by sending clear command
    const isConnected = this.transport.isConnected();
    if (isConnected) {
      await this.transport.printRaw(this.targetPrinterName, '~JA'); // Cancel all in ZPL/BPLZ
    }
  }

  public getCompiler(): BPLZCompiler {
    return this.compiler;
  }

  public getTransport(): QZTransport {
    return this.transport;
  }
}
