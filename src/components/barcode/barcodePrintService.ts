import React from 'react';
import { renderToString } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';
import { Saree } from '@/types';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import { LOGO_EMBLEM_BASE64 } from './logoEmblemBase64';

export function createQrSvg(code: string, size: number = 64): string {
  try {
    const cleanCode = (code || '').trim();
    if (!cleanCode) {
      return `<div style="font-family: monospace; font-size: 7px; font-weight: bold; text-align: center;">EMPTY</div>`;
    }
    return renderToString(
      React.createElement(QRCodeSVG, {
        value: cleanCode,
        size: size,
        level: 'H',
        includeMargin: true,
      })
    );
  } catch (err) {
    console.error('Failed to create QR SVG:', err);
    return `<div style="font-family: monospace; font-size: 7px; font-weight: bold; text-align: center;">${code}</div>`;
  }
}

export function createQrDataUrl(code: string, pixelSize: number = 180): string {
  try {
    const cleanCode = (code || '').trim();
    if (!cleanCode || typeof document === 'undefined') return '';
    const svgStr = createQrSvg(cleanCode, pixelSize);
    const vbMatch = svgStr.match(/viewBox="0 0 (\d+) (\d+)"/);
    const modules = vbMatch ? parseInt(vbMatch[1], 10) : 21;
    const dMatch = svgStr.match(/fill="#000000"\s+d="([^"]+)"/);
    const pathD = dMatch ? dMatch[1] : '';

    const canvas = document.createElement('canvas');
    canvas.width = pixelSize;
    canvas.height = pixelSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pixelSize, pixelSize);

    if (pathD && typeof Path2D !== 'undefined') {
      ctx.fillStyle = '#000000';
      const scale = pixelSize / modules;
      ctx.save();
      ctx.scale(scale, scale);
      const path = new Path2D(pathD);
      ctx.fill(path);
      ctx.restore();
    }

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Error generating QR data URL:', err);
    return '';
  }
}

export function createBarcodeSvg(
  code: string,
  height: number = 24,
  barWidth: number = 1.15
): string {
  try {
    const cleanCode = (code || '').trim();
    if (!cleanCode) {
      return `<div style="font-family: monospace; font-size: 7px; font-weight: bold; text-align: center;">EMPTY</div>`;
    }

    // Auto-detect format: Valid 13-digit EAN -> EAN13, otherwise standard CODE128
    const isEan13 = /^\d{13}$/.test(cleanCode);
    const format = isEan13 ? 'EAN13' : 'CODE128';

    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svgNode, cleanCode, {
      format: format,
      displayValue: false,
      margin: 0,
      marginLeft: 4,
      marginRight: 4,
      marginTop: 0,
      marginBottom: 0,
      height: height,
      width: Math.max(1.0, barWidth),
      background: '#ffffff',
      lineColor: '#000000',
      flat: true,
    });
    const w = svgNode.getAttribute('width') || '120';
    const h = svgNode.getAttribute('height') || String(height);
    svgNode.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svgNode.removeAttribute('width');
    svgNode.removeAttribute('height');
    // Maintain strict aspect ratio to prevent optical distortion and bar width unevenness
    svgNode.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgNode.setAttribute('style', 'width: 100%; height: 100%; max-height: 100%; display: block; margin: 0 auto;');
    svgNode.setAttribute('shape-rendering', 'crispEdges');
    return svgNode.outerHTML;
  } catch (err) {
    // Fallback to Code 128 if EAN checksum fails
    try {
      const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(svgNode, code, {
        format: 'CODE128',
        displayValue: false,
        margin: 0,
        marginLeft: 4,
        marginRight: 4,
        marginTop: 0,
        marginBottom: 0,
        height: height,
        width: Math.max(1.0, barWidth),
        background: '#ffffff',
        lineColor: '#000000',
        flat: true,
      });
      const w = svgNode.getAttribute('width') || '120';
      const h = svgNode.getAttribute('height') || String(height);
      svgNode.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svgNode.removeAttribute('width');
      svgNode.removeAttribute('height');
      svgNode.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svgNode.setAttribute('style', 'width: 100%; height: 100%; max-height: 100%; display: block; margin: 0 auto;');
      svgNode.setAttribute('shape-rendering', 'crispEdges');
      return svgNode.outerHTML;
    } catch {
      return `<div style="font-family: monospace; font-size: 7px; font-weight: bold; text-align: center;">${code}</div>`;
    }
  }
}

