import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { QRCodeItem, QRStyling, CardBackgroundTheme } from '../types/qr';
import { renderQRToCanvas } from './qrEngine';
import { getPublicQRUrl, addHistoryLog } from './storage';

/**
 * Universal safe downloader that works across iOS Safari, Android Chrome, and Desktop browsers.
 */
export async function downloadBlob(blob: Blob, filename: string) {
  try {
    // Check if running on Android/iOS via Capacitor
    if (Capacitor.isNativePlatform()) {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        // Strip the "data:application/pdf;base64," prefix
        const base64data = dataUri.split(',')[1];

        // Save file to the device's Documents directory
        await Filesystem.writeFile({
          path: filename,
          data: base64data,
          directory: Directory.Documents,
        });
        alert(`Fichier enregistré dans vos Documents : ${filename}`);
      };
      return;
    }

    // Standard Web Download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 1500);
  } catch (err) {
    console.error('Blob download failed, trying window.open fallback:', err);
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}

/**
 * Download a jsPDF instance cleanly across all mobile and desktop devices.
 */
export function downloadJsPDF(pdf: jsPDF, filename: string) {
  try {
    const blob = pdf.output('blob');
    downloadBlob(blob, filename);
  } catch (e) {
    // Fallback to internal save method
    pdf.save(filename);
  }
}

/**
 * Generates an ultra-high-definition 2-Page PDF (85mm x 55mm format)
 * Page 1 = Recto (Face Avant: Logo, Nom, Prénom, Fonction, Numéro en cas de perte)
 * Page 2 = Verso (Face Arrière: 100% QR Code Dynamique scannable)
 */
export async function exportCardTwoPagesPDF(
  rectoElement: HTMLElement,
  versoElement: HTMLElement,
  filename: string,
  clientTitle?: string
): Promise<boolean> {
  try {
    // 1. Capture Recto at 3x scale for crisp print quality
    const rectoCanvas = await html2canvas(rectoElement, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false
    });

    // 2. Capture Verso at 3x scale
    const versoCanvas = await html2canvas(versoElement, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false
    });

    const rectoImg = rectoCanvas.toDataURL('image/png', 1.0);
    const versoImg = versoCanvas.toDataURL('image/png', 1.0);

    // 3. Create 85mm x 55mm Landscape PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85, 55]
    });

    // Page 1: Recto
    pdf.addImage(rectoImg, 'PNG', 0, 0, 85, 55, undefined, 'FAST');

    // Page 2: Verso
    pdf.addPage([85, 55], 'landscape');
    pdf.addImage(versoImg, 'PNG', 0, 0, 85, 55, undefined, 'FAST');

    downloadJsPDF(pdf, filename);

    addHistoryLog({
      action: 'print_card',
      title: `Exportation PDF (Recto / Verso) : ${clientTitle || 'Carte de visite'}`,
      details: `Format 85×55mm (2 pages haute définition) téléchargé.`
    });

    return true;
  } catch (error) {
    console.error('Error generating 2-page card PDF:', error);
    throw error;
  }
}

/**
 * Generates an A4 Printable Sheet PDF from an HTML container element.
 */
