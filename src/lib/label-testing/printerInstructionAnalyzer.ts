/**
 * Printer Instruction Log & Command Stream Analyzer
 * Parses, disassembles, and audits raw printer command streams (BPLZ/ZPL-II, BPLE/EPL-2, TSPL).
 * Compares BarTender PRN captures against generated instructions.
 */

export interface ParsedCommand {
  lineIndex: number;
  raw: string;
  command: string;
  name: string;
  category: 'control' | 'dimension' | 'settings' | 'text' | 'barcode' | 'graphic' | 'separator';
  explanation: string;
  params: Record<string, string | number>;
  status: 'ok' | 'warn' | 'error';
  warningMessage?: string;
}

export interface ExtractedPrintAspects {
  emulation: 'BPLZ' | 'BPLE' | 'TSPL' | 'UNKNOWN';
  widthDots?: number;
  heightDots?: number;
  widthMm?: number;
  heightMm?: number;
  speedIps?: number;
  darkness?: number;
  orientation?: string;
  copies?: number;
  gapDots?: number;
  totalCommands: number;
  fieldCount: number;
  barcodes: Array<{ format: string; data: string; x?: number; y?: number; height?: number }>;
  texts: Array<{ content: string; x?: number; y?: number; fontSize?: number }>;
}

export interface InstructionAuditReport {
  aspects: ExtractedPrintAspects;
  commands: ParsedCommand[];
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface InstructionComparisonResult {
  emulationMatch: boolean;
  aspectDeltas: Array<{ aspect: string; candidate: string | number; reference: string | number; match: boolean }>;
  coordinateShifts: Array<{ item: string; deltaX: number; deltaY: number; note: string }>;
  summary: string;
}

/**
 * Detects the emulation format of the raw instruction stream
 */
export function detectEmulation(raw: string): 'BPLZ' | 'BPLE' | 'TSPL' | 'UNKNOWN' {
  const trimmed = raw.trim();
  if (trimmed.includes('^XA') || trimmed.includes('^LL') || trimmed.includes('^FO')) {
    return 'BPLZ';
  }
  if (
    /^(N|q\d+|Q\d+|A\d+|B\d+|P\d+)/m.test(trimmed) ||
    (trimmed.includes('q') && trimmed.includes('Q') && trimmed.includes('P1'))
  ) {
    return 'BPLE';
  }
  if (trimmed.includes('SIZE') || trimmed.includes('GAP') || trimmed.includes('CLS')) {
    return 'TSPL';
  }
  return 'UNKNOWN';
}

/**
 * Disassembles and analyzes a BPLZ (ZPL-II) instruction stream
 */
export function parseBplzStream(raw: string, targetWidthDots = 400, targetHeightDots = 280): InstructionAuditReport {
  const commands: ParsedCommand[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const aspects: ExtractedPrintAspects = {
    emulation: 'BPLZ',
    totalCommands: 0,
    fieldCount: 0,
    barcodes: [],
    texts: [],
  };

  const hasStartXA = raw.includes('^XA');
  const hasEndXZ = raw.includes('^XZ');

  if (!hasStartXA) {
    errors.push('Missing ^XA (Start of Format). Printer may ignore command stream.');
  }
  if (!hasEndXZ) {
    errors.push('Missing ^XZ (End of Format). Label will not be pushed to thermal head.');
  }

  // Tokenize ZPL commands: prefix (^ or ~), 2-character command code, and parameter arguments
  const regex = /(\^|~)([A-Z]{2}|A[0-9]|B[0-9]|[A-Z])(.*?)(?=(\^|~|$))/gs;
  let match: RegExpExecArray | null;
  let lineIdx = 0;

  let currentX = 0;
  let currentY = 0;
  let currentFontHeight = 20;

  while ((match = regex.exec(raw)) !== null) {
    lineIdx++;
    const prefix = match[1];
    let cmd = match[2];
    let args = (match[3] || '').trim();

    // Normalize BQN -> BQ with orientation arg N
    if (cmd === 'BQN') {
      cmd = 'BQ';
      args = args ? `N,${args}` : 'N';
    } else if (cmd === 'BCN') {
      cmd = 'BC';
      args = args ? `N,${args}` : 'N';
    } else if (cmd === 'BEN') {
      cmd = 'BE';
      args = args ? `N,${args}` : 'N';
    }

    const fullCmd = `${prefix}${cmd}${args}`;

    let parsed: ParsedCommand = {
      lineIndex: lineIdx,
      raw: fullCmd,
      command: `${prefix}${cmd}`,
      name: 'Command',
      category: 'control',
      explanation: '',
      params: {},
      status: 'ok',
    };

    switch (cmd) {
      case 'XA':
        parsed.name = 'Start Format';
        parsed.category = 'control';
        parsed.explanation = 'Begins a new label format block in the printer buffer.';
        break;

      case 'XZ':
        parsed.name = 'End Format';
        parsed.category = 'control';
        parsed.explanation = 'Terminates the label format block and commits raster buffer to print.';
        break;

      case 'PW': {
        const pw = parseInt(args, 10);
        parsed.name = 'Print Width';
        parsed.category = 'dimension';
        parsed.params = { widthDots: pw };
        aspects.widthDots = pw;
        aspects.widthMm = Number(((pw * 25.4) / 203).toFixed(1));
        parsed.explanation = `Sets printable label width to ${pw} dots (~${aspects.widthMm} mm @ 203 DPI).`;
        if (pw > targetWidthDots + 20) {
          parsed.status = 'warn';
          parsed.warningMessage = `Print width (${pw}) exceeds target label width (${targetWidthDots}). Content may clip.`;
          warnings.push(parsed.warningMessage);
        }
        break;
      }

      case 'LL': {
        const ll = parseInt(args, 10);
        parsed.name = 'Label Length';
        parsed.category = 'dimension';
        parsed.params = { heightDots: ll };
        aspects.heightDots = ll;
        aspects.heightMm = Number(((ll * 25.4) / 203).toFixed(1));
        parsed.explanation = `Sets label feed length to ${ll} dots (~${aspects.heightMm} mm @ 203 DPI).`;
        if (ll > targetHeightDots + 20) {
          parsed.status = 'warn';
          parsed.warningMessage = `Label length (${ll}) exceeds target label height (${targetHeightDots}).`;
          warnings.push(parsed.warningMessage);
        }
        break;
      }

      case 'LH': {
        const [x, y] = args.split(',').map((v) => parseInt(v, 10));
        parsed.name = 'Label Home Origin';
        parsed.category = 'dimension';
        parsed.params = { originX: x || 0, originY: y || 0 };
        parsed.explanation = `Sets physical reference origin to (${x || 0}, ${y || 0}) dots from top-left.`;
        break;
      }

      case 'PR': {
        const [printSpd, slewSpd] = args.split(',').map((v) => parseInt(v, 10));
        parsed.name = 'Print Speed';
        parsed.category = 'settings';
        parsed.params = { speedIps: printSpd };
        aspects.speedIps = printSpd;
        parsed.explanation = `Sets print feed speed to ${printSpd} inches/second (slew: ${slewSpd || printSpd} ips).`;
        if (printSpd > 5) {
          parsed.status = 'warn';
          parsed.warningMessage = `Print speed ${printSpd} ips is high for TVS LP 46 Neo. Recommended speed for fine barcodes is 3-4 ips.`;
          warnings.push(parsed.warningMessage);
        }
        break;
      }

      case 'SD': {
        const sd = parseInt(args, 10);
        parsed.name = 'Set Darkness (Density)';
        parsed.category = 'settings';
        parsed.params = { darkness: sd };
        aspects.darkness = sd;
        parsed.explanation = `Adjusts thermal head burn temperature to ${sd} (0-30 scale).`;
        break;
      }

      case 'FO': {
        const [x, y] = args.split(',').map((v) => parseInt(v, 10));
        currentX = x || 0;
        currentY = y || 0;
        parsed.name = 'Field Origin';
        parsed.category = 'dimension';
        parsed.params = { x: currentX, y: currentY };
        parsed.explanation = `Sets top-left coordinate for next field to (${currentX}, ${currentY}) dots.`;
        aspects.fieldCount++;

        const maxW = aspects.widthDots || targetWidthDots;
        const maxH = aspects.heightDots || targetHeightDots;
        if (currentX < 0 || currentX >= maxW || currentY < 0 || currentY >= maxH) {
          parsed.status = 'error';
          parsed.warningMessage = `Field origin (${currentX}, ${currentY}) is outside canvas boundaries (${maxW} x ${maxH}).`;
          errors.push(parsed.warningMessage);
        }
        break;
      }

      case 'A0': {
        const parts = args.split(',');
        const rot = parts[0] || 'N';
        const h = parseInt(parts[1] || '20', 10);
        const w = parseInt(parts[2] || '20', 10);
        currentFontHeight = h;
        parsed.name = 'Standard Scalable Font';
        parsed.category = 'text';
        parsed.params = { orientation: rot, height: h, width: w };
        parsed.explanation = `Selects Font 0, size ${h}x${w} dots, rotation ${rot}.`;
        break;
      }

      case 'BC': {
        const parts = args.split(',');
        const h = parseInt(parts[1] || '50', 10);
        parsed.name = 'Code 128 Barcode';
        parsed.category = 'barcode';
        parsed.params = { height: h, interpretation: parts[2] || 'N' };
        parsed.explanation = `Configures Code 128 barcode with height ${h} dots.`;
        break;
      }

      case 'BE': {
        const parts = args.split(',');
        const h = parseInt(parts[1] || '50', 10);
        parsed.name = 'EAN-13 Barcode';
        parsed.category = 'barcode';
        parsed.params = { height: h };
        parsed.explanation = `Configures EAN-13 barcode with height ${h} dots.`;
        break;
      }

      case 'BQ': {
        parsed.name = 'QR Code';
        parsed.category = 'barcode';
        parsed.explanation = `Configures QR code matrix 2D symbology.`;
        break;
      }

      case 'FD': {
        const data = args;
        parsed.name = 'Field Data';
        parsed.category = 'text';
        parsed.params = { data };
        parsed.explanation = `Supplies field content payload: "${data}".`;

        if (data.startsWith('>:') || data.startsWith('>5')) {
          aspects.barcodes.push({ format: 'CODE128', data: data.replace(/^>[A-Z0-9]:?/, ''), x: currentX, y: currentY });
        } else if (data.startsWith('MA,')) {
          aspects.barcodes.push({ format: 'QR', data: data.replace(/^MA,/, ''), x: currentX, y: currentY });
        } else {
          aspects.texts.push({ content: data, x: currentX, y: currentY, fontSize: currentFontHeight });
        }
        break;
      }

      case 'FS':
        parsed.name = 'Field Separator';
        parsed.category = 'separator';
        parsed.explanation = 'Concludes current field definition.';
        break;

      case 'PQ': {
        const q = parseInt(args.split(',')[0] || '1', 10);
        parsed.name = 'Print Quantity';
        parsed.category = 'control';
        parsed.params = { copies: q };
        aspects.copies = q;
        parsed.explanation = `Instructs printer to feed and cut ${q} label(s).`;
        break;
      }

      default:
        parsed.name = `ZPL ^${cmd}`;
        parsed.explanation = `ZPL command with argument "${args}".`;
        break;
    }

    commands.push(parsed);
  }

  aspects.totalCommands = commands.length;
  const valid = errors.length === 0;

  const summary = valid
    ? `BPLZ Audit Passed: ${commands.length} commands parsed. Label size: ${aspects.widthDots || targetWidthDots}x${aspects.heightDots || targetHeightDots} dots. Speed: ${aspects.speedIps || 4} ips, Darkness: ${aspects.darkness || 15}.`
    : `BPLZ Audit FAILED: ${errors.length} fatal error(s) detected. Fix field coordinates or format wrappers.`;

  return {
    aspects,
    commands,
    valid,
    errors,
    warnings,
    summary,
  };
}

/**
 * Disassembles and analyzes a BPLE (EPL-2) instruction stream
 */
export function parseBpleStream(raw: string, targetWidthDots = 400, targetHeightDots = 280): InstructionAuditReport {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const commands: ParsedCommand[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const aspects: ExtractedPrintAspects = {
    emulation: 'BPLE',
    totalCommands: lines.length,
    fieldCount: 0,
    barcodes: [],
    texts: [],
  };

  let hasClearBuffer = false;
  let hasPrintP = false;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const cmdChar = line[0];
    const args = line.slice(1);

    const parsed: ParsedCommand = {
      lineIndex: idx + 1,
      raw: line,
      command: cmdChar,
      name: 'Command',
      category: 'control',
      explanation: '',
      params: {},
      status: 'ok',
    };

    switch (cmdChar) {
      case 'N':
        hasClearBuffer = true;
        parsed.name = 'Clear Buffer';
        parsed.category = 'control';
        parsed.explanation = 'Clears the printer image memory buffer for a clean label layout.';
        break;

      case 'q': {
        const w = parseInt(args, 10);
        aspects.widthDots = w;
        aspects.widthMm = Number(((w * 25.4) / 203).toFixed(1));
        parsed.name = 'Set Label Width';
        parsed.category = 'dimension';
        parsed.params = { widthDots: w };
        parsed.explanation = `Sets label printable width to ${w} dots (~${aspects.widthMm} mm).`;
        break;
      }

      case 'Q': {
        const [h, gap] = args.split(',').map((v) => parseInt(v, 10));
        aspects.heightDots = h;
        aspects.heightMm = Number(((h * 25.4) / 203).toFixed(1));
        aspects.gapDots = gap || 24;
        parsed.name = 'Set Label Length & Gap';
        parsed.category = 'dimension';
        parsed.params = { heightDots: h, gapDots: gap || 24 };
        parsed.explanation = `Sets label length to ${h} dots (~${aspects.heightMm} mm) and inter-label gap to ${gap || 24} dots (~3mm).`;
        break;
      }

      case 'S': {
        const spd = parseInt(args, 10);
        aspects.speedIps = spd;
        parsed.name = 'Print Speed';
        parsed.category = 'settings';
        parsed.params = { speedIps: spd };
        parsed.explanation = `Sets EPL print speed to index ${spd} (1-5 scale).`;
        break;
      }

      case 'D': {
        const d = parseInt(args, 10);
        aspects.darkness = d;
        parsed.name = 'Set Darkness (Density)';
        parsed.category = 'settings';
        parsed.params = { darkness: d };
        parsed.explanation = `Sets burn temperature darkness to ${d} (0-15 scale).`;
        break;
      }

      case 'A': {
        aspects.fieldCount++;
        // Syntax: A x,y,rotation,font,h_mult,v_mult,reverse,"text"
        const match = line.match(/^A(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),([NE]),"?(.*?)"?$/);
        if (match) {
          const x = parseInt(match[1], 10);
          const y = parseInt(match[2], 10);
          const font = parseInt(match[4], 10);
          const text = match[8];
          parsed.name = 'ASCII Text';
          parsed.category = 'text';
          parsed.params = { x, y, font, text };
          parsed.explanation = `Prints text "${text}" at (${x}, ${y}) with EPL Font ${font}.`;
          aspects.texts.push({ content: text, x, y, fontSize: font * 8 });

          if (x > (aspects.widthDots || targetWidthDots) || y > (aspects.heightDots || targetHeightDots)) {
            parsed.status = 'error';
            parsed.warningMessage = `Text at (${x}, ${y}) exceeds label bounds.`;
            errors.push(parsed.warningMessage);
          }
        }
        break;
      }

      case 'B': {
        aspects.fieldCount++;
        // Syntax: B x,y,rotation,type,narrow,wide,height,human_readable,"code"
        const match = line.match(/^B(\d+),(\d+),(\d+),([A-Za-z0-9]+),(\d+),(\d+),(\d+),([BN]),"?(.*?)"?$/);
        if (match) {
          const x = parseInt(match[1], 10);
          const y = parseInt(match[2], 10);
          const format = match[4];
          const height = parseInt(match[7], 10);
          const code = match[9];
          parsed.name = '1D Barcode';
          parsed.category = 'barcode';
          parsed.params = { x, y, format, height, code };
          parsed.explanation = `Prints barcode "${code}" (${format}) at (${x}, ${y}) with height ${height} dots.`;
          aspects.barcodes.push({ format, data: code, x, y, height });

          if (x > (aspects.widthDots || targetWidthDots) || y > (aspects.heightDots || targetHeightDots)) {
            parsed.status = 'error';
            parsed.warningMessage = `Barcode at (${x}, ${y}) exceeds label bounds.`;
            errors.push(parsed.warningMessage);
          }
        }
        break;
      }

      case 'P': {
        hasPrintP = true;
        const count = parseInt(args, 10) || 1;
        aspects.copies = count;
        parsed.name = 'Print & Feed';
        parsed.category = 'control';
        parsed.params = { copies: count };
        parsed.explanation = `Executes print operation for ${count} label(s).`;
        break;
      }

      default:
        parsed.name = `EPL Command ${cmdChar}`;
        parsed.explanation = `EPL command with parameters "${args}".`;
        break;
    }

    commands.push(parsed);
  }

  if (!hasClearBuffer) {
    warnings.push('Missing "N" command at start to clear previous label buffer.');
  }
  if (!hasPrintP) {
    errors.push('Missing "P1" command at end. Printer will not output label.');
  }

  const valid = errors.length === 0;
  const summary = valid
    ? `BPLE Audit Passed: ${lines.length} lines parsed. Dimensions: ${aspects.widthDots || targetWidthDots}x${aspects.heightDots || targetHeightDots} dots.`
    : `BPLE Audit FAILED: ${errors.length} fatal error(s) detected.`;

  return {
    aspects,
    commands,
    valid,
    errors,
    warnings,
    summary,
  };
}

/**
 * Universal Analyzer: Disassembles either BPLZ or BPLE raw streams
 */
export function analyzePrinterInstructions(raw: string, targetWidthDots = 400, targetHeightDots = 280): InstructionAuditReport {
  const emulation = detectEmulation(raw);
  if (emulation === 'BPLE') {
    return parseBpleStream(raw, targetWidthDots, targetHeightDots);
  }
  return parseBplzStream(raw, targetWidthDots, targetHeightDots);
}

/**
 * Compares two instruction streams (e.g. Candidate BPLZ vs BarTender Captured PRN)
 */
export function compareInstructionStreams(candidateRaw: string, referenceRaw: string): InstructionComparisonResult {
  const cand = analyzePrinterInstructions(candidateRaw);
  const ref = analyzePrinterInstructions(referenceRaw);

  const emulationMatch = cand.aspects.emulation === ref.aspects.emulation;
  const aspectDeltas: Array<{ aspect: string; candidate: string | number; reference: string | number; match: boolean }> = [];

  const addAspect = (name: string, cVal: string | number | undefined, rVal: string | number | undefined) => {
    const c = cVal ?? 'N/A';
    const r = rVal ?? 'N/A';
    aspectDeltas.push({ aspect: name, candidate: c, reference: r, match: c === r });
  };

  addAspect('Emulation Language', cand.aspects.emulation, ref.aspects.emulation);
  addAspect('Width (dots)', cand.aspects.widthDots, ref.aspects.widthDots);
  addAspect('Height (dots)', cand.aspects.heightDots, ref.aspects.heightDots);
  addAspect('Print Speed (ips)', cand.aspects.speedIps, ref.aspects.speedIps);
  addAspect('Darkness / Density', cand.aspects.darkness, ref.aspects.darkness);
  addAspect('Copies', cand.aspects.copies, ref.aspects.copies);
  addAspect('Field Count', cand.aspects.fieldCount, ref.aspects.fieldCount);

  // Compare coordinates of first barcode
  const coordinateShifts: Array<{ item: string; deltaX: number; deltaY: number; note: string }> = [];
  if (cand.aspects.barcodes.length > 0 && ref.aspects.barcodes.length > 0) {
    const cb = cand.aspects.barcodes[0];
    const rb = ref.aspects.barcodes[0];
    const dX = (cb.x || 0) - (rb.x || 0);
    const dY = (cb.y || 0) - (rb.y || 0);
    coordinateShifts.push({
      item: 'Barcode Position',
      deltaX: dX,
      deltaY: dY,
      note: dX === 0 && dY === 0 ? 'Exact match' : `Candidate is shifted by (${dX > 0 ? '+' : ''}${dX}, ${dY > 0 ? '+' : ''}${dY}) dots from BarTender`,
    });
  }

  const matchesCount = aspectDeltas.filter((a) => a.match).length;
  const summary = `Compared ${aspectDeltas.length} printer aspects: ${matchesCount} match, ${aspectDeltas.length - matchesCount} differ.`;

  return {
    emulationMatch,
    aspectDeltas,
    coordinateShifts,
    summary,
  };
}

/**
 * Technical Documentation: How to Capture PRN / Spool Logs from Windows and BarTender
 */
export const PRINTER_CAPTURE_GUIDE = `
### How to Find Label Aspects & Capture Instructions Sent to the TVS Printer

Thermal label printers (like TVS LP 46 Neo / SNBC) do not receive standard PDF/raster graphics. They receive raw printer commands (BPLZ / ZPL-II or BPLE / EPL-2). Here are the 4 best methods to capture the exact instructions:

---

#### Method 1: BarTender "Print to File" (.prn) [Recommended & Fastest]
1. Open your label template in **BarTender** (e.g. Document1.btw).
2. Go to **File -> Print** (Ctrl+P).
3. In the Print dialog, check the **"Print to file"** checkbox next to the printer name.
4. Click **Print**. A "Save As" file prompt will appear.
5. Save the file as \`bartender_capture.prn\`.
6. Open this file in Notepad or VS Code: you will see the exact ASCII commands (e.g. \`^XA...^XZ\` or \`N...P1\`) that BarTender sends to the TVS printer.
7. Paste those commands into this analyzer to immediately compare with your JS renderer!

---

#### Method 2: Seagull Scientific Driver Command Logging
If you installed the Seagull Scientific driver for TVS LP 46 Neo / SNBC:
1. In Windows, open **Settings -> Bluetooth & devices -> Printers & scanners**.
2. Click **SNBC TVSE LP 46 NEO BPLE** -> **Printer Properties**.
3. Go to the **Tools** tab.
4. Click **Logging Options...**.
5. Enable **"Log Printer Commands"** (Port Logging).
6. Specify a log destination (e.g. \`C:\\printers\\tvs_commands.log\`).
7. Every print job sent through BarTender or any software will append the full command stream with timestamps to this file.

---

#### Method 3: Windows Spooler RAW (.SPL) File Capture
Windows spooler stores raw printer jobs before sending them to USB:
1. Go to **Printer Properties -> Advanced** tab.
2. Check the box **"Keep printed documents"**.
3. Ensure **"Spool print documents so program finishes printing faster"** is selected.
4. Print a test label.
5. Open File Explorer to: \`C:\\Windows\\System32\\spool\\PRINTERS\\\`.
6. Look for the newest \`*.SPL\` file (e.g. \`00004.SPL\`).
7. Open the \`*.SPL\` file in a text editor to view the raw byte stream sent over USB.

---

#### Method 4: TVS LP 46 Neo Emulation Switching (BPLZ vs BPLE)
* The TVS LP 46 Neo supports both **BPLZ (ZPL emulation)** and **BPLE (EPL emulation)**.
* Check your Seagull driver name:
  * If the driver says **"SNBC TVSE LP 46 NEO BPLE"**, it uses **BPLE (EPL commands: N, q, Q, A, B, P1)**.
  * If the driver says **"SNBC TVSE LP 46 NEO BPLZ"**, it uses **BPLZ (ZPL commands: ^XA, ^PW, ^LL, ^FO, ^BC, ^XZ)**.
* You can switch your software generator to match the active driver emulation without changing printer DIP switches.
`;
