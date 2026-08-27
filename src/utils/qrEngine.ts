import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { QRCodeItem, QRStyling, ScannabilityResult } from '../types/qr';

/**
 * Calculates color luminance (0 to 1)
 */
function getLuminance(hexColor: string): number {
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculates contrast ratio between two colors (1 to 21)
 */
export function getContrastRatio(fgHex: string, bgHex: string): number {
  try {
    const l1 = getLuminance(fgHex);
    const l2 = getLuminance(bgHex);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 7.0;
  }
}

/**
 * Encodes text/URL into QR matrix and renders it on a Canvas with full custom styles
 */
export async function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  data: string,
  styling: QRStyling,
  scale: number = 2
): Promise<void> {
  const ecl = styling.logoUrl ? 'H' : styling.errorCorrectionLevel || 'M';
  const qrData = QRCode.create(data, {
    errorCorrectionLevel: ecl,
  });

  const moduleCount = qrData.modules.size;
  const margin = Math.max(1, styling.margin ?? 3);
  const totalModules = moduleCount + margin * 2;
  
  const baseSize = styling.size || 320;
  const canvasSize = baseSize * scale;
  
  // Account for top and bottom text banner if present
  const hasTopBanner = Boolean(styling.topText?.trim());
  const hasBottomBanner = Boolean(styling.bottomText?.trim());
  
  const bannerHeight = (hasBottomBanner || hasTopBanner) ? 44 * scale : 0;
  const topOffset = hasTopBanner ? bannerHeight : 0;
  const totalCanvasHeight = canvasSize + (hasTopBanner ? bannerHeight : 0) + (hasBottomBanner ? bannerHeight : 0);

  canvas.width = canvasSize;
  canvas.height = totalCanvasHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  // Background
  if (!styling.transparentBg) {
    ctx.fillStyle = styling.bgColor || '#ffffff';
    ctx.fillRect(0, 0, canvasSize, totalCanvasHeight);
  } else {
    ctx.clearRect(0, 0, canvasSize, totalCanvasHeight);
  }

  const cellSize = canvasSize / totalModules;
  const qrOffsetX = margin * cellSize;
  const qrOffsetY = margin * cellSize + topOffset;

  // Helper to check if a module is inside the 3 corner Finder Patterns (Eyes)
  const isFinderPattern = (row: number, col: number): boolean => {
    // Top-left
    if (row < 7 && col < 7) return true;
    // Top-right
    if (row < 7 && col >= moduleCount - 7) return true;
    // Bottom-left
    if (row >= moduleCount - 7 && col < 7) return true;
    return false;
  };

  const matrix = qrData.modules.data;

  // 1. Draw regular modules (excluding finder patterns)
  ctx.fillStyle = styling.fgColor || '#0f172a';

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const isDark = matrix[row * moduleCount + col];
      if (!isDark) continue;

      if (isFinderPattern(row, col)) {
        continue; // Handled separately for custom eye styles
      }

      const x = qrOffsetX + col * cellSize;
      const y = qrOffsetY + row * cellSize;

      switch (styling.moduleStyle) {
        case 'dots': {
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, (cellSize / 2) * 0.88, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'rounded': {
          const r = cellSize * 0.35;
          drawRoundedRect(ctx, x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, r);
          ctx.fill();
          break;
        }
        case 'smooth': {
          const r = cellSize * 0.48;
          drawRoundedRect(ctx, x + 0.2, y + 0.2, cellSize - 0.4, cellSize - 0.4, r);
          ctx.fill();
          break;
        }
        case 'classy': {
          // Diamond / diamond-rounded
          ctx.beginPath();
          ctx.moveTo(x + cellSize / 2, y);
          ctx.lineTo(x + cellSize, y + cellSize / 2);
          ctx.lineTo(x + cellSize / 2, y + cellSize);
          ctx.lineTo(x, y + cellSize / 2);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'square':
        default: {
          ctx.fillRect(x, y, cellSize + 0.2, cellSize + 0.2);
          break;
        }
      }
    }
  }

  // 2. Draw Finder Pattern Eyes (Top-Left, Top-Right, Bottom-Left)
  const eyeColor = styling.eyeColor || styling.fgColor || '#0f172a';
  const eyes = [
    { row: 0, col: 0 },
    { row: 0, col: moduleCount - 7 },
    { row: moduleCount - 7, col: 0 }
  ];

  eyes.forEach(eye => {
    const eyeX = qrOffsetX + eye.col * cellSize;
    const eyeY = qrOffsetY + eye.row * cellSize;
    const eyeSize = 7 * cellSize;

    drawCustomEye(ctx, eyeX, eyeY, eyeSize, cellSize, eyeColor, styling.bgColor, styling.eyeStyle);
  });

  // 3. Draw Center Logo if present
  if (styling.logoUrl) {
    await drawCenterLogo(
      ctx,
      styling.logoUrl,
      canvasSize / 2,
      qrOffsetY + (moduleCount * cellSize) / 2,
      canvasSize * (styling.logoSizeRatio || 0.22),
      styling.logoBackground !== false,
      styling.logoBgColor || '#ffffff',
      styling.logoBorderRadius ?? 8
    );
  }

  // 4. Draw Top & Bottom Text Banners if enabled
  if (hasTopBanner && styling.topText) {
    drawBannerText(
      ctx,
      styling.topText,
      canvasSize,
      bannerHeight,
      0,
      styling.fgColor,
      styling.bgColor,
      scale
    );
  }

  if (hasBottomBanner && styling.bottomText) {
    drawBannerText(
      ctx,
      styling.bottomText,
      canvasSize,
      bannerHeight,
      totalCanvasHeight - bannerHeight,
      styling.bottomTextColor || styling.fgColor,
      styling.bottomTextBg || (styling.transparentBg ? 'transparent' : styling.bgColor),
      scale
    );
  }
}