export async function exportA4SheetPDF(
  containerElement: HTMLElement,
  filename: string,
  clientTitle?: string
): Promise<boolean> {
  try {
    const canvas = await html2canvas(containerElement, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    downloadJsPDF(pdf, filename);

    addHistoryLog({
      action: 'print_card',
      title: `Exportation PDF Planche A4 : ${clientTitle || 'Carte de visite'}`,
      details: `Planche d'impression PDF générée et téléchargée.`
    });

    return true;
  } catch (error) {
    console.error('Error generating A4 sheet PDF:', error);
    throw error;
  }
}

/**
 * Standalone direct PDF export for any QRCodeItem without requiring modal open.
 * Constructs offscreen cards, renders high-res QR, and exports 2-pages 85x55mm PDF.
 */
export async function exportDirectCardPDF(item: QRCodeItem): Promise<boolean> {
  try {
    const displayName = item.content.fullName || `${item.content.firstName || ''} ${item.content.lastName || ''}`.trim() || item.content.company || 'Contact Professionnel';
    const displayTitle = item.content.jobTitle || '';
    const displayCompany = item.content.company || 'AGB';
    const emergencyPhone = item.content.primaryPhone || '+225 01 04 00 00 00';
    const secondaryPhone = item.content.secondaryPhone;
    const phoneText = secondaryPhone ? `En cas de perte : ${emergencyPhone} / ${secondaryPhone}` : `En cas de perte : ${emergencyPhone}`;

    // Render QR Code to offscreen canvas
    const qrCanvas = document.createElement('canvas');
    const encoded = item.mode === 'dynamic' ? getPublicQRUrl(item.publicId) : (item.content.websiteUrl || getPublicQRUrl(item.publicId));
    await renderQRToCanvas(qrCanvas, encoded, item.styling, 3);
    const qrDataUrl = qrCanvas.toDataURL('image/png');

    // Create offscreen container
    const offscreen = document.createElement('div');
    offscreen.style.position = 'fixed';
    offscreen.style.left = '-9999px';
    offscreen.style.top = '-9999px';
    offscreen.style.width = '340px';
    offscreen.style.zIndex = '-100';
    document.body.appendChild(offscreen);

    // Resolve theme
    const theme = item.styling.cardBackgroundTheme || 'white_classic';
    let bgColor = '#FFFFFF';
    let textColor = '#0F172A';

    if (theme === 'matte_dark') { bgColor = '#0F172A'; textColor = '#F8FAFC'; }
    else if (theme === 'cream_clean') { bgColor = '#FAF7EE'; textColor = '#1E293B'; }
    else if (theme === 'navy_prestige') { bgColor = '#0A192F'; textColor = '#F1F5F9'; }
    else if (theme === 'emerald_luxe') { bgColor = '#064E3B'; textColor = '#F0FDF4'; }
    else if (theme === 'burgundy_rich') { bgColor = '#4C0519'; textColor = '#FFF1F2'; }
    else if (theme === 'slate_minimal') { bgColor = '#334155'; textColor = '#F8FAFC'; }
    else if (theme === 'custom_solid') {
      bgColor = item.styling.cardCustomBgColor || '#2563EB';
      textColor = item.styling.cardCustomTextColor || '#FFFFFF';
    }

    // Build RECTO element
    const rectoEl = document.createElement('div');
    rectoEl.style.width = '340px';
    rectoEl.style.height = '220px';
    rectoEl.style.backgroundColor = bgColor;
    rectoEl.style.color = textColor;
    rectoEl.style.padding = '24px';
    rectoEl.style.boxSizing = 'border-box';
    rectoEl.style.display = 'flex';
    rectoEl.style.flexDirection = 'column';
    rectoEl.style.alignItems = 'center';
    rectoEl.style.justifyContent = 'center';
    rectoEl.style.borderRadius = '16px';
    rectoEl.style.border = '2px solid rgba(0,0,0,0.15)';
    rectoEl.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    rectoEl.style.textAlign = 'center';

    rectoEl.innerHTML = `
      <div style="margin-bottom: 12px;">
        <h2 style="font-size:16px;font-weight:900;margin:0;line-height:1.1;text-transform:uppercase;letter-spacing:1px;">${displayName}</h2>
      </div>
      <div style="padding-top:12px;border-top:2px solid rgba(128,128,128,0.2);width:80%;">
        <span style="font-size:16px;font-weight:800;letter-spacing:1px;">${emergencyPhone}</span>
      </div>
    `;

    // Build VERSO element
    const versoEl = document.createElement('div');
    versoEl.style.width = '340px';
    versoEl.style.height = '220px';
    versoEl.style.backgroundColor = bgColor;
    versoEl.style.color = textColor;
    versoEl.style.padding = '16px';
    versoEl.style.boxSizing = 'border-box';
    versoEl.style.display = 'flex';
    versoEl.style.flexDirection = 'column';
    versoEl.style.alignItems = 'center';
    versoEl.style.justifyContent = 'center';
    versoEl.style.borderRadius = '16px';
    versoEl.style.border = '2px solid rgba(0,0,0,0.15)';
    versoEl.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    versoEl.innerHTML = `
      <div style="background:white;padding:12px;border-radius:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
        <img src="${qrDataUrl}" style="width:130px;height:130px;object-fit:contain;" />
      </div>
    `;

    offscreen.appendChild(rectoEl);
    offscreen.appendChild(versoEl);

    const safeName = (displayName || 'Carte_Visite').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Carte_Visite_${safeName}_Recto_Verso.pdf`;

    await exportCardTwoPagesPDF(rectoEl, versoEl, filename, displayName);

    document.body.removeChild(offscreen);
    return true;
  } catch (error) {
    console.error('Direct PDF Export failed:', error);
    throw error;
  }
}