export interface BarcodePrintOptions {
  barcodes: string[];
  sheets: string[][];
  isThermal: boolean;
  storeName: string;
  selectedProduct: Saree | null;
  showStoreName: boolean;
  showProductName: boolean;
  showPrice: boolean;
  showBarcodeText: boolean;
  columnsCount: number;
  labelWidthMm: number;
  labelHeightMm: number;
  codeType?: 'qr' | 'barcode';
  barcodeBarHeight?: number;
  barcodeBarWidth?: number;
  barcodeSvgHtml?: string;
  flapLeftWidthPct?: number;
  flapRightWidthPct?: number;
  marginTopMm?: number;
  marginBottomMm?: number;
  marginLeftMm?: number;
  marginRightMm?: number;
  offsetXmm?: number;
  offsetYmm?: number;
  invertFlaps?: boolean;
  rotate180?: boolean;
  rotate90?: boolean;
  rotationAngle?: 0 | 90 | 180 | 270;
  flipBackFlap180?: boolean;
  printOrientation?: 'landscape' | 'portrait' | 'auto';
}

export function printBarcodeLabels(options: BarcodePrintOptions): void {
  const {
    barcodes,
    sheets,
    isThermal,
    storeName,
    selectedProduct,
    showStoreName,
    showProductName,
    showPrice,
    showBarcodeText,
    columnsCount,
    labelWidthMm,
    labelHeightMm,
    codeType = 'qr',
    barcodeBarHeight = 24,
    barcodeBarWidth = 1.15,
    flapLeftWidthPct = 33,
    flapRightWidthPct = 33,
    marginTopMm = 0.8,
    marginBottomMm = 0.8,
    marginLeftMm = 1.0,
    marginRightMm = 1.0,
    offsetXmm = 0,
    offsetYmm = 0,
    invertFlaps = false,
    rotate180 = false,
    rotate90 = false,
    rotationAngle,
    flipBackFlap180 = false,
    printOrientation = 'landscape',
  } = options;

  let effectiveRotation: 0 | 90 | 180 | 270 = 0;
  if (typeof rotationAngle === 'number') {
    effectiveRotation = (rotationAngle % 360) as (0 | 90 | 180 | 270);
  } else if (rotate90) {
    effectiveRotation = 90;
  } else if (rotate180) {
    effectiveRotation = 180;
  }

  const isRotated90or270 = effectiveRotation === 90 || effectiveRotation === 270;
  const printPageWidthMm = (isThermal && isRotated90or270) ? labelHeightMm : labelWidthMm;
  const printPageHeightMm = (isThermal && isRotated90or270) ? labelWidthMm : labelHeightMm;

  if (barcodes.length === 0) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups in your browser to print barcode labels.');
    return;
  }

  // Calculate dynamic barcode container height:
  // For 80x12mm dumbbell labels (<= 16mm height), calculate height strictly between top/bottom margins
  // Leaving safe room for item row (2.2mm) and barcode number (1.5mm)
  const barcodeBoxHeightMm = labelHeightMm <= 16
    ? Math.max(4.8, Math.min(5.5, labelHeightMm - (marginTopMm + marginBottomMm + 4.2)))
    : Math.max(6.0, Math.min(26.0, (labelHeightMm - 8.0) * 0.75));

  const renderLabelHtml = (code: string) => {
    const isQr = codeType === 'qr';
    const svgCode = isQr
      ? createQrSvg(code, 64)
      : createBarcodeSvg(code, barcodeBarHeight, barcodeBarWidth);
    const itemName = (showProductName && selectedProduct) ? selectedProduct.name.substring(0, 16) : 'GOLD ORNAMENT';
    const priceText = showPrice ? (selectedProduct?.sellingPrice?.toLocaleString('en-IN') || '0') : '0';
    const weightVal = selectedProduct?.weight || '8.000g';
    const karatVal = selectedProduct?.material || '916 KDM';

    const storeFlapHtml = `
      <div class="flap-content">
        ${showStoreName ? `
          <img src="${LOGO_EMBLEM_BASE64}" class="logo-img" alt="Logo" />
          <div class="flap-store">DURGAS</div>
        ` : ''}
        <div class="flap-details">W: ${weightVal} &bull; ${karatVal}</div>
      </div>
    `;

    const barcodeFlapHtml = `
      <div class="flap-content">
        <div class="flap-item-row">
          <span class="flap-item">${itemName}</span>
          <span class="flap-price">₹${priceText}</span>
        </div>
        <div class="barcode-box ${isQr ? 'qr-box' : ''}">
          ${svgCode}
        </div>
        ${showBarcodeText ? `<div class="barcode-num">${code}</div>` : ''}
      </div>
    `;

    const flapLeftInner = invertFlaps ? barcodeFlapHtml : storeFlapHtml;
    const flapRightInner = invertFlaps ? storeFlapHtml : barcodeFlapHtml;

    return `
      <div class="label-card">
        <!-- Left Flap: Leading Paddle -->
        <div class="flap-left">
          ${flapLeftInner}
        </div>

        <!-- Middle Gap: Fold Loop / Tail Bridge (Zero Print Zone) -->
        <div class="flap-middle"></div>

        <!-- Right Flap: Trailing Paddle (Optional 180° Fold Inversion) -->
        <div class="flap-right ${flipBackFlap180 ? 'flip-180' : ''}">
          ${flapRightInner}
        </div>
      </div>
    `;
  };

  let bodyHtml = '';
  if (isThermal) {
    for (let i = 0; i < barcodes.length; i++) {
      bodyHtml += `<div class="thermal-label-page">${renderLabelHtml(barcodes[i])}</div>`;
    }
  } else {
    for (let p = 0; p < sheets.length; p++) {
      const sheetCodes = sheets[p];
      bodyHtml += `
        <div class="sheet-page">
          <div class="sheet-grid">
            ${sheetCodes.map((code) => renderLabelHtml(code)).join('')}
          </div>
        </div>
      `;
    }
  }

  const orientationKeyword = (isThermal && printOrientation !== 'auto')
    ? (isRotated90or270 ? ' portrait' : ` ${printOrientation}`)
    : '';
  const pageSizeCss = isThermal
    ? `${printPageWidthMm}mm ${printPageHeightMm}mm${orientationKeyword}`
    : 'A4 portrait';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${storeName} - Barcode Labels</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Inter:wght@600;700;800&display=swap" rel="stylesheet">
        <style>
          @page {
            size: ${pageSizeCss};
            margin: 0mm !important;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html {
            background: #ffffff;
            margin: 0;
            padding: 0;
            width: 100%;
          }
          body {
            background: #ffffff;
            color: #000000;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }

          @media screen {
            body {
              background: #f1f5f9;
              padding: 20px;
            }
            .no-print-bar {
              max-width: 650px;
              margin: 0 auto 20px auto;
              background: #ffffff;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 12px 18px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.08);
            }
            .no-print-bar .title {
              font-size: 13px;
              font-weight: 800;
              color: #065f3d;
            }
            .no-print-bar .hint {
              font-size: 11px;
              color: #475569;
              margin-top: 3px;
            }
            .no-print-bar button {
              background: #065f3d;
              color: white;
              border: none;
              padding: 8px 18px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
            }
            .no-print-bar button:hover {
              background: #04432b;
            }
            .sheet-page {
              background: #ffffff;
              margin: 0 auto 20px auto;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .thermal-label-page {
              width: ${printPageWidthMm}mm;
              height: ${printPageHeightMm}mm;
              margin: 0 auto 12px auto;
              background: #ffffff;
              box-shadow: 0 1px 6px rgba(0,0,0,0.15);
              position: relative;
              overflow: hidden;
            }
          }

          @media print {
            @page {
              size: ${pageSizeCss};
              margin: 0mm !important;
            }
            html {
              width: ${isThermal ? `${printPageWidthMm}mm` : '100%'} !important;
              height: ${isThermal ? `${printPageHeightMm}mm` : 'auto'} !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              overflow: hidden !important;
            }
            body {
              width: ${isThermal ? `${printPageWidthMm}mm` : '100%'} !important;
              height: ${isThermal ? `${printPageHeightMm}mm` : 'auto'} !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              overflow: hidden !important;
            }
            .no-print, .no-print-bar {
              display: none !important;
              visibility: hidden !important;
              height: 0 !important;
              width: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
            }
            .sheet-page {
              box-shadow: none !important;
              margin: 0 !important;
              padding: ${isThermal ? 0 : '6mm'} !important;
            }
            .thermal-label-page {
              width: ${printPageWidthMm}mm !important;
              height: ${printPageHeightMm}mm !important;
              min-width: ${printPageWidthMm}mm !important;
              max-width: ${printPageWidthMm}mm !important;
              min-height: ${printPageHeightMm}mm !important;
              max-height: ${printPageHeightMm}mm !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              overflow: hidden !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              position: relative !important;
            }
            .thermal-label-page:last-child,
            .thermal-label-page:last-of-type {
              page-break-after: auto !important;
              break-after: auto !important;
            }
          }

          .sheet-page {
            width: 210mm;
            height: 297mm;
            page-break-after: always;
            break-after: page;
            padding: 6mm;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            box-sizing: border-box;
          }
          .sheet-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .sheet-grid {
            display: grid;
            grid-template-columns: repeat(${columnsCount}, ${labelWidthMm}mm);
            grid-auto-rows: ${labelHeightMm}mm;
            gap: 2mm 2mm;
            justify-content: center;
            align-content: start;
          }

          .thermal-label-page {
            width: ${printPageWidthMm}mm;
            height: ${printPageHeightMm}mm;
            min-width: ${printPageWidthMm}mm;
            max-width: ${printPageWidthMm}mm;
            min-height: ${printPageHeightMm}mm;
            max-height: ${printPageHeightMm}mm;
            page-break-after: always;
            break-after: page;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 0;
            box-sizing: border-box;
            position: relative;
          }
          .thermal-label-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          /* Dumbbell Card Layout */
          .label-card {
            width: ${labelWidthMm}mm;
            height: ${labelHeightMm}mm;
            min-width: ${labelWidthMm}mm;
            max-width: ${labelWidthMm}mm;
            min-height: ${labelHeightMm}mm;
            max-height: ${labelHeightMm}mm;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
            overflow: hidden;
            background: #ffffff;
            color: #000000;
            border: ${isThermal ? 'none' : '1px solid #cbd5e1'};
            padding: 0;
            flex-shrink: 0;
            transform: ${effectiveRotation !== 0 ? `rotate(${effectiveRotation}deg) translate(${offsetXmm}mm, ${offsetYmm}mm)` : `translate(${offsetXmm}mm, ${offsetYmm}mm)`};
            transform-origin: center center;
          }

          .thermal-label-page .label-card {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) ${effectiveRotation !== 0 ? `rotate(${effectiveRotation}deg)` : ''} translate(${offsetXmm}mm, ${offsetYmm}mm);
            transform-origin: center center;
          }

          .flip-180 {
            transform: rotate(180deg) !important;
            transform-origin: center center !important;
          }

          .flap-left {
            width: ${flapLeftWidthPct}%;
            min-width: ${flapLeftWidthPct}%;
            max-width: ${flapLeftWidthPct}%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: ${marginTopMm}mm ${marginRightMm}mm ${marginBottomMm}mm ${marginLeftMm}mm;
            box-sizing: border-box;
            overflow: hidden;
            flex-shrink: 0;
            border-right: ${isThermal ? 'none' : '1px dashed #cbd5e1'};
          }

          .flap-middle {
            width: ${Math.max(0, 100 - flapLeftWidthPct - flapRightWidthPct)}%;
            min-width: ${Math.max(0, 100 - flapLeftWidthPct - flapRightWidthPct)}%;
            max-width: ${Math.max(0, 100 - flapLeftWidthPct - flapRightWidthPct)}%;
            height: 100%;
            flex-shrink: 0;
            box-sizing: border-box;
          }

          .flap-right {
            width: ${flapRightWidthPct}%;
            min-width: ${flapRightWidthPct}%;
            max-width: ${flapRightWidthPct}%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: center;
            text-align: center;
            padding: ${marginTopMm}mm ${marginRightMm}mm ${marginBottomMm}mm ${marginLeftMm}mm;
            box-sizing: border-box;
            overflow: hidden;
            flex-shrink: 0;
            border-left: ${isThermal ? 'none' : '1px dashed #cbd5e1'};
          }

          /* Left Flap Elements */
          .logo-img {
            height: 2.5mm;
            max-height: 2.5mm;
            max-width: 16mm;
            object-fit: contain;
            margin-bottom: 0.2mm;
            flex-shrink: 0;
            display: block;
          }
          .flap-store {
            font-family: 'Cinzel', 'Times New Roman', Georgia, serif;
            font-size: 5.2pt;
            line-height: 1.1;
            font-weight: 900;
            margin: 0.1mm 0 0.2mm 0;
            color: #065f3d;
            letter-spacing: 0.6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
            flex-shrink: 0;
          }
          .flap-details {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 3.6pt;
            line-height: 1.1;
            font-weight: 700;
            margin: 0.1mm 0 0 0;
            color: #1e293b;
            letter-spacing: 0.1px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
            flex-shrink: 0;
          }

          /* Right Flap Elements */
          .flap-item-row {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            height: 2.2mm;
            max-height: 2.2mm;
            margin: 0 0 0.2mm 0;
            overflow: hidden;
            flex-shrink: 0;
            line-height: 1.1;
          }
          .flap-item {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 3.6pt;
            line-height: 1.1;
            font-weight: 700;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-transform: uppercase;
            max-width: 55%;
            min-width: 0;
            text-align: left;
            color: #1e293b;
            flex: 1 1 auto;
          }
          .flap-price {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 4.8pt;
            line-height: 1.1;
            font-weight: 900;
            margin: 0 0 0 0.5mm;
            letter-spacing: -0.2px;
            text-align: right;
            color: #000000;
            white-space: nowrap;
            flex: 0 0 auto;
          }
          .barcode-box {
            width: 100%;
            height: ${barcodeBoxHeightMm}mm;
            min-height: ${barcodeBoxHeightMm}mm;
            max-height: ${barcodeBoxHeightMm}mm;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            margin: 0.1mm auto;
            padding: 0;
            flex-shrink: 0;
          }
          .barcode-box svg {
            width: 100% !important;
            height: 100% !important;
            max-height: ${barcodeBoxHeightMm}mm !important;
            display: block !important;
            shape-rendering: crispEdges !important;
          }
          .barcode-box.qr-box svg {
            width: ${barcodeBoxHeightMm}mm !important;
            height: ${barcodeBoxHeightMm}mm !important;
            max-width: ${barcodeBoxHeightMm}mm !important;
            max-height: ${barcodeBoxHeightMm}mm !important;
            aspect-ratio: 1 / 1;
            margin: 0 auto;
          }
          .barcode-num {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
            font-size: 3.5pt;
            line-height: 1.1;
            font-weight: 800;
            margin: 0.1mm 0 0 0;
            letter-spacing: 0.5px;
            text-align: center;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            height: 1.5mm;
            max-height: 1.5mm;
            flex-shrink: 0;
          }
        </style>
      </head>
      <body>
        <div class="no-print no-print-bar">
          <div>
            <div class="title">🏷️ Print Preview: ${storeName} (TVS LP 46 Neo)</div>
            <div class="hint">
              <strong>Printer:</strong> TVS LP 46 Neo (203 DPI) • Paper: <strong>${printPageWidthMm}×${printPageHeightMm}mm (${printOrientation})</strong> • Start Origin: <strong>X: ${offsetXmm >= 0 ? '+' : ''}${offsetXmm}mm, Y: ${offsetYmm >= 0 ? '+' : ''}${offsetYmm}mm</strong> • Flaps: <strong>${invertFlaps ? 'Swapped (Barcode Left)' : 'Standard (Store Left)'}</strong>${flipBackFlap180 ? ' • Fold 180° Invert' : ''}${effectiveRotation !== 0 ? ` • Rotation: <strong>${effectiveRotation}°${effectiveRotation === 90 ? ' (Vertical Feed)' : ''}</strong>` : ''} • Margins: <strong>Top/Bottom ${marginTopMm}mm, Sides ${marginLeftMm}mm</strong> • Scale: <strong>100% (Actual Size)</strong>
            </div>
          </div>
          <button onclick="window.print()">Print Labels Now</button>
        </div>
        ${bodyHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Generates and downloads a pixel-perfect Vector PDF of the barcode stickers.
 * Eliminates browser print scaling / margin issues on thermal printers.
 */
export function downloadBarcodePdf(options: BarcodePrintOptions): void {
  const {
    barcodes,
    isThermal,
    storeName,
    selectedProduct,
    showStoreName,
    showProductName,
    showPrice,
    showBarcodeText,
    labelWidthMm,
    labelHeightMm,
    columnsCount,
    codeType = 'qr',
    flapLeftWidthPct = 33,
    flapRightWidthPct = 33,
    marginTopMm = 0.8,
    marginBottomMm = 0.8,
    marginLeftMm = 1.0,
    marginRightMm = 1.0,
    offsetXmm = 0,
    offsetYmm = 0,
    invertFlaps = false,
    rotate180 = false,
    rotate90 = false,
    rotationAngle,
    flipBackFlap180 = false,
    printOrientation = 'landscape',
  } = options;

  if (barcodes.length === 0) return;

  let effectiveRotation: 0 | 90 | 180 | 270 = 0;
  if (typeof rotationAngle === 'number') {
    effectiveRotation = (rotationAngle % 360) as (0 | 90 | 180 | 270);
  } else if (rotate90) {
    effectiveRotation = 90;
  } else if (rotate180) {
    effectiveRotation = 180;
  }

  const isRotated90or270 = effectiveRotation === 90 || effectiveRotation === 270;

  const itemName = (showProductName && selectedProduct) ? selectedProduct.name.substring(0, 18) : 'GOLD ORNAMENT';
  const priceVal = showPrice ? (selectedProduct?.sellingPrice?.toLocaleString('en-IN') || '0') : '0';
  const weightVal = selectedProduct?.weight || '8.000g';
  const karatVal = selectedProduct?.material || '916 KDM';

  if (isThermal) {
    const pdfPageWidth = isRotated90or270 ? labelHeightMm : labelWidthMm;
    const pdfPageHeight = isRotated90or270 ? labelWidthMm : labelHeightMm;
    const isLandscape = pdfPageWidth > pdfPageHeight;
    const pageSize: [number, number] = [pdfPageWidth, pdfPageHeight];
    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: pageSize,
    });

    barcodes.forEach((code, idx) => {
      if (idx > 0) {
        doc.addPage(pageSize, isLandscape ? 'landscape' : 'portrait');
      }

      if (effectiveRotation !== 0) {
        doc.saveGraphicsState();
        if (effectiveRotation === 90) {
          // Clockwise 90deg on [labelHeightMm, labelWidthMm] page: x_new = labelHeightMm - y, y_new = x
          doc.setCurrentTransformationMatrix(doc.Matrix(0, 1, -1, 0, labelHeightMm, 0));
        } else if (effectiveRotation === 180) {
          // 180deg on [labelWidthMm, labelHeightMm] page: x_new = labelWidthMm - x, y_new = labelHeightMm - y
          doc.setCurrentTransformationMatrix(doc.Matrix(-1, 0, 0, -1, labelWidthMm, labelHeightMm));
        } else if (effectiveRotation === 270) {
          // Counter-clockwise 90deg (270deg) on [labelHeightMm, labelWidthMm] page: x_new = y, y_new = labelWidthMm - x
          doc.setCurrentTransformationMatrix(doc.Matrix(0, -1, 1, 0, 0, labelWidthMm));
        }
      }

      drawSingleThermalVector(doc, {
        code,
        itemName,
        priceVal,
        storeName,
        showStoreName,
        showBarcodeText,
        widthMm: labelWidthMm,
        heightMm: labelHeightMm,
        codeType,
        weightVal,
        karatVal,
        flapLeftWidthPct,
        flapRightWidthPct,
        marginTopMm,
        marginBottomMm,
        marginLeftMm,
        marginRightMm,
        offsetXmm,
        offsetYmm,
        invertFlaps,
        rotate180: effectiveRotation === 180,
        flipBackFlap180,
      });

      if (effectiveRotation !== 0) {
        doc.restoreGraphicsState();
      }
    });

    doc.save(`thermal_barcodes_${new Date().toISOString().split('T')[0]}.pdf`);
  } else {
    // A4 sheet vector PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const marginX = 8;
    const marginY = 10;
    const gapX = 3;
    const gapY = 2;
    const labelsPerRow = columnsCount || 4;
    const labelsPerPage = labelsPerRow * 10;

    barcodes.forEach((code, idx) => {
      const pageIndex = Math.floor(idx / labelsPerPage);
      const indexOnPage = idx % labelsPerPage;

      if (idx > 0 && indexOnPage === 0) {
        doc.addPage('a4', 'portrait');
      }

      const col = indexOnPage % labelsPerRow;
      const row = Math.floor(indexOnPage / labelsPerRow);
      const x = marginX + col * (labelWidthMm + gapX);
      const y = marginY + row * (labelHeightMm + gapY);

      drawSingleThermalVector(doc, {
        code,
        itemName,
        priceVal,
        storeName,
        showStoreName,
        showBarcodeText,
        widthMm: labelWidthMm,
        heightMm: labelHeightMm,
        codeType,
        offsetX: x,
        offsetY: y,
        weightVal,
        karatVal,
        flapLeftWidthPct,
        flapRightWidthPct,
        marginTopMm,
        marginBottomMm,
        marginLeftMm,
        marginRightMm,
        offsetXmm,
        offsetYmm,
        invertFlaps,
        rotate180,
        flipBackFlap180,
      });
    });

    doc.save(`a4_barcodes_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}

interface VectorDrawParams {
  code: string;
  itemName: string;
  priceVal: string;
  storeName: string;
  showStoreName: boolean;
  showBarcodeText: boolean;
  widthMm: number;
  heightMm: number;
  codeType?: 'qr' | 'barcode';
  offsetX?: number;
  offsetY?: number;
  weightVal?: string;
  karatVal?: string;
  flapLeftWidthPct?: number;
  flapRightWidthPct?: number;
  marginTopMm?: number;
  marginBottomMm?: number;
  marginLeftMm?: number;
  marginRightMm?: number;
  offsetXmm?: number;
  offsetYmm?: number;
  invertFlaps?: boolean;
  rotate180?: boolean;
  flipBackFlap180?: boolean;
}

function drawSingleThermalVector(doc: jsPDF, params: VectorDrawParams): void {
  const {
    code,
    itemName,
    priceVal,
    storeName,
    showStoreName,
    showBarcodeText,
    widthMm,
    heightMm,
    codeType = 'qr',
    offsetX = 0,
    offsetY = 0,
    weightVal = '8.000g',
    karatVal = '916 KDM',
    flapLeftWidthPct = 33,
    flapRightWidthPct = 33,
    marginTopMm = 0.8,
    marginBottomMm = 0.8,
    marginLeftMm = 1.0,
    marginRightMm = 1.0,
    offsetXmm = 0,
    offsetYmm = 0,
    invertFlaps = false,
    flipBackFlap180 = false,
  } = params;

  // Helper to prevent text overflow beyond available width
  const fitText = (text: string, maxW: number): string => {
    let t = text;
    if (doc.getTextWidth(t) <= maxW) return t;
    while (t.length > 3 && doc.getTextWidth(t + '...') > maxW) {
      t = t.substring(0, t.length - 1);
    }
    return t + '...';
  };

  const totalOffsetX = (offsetX || 0) + (offsetXmm || 0);
  const totalOffsetY = (offsetY || 0) + (offsetYmm || 0);

  const leftPct = flapLeftWidthPct;
  const rightPct = flapRightWidthPct;
  
  const flapLeftWidth = widthMm * (leftPct / 100);
  const flapRightWidth = widthMm * (rightPct / 100);
  const midGap = Math.max(0, widthMm - flapLeftWidth - flapRightWidth);

  // Position of Left & Right Flaps
  const leftFlapX = totalOffsetX;
  const rightFlapX = totalOffsetX + flapLeftWidth + midGap;

  const drawStoreFlap = (flapX: number, flapW: number) => {
    const flapCenterX = flapX + flapW / 2;
    if (showStoreName) {
      try {
        doc.addImage(LOGO_EMBLEM_BASE64, 'PNG', flapCenterX - 3.0, totalOffsetY + marginTopMm, 6.0, 2.5);
      } catch {
        // Fallback
      }
      doc.setFont('times', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(6, 95, 61);
      doc.text('DURGAS', flapCenterX, totalOffsetY + marginTopMm + 4.5, { align: 'center' });
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(3.6);
    doc.setTextColor(30, 41, 59);
    doc.text(fitText(`W: ${weightVal} • ${karatVal}`, flapW - (marginLeftMm + marginRightMm)), flapCenterX, totalOffsetY + marginTopMm + 6.8, { align: 'center' });
  };

  const drawBarcodeFlap = (flapX: number, flapW: number) => {
    const flapCenterX = flapX + flapW / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(3.6);
    doc.setTextColor(51, 65, 85);
    doc.text(fitText(itemName, flapW * 0.52), flapX + marginLeftMm, totalOffsetY + marginTopMm + 1.8);

    doc.setFontSize(4.8);
    doc.setTextColor(0, 0, 0);
    doc.text(`₹${priceVal}`, flapX + flapW - marginRightMm, totalOffsetY + marginTopMm + 1.8, { align: 'right' });

    const maxBarcodeW = Math.max(10, flapW - (marginLeftMm + marginRightMm));
    const barcodeH = heightMm <= 16
      ? Math.max(4.8, Math.min(5.4, heightMm - (marginTopMm + marginBottomMm + 4.2)))
      : Math.max(6.0, Math.min(24.0, (heightMm - 8.0) * 0.75));
    const barcodeY = totalOffsetY + marginTopMm + 2.1;

    const isQr = codeType === 'qr';

    if (isQr) {
      const qrSide = Math.min(barcodeH, maxBarcodeW);
      const drawX = flapCenterX - qrSide / 2;
      const drawY = barcodeY + (barcodeH - qrSide) / 2;
      try {
        const qrDataUrl = createQrDataUrl(code, 180);
        if (qrDataUrl) {
          doc.addImage(qrDataUrl, 'PNG', drawX, drawY, qrSide, qrSide);
        } else {
          doc.setFillColor(0, 0, 0);
          doc.rect(drawX, drawY, qrSide, qrSide, 'F');
        }
      } catch {
        doc.setFillColor(0, 0, 0);
        doc.rect(drawX, drawY, qrSide, qrSide, 'F');
      }
    } else {
      try {
        const cleanCode = (code || '').trim();
        const isEan = /^\d{13}$/.test(cleanCode);
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, cleanCode, {
          format: isEan ? 'EAN13' : 'CODE128',
          displayValue: false,
          margin: 8,
          height: 120,
          width: 2.5,
          background: '#ffffff',
          lineColor: '#000000',
        });
        const canvasAspect = canvas.width / canvas.height;
        let drawW = maxBarcodeW;
        let drawH = drawW / canvasAspect;
        if (drawH > barcodeH) {
          drawH = barcodeH;
          drawW = drawH * canvasAspect;
        }
        const drawX = flapCenterX - drawW / 2;
        const drawY = barcodeY + (barcodeH - drawH) / 2;
        const barcodeDataUrl = canvas.toDataURL('image/png');
        doc.addImage(barcodeDataUrl, 'PNG', drawX, drawY, drawW, drawH);
      } catch {
        try {
          const canvas = document.createElement('canvas');
          JsBarcode(canvas, code, {
            format: 'CODE128',
            displayValue: false,
            margin: 8,
            height: 120,
            width: 2.5,
            background: '#ffffff',
            lineColor: '#000000',
          });
          const canvasAspect = canvas.width / canvas.height;
          let drawW = maxBarcodeW;
          let drawH = drawW / canvasAspect;
          if (drawH > barcodeH) {
            drawH = barcodeH;
            drawW = drawH * canvasAspect;
          }
          const drawX = flapCenterX - drawW / 2;
          const drawY = barcodeY + (barcodeH - drawH) / 2;
          const barcodeDataUrl = canvas.toDataURL('image/png');
          doc.addImage(barcodeDataUrl, 'PNG', drawX, drawY, drawW, drawH);
        } catch {
          doc.setFillColor(0, 0, 0);
          doc.rect(flapX + marginLeftMm, barcodeY, maxBarcodeW, barcodeH, 'F');
        }
      }
    }

    if (showBarcodeText) {
      doc.setFont('courier', 'bold');
      doc.setFontSize(3.6);
      doc.setTextColor(15, 23, 42);
      const codeY = heightMm <= 16 ? totalOffsetY + marginTopMm + 2.1 + barcodeH + 1.4 : barcodeY + barcodeH + 3.0;
      doc.text(fitText(code, flapW - (marginLeftMm + marginRightMm)), flapCenterX, codeY, { align: 'center' });
    }
  };

  if (!invertFlaps) {
    drawStoreFlap(leftFlapX, flapLeftWidth);
    drawBarcodeFlap(rightFlapX, flapRightWidth);
  } else {
    drawBarcodeFlap(leftFlapX, flapLeftWidth);
    drawStoreFlap(rightFlapX, flapRightWidth);
  }
}
