/**
 * Visual Regression & Difference Engine
 * Compares candidate renderer output against reference BarTender output.
 * Produces difference heatmap (red = different, black = identical) and shift metrics.
 */

export interface ImageDiffResult {
  totalPixels: number;
  mismatchedPixels: number;
  diffPercentage: number;
  similarityScore: number;
  shiftXdots: number;
  shiftYdots: number;
  diffCanvas: HTMLCanvasElement;
  diffDataUrl: string;
  verdict: 'identical' | 'near-match' | 'divergent';
  analysisNotes: string[];
}

/**
 * Resizes an image or canvas onto a standardized target canvas of width x height
 */
export function normalizeToCanvas(
  source: HTMLCanvasElement | HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const normCanvas = document.createElement('canvas');
  normCanvas.width = targetWidth;
  normCanvas.height = targetHeight;
  const ctx = normCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
  }
  return normCanvas;
}

/**
 * Compares two canvas images pixel-by-pixel
 */
export function compareLabelCanvases(
  candidateCanvas: HTMLCanvasElement,
  referenceCanvas: HTMLCanvasElement,
  tolerance: number = 25 // Color difference threshold (0-255)
): ImageDiffResult {
  const width = candidateCanvas.width;
  const height = candidateCanvas.height;

  // Ensure both have identical dimensions for pixel comparison
  const refNorm = normalizeToCanvas(referenceCanvas, width, height);

  const candCtx = candidateCanvas.getContext('2d');
  const refCtx = refNorm.getContext('2d');

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d');

  if (!candCtx || !refCtx || !diffCtx) {
    throw new Error('Canvas 2D context unavailable for image diff.');
  }

  const candData = candCtx.getImageData(0, 0, width, height).data;
  const refData = refCtx.getImageData(0, 0, width, height).data;
  const diffImg = diffCtx.createImageData(width, height);
  const diffData = diffImg.data;

  let mismatchedCount = 0;
  const totalPixels = width * height;

  // Centroid accumulators to detect geometric offset
  let candSumX = 0, candSumY = 0, candDarkCount = 0;
  let refSumX = 0, refSumY = 0, refDarkCount = 0;

  for (let i = 0; i < candData.length; i += 4) {
    const pixelIndex = i / 4;
    const px = pixelIndex % width;
    const py = Math.floor(pixelIndex / width);

    const r1 = candData[i];
    const g1 = candData[i + 1];
    const b1 = candData[i + 2];
    const lum1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;
    const isDark1 = lum1 < 160;

    const r2 = refData[i];
    const g2 = refData[i + 1];
    const b2 = refData[i + 2];
    const lum2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;
    const isDark2 = lum2 < 160;

    if (isDark1) {
      candSumX += px;
      candSumY += py;
      candDarkCount++;
    }
    if (isDark2) {
      refSumX += px;
      refSumY += py;
      refDarkCount++;
    }

    const delta = Math.abs(lum1 - lum2);
    const isDiff = delta > tolerance;

    if (isDiff) {
      mismatchedCount++;
      if (isDark1 && !isDark2) {
        // Pixel in candidate but not reference -> Bright Red
        diffData[i] = 239;     // R
        diffData[i + 1] = 68;  // G
        diffData[i + 2] = 68;  // B
        diffData[i + 3] = 255; // A
      } else if (!isDark1 && isDark2) {
        // Pixel in reference but missing in candidate -> Electric Cyan
        diffData[i] = 6;       // R
        diffData[i + 1] = 182; // G
        diffData[i + 2] = 212; // B
        diffData[i + 3] = 255; // A
      } else {
        // Gray difference
        diffData[i] = 255;
        diffData[i + 1] = 165;
        diffData[i + 2] = 0;
        diffData[i + 3] = 255;
      }
    } else {
      // Matching background or matching foreground
      if (isDark1) {
        // Matching ink -> dark gray
        diffData[i] = 40;
        diffData[i + 1] = 40;
        diffData[i + 2] = 40;
        diffData[i + 3] = 255;
      } else {
        // Matching white paper -> solid black canvas to emphasize difference
        diffData[i] = 15;
        diffData[i + 1] = 23;
        diffData[i + 2] = 42;
        diffData[i + 3] = 255;
      }
    }
  }

  diffCtx.putImageData(diffImg, 0, 0);

  // Calculate shift based on centroid delta
  const candCentroidX = candDarkCount > 0 ? candSumX / candDarkCount : 0;
  const candCentroidY = candDarkCount > 0 ? candSumY / candDarkCount : 0;
  const refCentroidX = refDarkCount > 0 ? refSumX / refDarkCount : 0;
  const refCentroidY = refDarkCount > 0 ? refSumY / refDarkCount : 0;

  const shiftXdots = Math.round(candCentroidX - refCentroidX);
  const shiftYdots = Math.round(candCentroidY - refCentroidY);

  const diffPercentage = Number(((mismatchedCount / totalPixels) * 100).toFixed(2));
  const similarityScore = Number((100 - diffPercentage).toFixed(2));

  const analysisNotes: string[] = [];

  if (diffPercentage === 0) {
    analysisNotes.push('Exact 100% pixel match with reference BarTender output.');
  } else {
    if (Math.abs(shiftXdots) > 1 || Math.abs(shiftYdots) > 1) {
      analysisNotes.push(
        `Centroid Shift Detected: Candidate layout is shifted by ${shiftXdots > 0 ? '+' : ''}${shiftXdots} dots X, ${shiftYdots > 0 ? '+' : ''}${shiftYdots} dots Y relative to BarTender reference.`
      );
    }
    if (candDarkCount > refDarkCount * 1.15) {
      analysisNotes.push(`Ink Coverage Alert: Candidate has ${(candDarkCount - refDarkCount)} more black pixels (heavier font weight or thicker barcode bars).`);
    } else if (candDarkCount < refDarkCount * 0.85) {
      analysisNotes.push(`Ink Coverage Alert: Candidate has ${(refDarkCount - candDarkCount)} fewer black pixels (lighter font or narrower module width).`);
    }
    analysisNotes.push(`Red pixels indicate candidate ink not in reference; Cyan pixels indicate BarTender reference ink missing from candidate.`);
  }

  const verdict: 'identical' | 'near-match' | 'divergent' =
    diffPercentage < 0.5 ? 'identical' : diffPercentage < 5.0 ? 'near-match' : 'divergent';

  return {
    totalPixels,
    mismatchedPixels: mismatchedCount,
    diffPercentage,
    similarityScore,
    shiftXdots,
    shiftYdots,
    diffCanvas,
    diffDataUrl: diffCanvas.toDataURL('image/png'),
    verdict,
    analysisNotes,
  };
}