/**
 * Draw custom Eye (7x7 modules area)
 */
function drawCustomEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  cellSize: number,
  color: string,
  bgColor: string,
  style: QRStyling['eyeStyle']
) {
  ctx.fillStyle = color;

  switch (style) {
    case 'circle': {
      // Outer ring
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Middle gap
      ctx.fillStyle = bgColor || '#ffffff';
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2 - cellSize, 0, Math.PI * 2);
      ctx.fill();

      // Center solid ball
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, (3 * cellSize) / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'rounded': {
      const outerR = cellSize * 2;
      const innerR = cellSize * 1.2;

      // Outer
      drawRoundedRect(ctx, x, y, size, size, outerR);
      ctx.fill();

      // Gap
      ctx.fillStyle = bgColor || '#ffffff';
      drawRoundedRect(ctx, x + cellSize, y + cellSize, size - cellSize * 2, size - cellSize * 2, innerR);
      ctx.fill();

      // Center
      ctx.fillStyle = color;
      drawRoundedRect(ctx, x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3, cellSize * 0.8);
      ctx.fill();
      break;
    }
    case 'leaf': {
      // Top-left and bottom-right rounded, others sharp
      ctx.beginPath();
      ctx.moveTo(x + cellSize * 2.5, y);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size, y + size - cellSize * 2.5);
      ctx.quadraticCurveTo(x + size, y + size, x + size - cellSize * 2.5, y + size);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x, y + cellSize * 2.5);
      ctx.quadraticCurveTo(x, y, x + cellSize * 2.5, y);
      ctx.closePath();
      ctx.fill();

      // Gap
      ctx.fillStyle = bgColor || '#ffffff';
      ctx.fillRect(x + cellSize, y + cellSize, size - 2 * cellSize, size - 2 * cellSize);

      // Center
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, (3 * cellSize) / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'square':
    default: {
      // Outer 7x7 square
      ctx.fillRect(x, y, size, size);

      // Middle gap 5x5
      ctx.fillStyle = bgColor || '#ffffff';
      ctx.fillRect(x + cellSize, y + cellSize, size - cellSize * 2, size - cellSize * 2);

      // Center 3x3
      ctx.fillStyle = color;
      ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
      break;
    }
  }
}

/**
 * Draw logo in center with high clarity and rounded backdrop
 */
async function drawCenterLogo(
  ctx: CanvasRenderingContext2D,
  logoSrc: string,
  centerX: number,
  centerY: number,
  logoSize: number,
  hasBackground: boolean,
  bgColor: string,
  borderRadius: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const padding = hasBackground ? logoSize * 0.12 : 0;
      const totalBox = logoSize + padding * 2;
      const boxX = centerX - totalBox / 2;
      const boxY = centerY - totalBox / 2;

      if (hasBackground) {
        ctx.save();
        ctx.fillStyle = bgColor;
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 8;
        drawRoundedRect(ctx, boxX, boxY, totalBox, totalBox, borderRadius * 1.5);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      const imgX = centerX - logoSize / 2;
      const imgY = centerY - logoSize / 2;
      drawRoundedRect(ctx, imgX, imgY, logoSize, logoSize, borderRadius);
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, logoSize, logoSize);
      ctx.restore();
      resolve();
    };
    img.onerror = () => {
      resolve(); // graceful fallback
    };
    img.src = logoSrc;
  });
}

/**
 * Draw text banner above or under QR
 */
function drawBannerText(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  offsetY: number,
  textColor: string,
  bgColor: string,
  scale: number
) {
  if (bgColor && bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, offsetY, width, height);
  }

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(14 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.letterSpacing = '1px';
  ctx.fillText(text.toUpperCase(), width / 2, offsetY + height / 2);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Analyzes QR scannability score & simulates an actual optical decode pass with jsQR
 */
export async function evaluateScannability(
  data: string,
  styling: QRStyling
): Promise<ScannabilityResult> {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // 1. Contrast ratio test
  const contrast = getContrastRatio(styling.fgColor || '#000000', styling.bgColor || '#ffffff');
  if (contrast < 3.0) {
    score -= 40;
    warnings.push(`Contraste très faible (${contrast.toFixed(1)}:1). Les caméras auront du mal à distinguer les modules.`);
    recommendations.push('Augmentez le contraste entre la couleur du QR code et son arrière-plan (ratio minimal recommandé: 4.5:1).');
  } else if (contrast < 4.5) {
    score -= 15;
    warnings.push(`Contraste moyen (${contrast.toFixed(1)}:1).`);
    recommendations.push('Préférez une couleur plus sombre sur un fond clair pour un scan ultra-rapide.');
  }

  // 2. Logo coverage test
  const logoRatio = styling.logoUrl ? (styling.logoSizeRatio || 0.22) : 0;
  if (logoRatio > 0.28) {
    score -= 25;
    warnings.push(`Taille du logo élevée (${Math.round(logoRatio * 100)}% de la surface).`);
    recommendations.push('Réduisez la taille du logo sous 25% pour préserver la redondance Reed-Solomon.');
  } else if (logoRatio > 0.24) {
    score -= 5;
  }

  // 3. Margin test
  if (styling.margin < 2) {
    score -= 10;
    warnings.push('Marge de sécurité (Quiet Zone) inférieure à 2 modules.');
    recommendations.push('Conservez une marge minimale de 2 ou 3 modules pour une détection optimale.');
  }

  // 4. Optical decode simulation on real rendered canvas
  const testCanvas = document.createElement('canvas');
  try {
    await renderQRToCanvas(testCanvas, data, styling, 1);
    const ctx = testCanvas.getContext('2d');
    if (ctx) {
      const imgData = ctx.getImageData(0, 0, testCanvas.width, testCanvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height);
      if (!code) {
        score = Math.min(score, 45);
        warnings.push('Le test de décodage optique direct a échoué. Le QR Code risque d\'être difficile à scanner.');
        recommendations.push('Désactivez le logo ou choisissez un style de modules plus classique (carré ou arrondi léger).');
      }
    }
  } catch (e) {
    console.warn('Scannability test render error:', e);
  }

  const isReadable = score >= 65;
  const statusText = score >= 85 
    ? 'QR CODE PARFAITEMENT LISIBLE'
    : isReadable 
      ? 'QR CODE LISIBLE (Avertissements légers)'
      : 'ATTENTION : LISIBILITÉ RÉDUITE';

  return {
    score: Math.max(0, Math.min(100, score)),
    isReadable,
    statusText,
    contrastRatio: contrast,
    logoCoverageRatio: logoRatio,
    warnings,
    recommendations
  };
}

/**
 * Downloads the canvas as high-resolution PNG
 */
export function downloadCanvasAsPNG(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Generates an SVG string representation of the QR code
 */
export async function generateQRSVG(data: string, styling: QRStyling): Promise<string> {
  const ecl = styling.logoUrl ? 'H' : styling.errorCorrectionLevel || 'M';
  const qr = QRCode.create(data, { errorCorrectionLevel: ecl });
  const moduleCount = qr.modules.size;
  const margin = Math.max(1, styling.margin ?? 3);
  const total = moduleCount + margin * 2;
  const size = styling.size || 400;
  const cellSize = size / total;

  let rects = '';
  const matrix = qr.modules.data;
  const fg = styling.fgColor || '#000000';
  const bg = styling.transparentBg ? 'none' : (styling.bgColor || '#ffffff');

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r * moduleCount + c]) {
        const x = (c + margin) * cellSize;
        const y = (r + margin) * cellSize;
        rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fg}" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    ${bg !== 'none' ? `<rect width="${size}" height="${size}" fill="${bg}" />` : ''}
    ${rects}
  </svg>`;
}

/**
 * Download SVG file
 */
export function downloadSVG(svgString: string, filename: string) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
