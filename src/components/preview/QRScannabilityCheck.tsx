import React, { useEffect, useRef, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Eye, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw, 
  Share2,
  FileCode,
  Smartphone,
  CreditCard,
  QrCode,
  FileDown,
  Loader2
} from 'lucide-react';
import { QRStyling, ScannabilityResult, QRCodeItem, QRContent } from '../../types/qr';
import { 
  renderQRToCanvas, 
  evaluateScannability, 
  downloadCanvasAsPNG, 
  generateQRSVG, 
  downloadSVG 
} from '../../utils/qrEngine';
import { getPublicQRUrl } from '../../utils/storage';
import { exportDirectCardPDF } from '../../utils/pdfExport';
import { PhysicalCardVisualizer } from './PhysicalCardVisualizer';

interface QRScannabilityCheckProps {
  dataUrl: string;
  styling: QRStyling;
  title: string;
  content?: QRContent;
  publicId?: string;
  onUpdateStyling?: (key: keyof QRStyling, value: any) => void;
  onOpenPrintStudio?: () => void;
  onOpenPreviewModal?: () => void;
}

export const QRScannabilityCheck: React.FC<QRScannabilityCheckProps> = ({
  dataUrl,
  styling,
  title,
  content,
  publicId,
  onUpdateStyling,
  onOpenPrintStudio,
  onOpenPreviewModal
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scannability, setScannability] = useState<ScannabilityResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [resolutionScale, setResolutionScale] = useState<number>(3); // 3x for 1200px HD export
  const [activeTab, setActiveTab] = useState<'card_preview' | 'qr_code'>('card_preview');
  const [qrDataUrlString, setQrDataUrlString] = useState<string>('');
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  useEffect(() => {
    updateQR();
  }, [dataUrl, styling]);

  const updateQR = async () => {
    if (!canvasRef.current || !dataUrl) return;
    setIsEvaluating(true);

    try {
      // 1. Render to visible preview canvas (scale 1.5)
      await renderQRToCanvas(canvasRef.current, dataUrl, styling, 1.5);
      setQrDataUrlString(canvasRef.current.toDataURL('image/png'));

      // 2. Evaluate scannability (contrast, optical decode, logo ratio)
      const result = await evaluateScannability(dataUrl, styling);
      setScannability(result);
    } catch (e) {
      console.warn("QR Render warning:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleDownloadPNG = async () => {
    const exportCanvas = document.createElement('canvas');
    await renderQRToCanvas(exportCanvas, dataUrl, styling, resolutionScale);
    const cleanTitle = (title || 'smart_qr').toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadCanvasAsPNG(exportCanvas, `${cleanTitle}_hd.png`);
  };

  const handleDownloadSVG = async () => {
    const svgStr = await generateQRSVG(dataUrl, styling);
    const cleanTitle = (title || 'smart_qr').toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadSVG(svgStr, `${cleanTitle}.svg`);
  };

  const handleDirectPDFExport = async () => {
    if (isExportingPDF) return;
    try {
      setIsExportingPDF(true);
      setPdfSuccess(false);

      const currentItem: QRCodeItem = {
        id: `qr_${Date.now()}`,
        publicId: publicId || 'direct_export',
        title: title || 'Carte de Visite',
        type: 'vcard',
        mode: 'dynamic',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scanCount: 0,
        content: content || {},
        styling: styling
      };

      await exportDirectCardPDF(currentItem);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('Direct PDF export error:', err);
      if (onOpenPrintStudio) {
        onOpenPrintStudio();
      } else {
        alert("Impossible de générer le PDF directement. Veuillez utiliser le studio d'impression.");
      }
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleCopyLink = () => {
    if (!publicId) return;
    const currentItem: QRCodeItem = {
      id: `qr_${publicId.toLowerCase()}`,
      publicId,
      title: title || 'Carte de Visite',
      type: 'vcard',
      mode: 'dynamic',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scanCount: 0,
      content: content || {},
      styling: styling
    };
    const url = getPublicQRUrl(publicId, currentItem);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const publicUrl = publicId ? getPublicQRUrl(publicId, {
    id: `qr_${publicId.toLowerCase()}`,
    publicId,
    title: title || 'Carte de Visite',
    type: 'vcard',
    mode: 'dynamic',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scanCount: 0,
    content: content || {},
    styling: styling
  }) : dataUrl;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5 sticky top-20 flex flex-col">
      
      {/* Top Header Switcher: Carte Visuelle Finie vs QR Code Seul */}
      <div className="w-full flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('card_preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'card_preview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Carte Physique Finie</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr_code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'qr_code'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code Brut</span>
          </button>
        </div>

        {/* Health pill */}
        {scannability && (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{scannability.score}%</span>
          </div>
        )}
      </div>

      {/* VIEW 1: CARTE PHYSIQUE FINIE (RECTO & VERSO) */}
      {activeTab === 'card_preview' && (
        <div className="space-y-4">
          <PhysicalCardVisualizer
            content={content || {}}
            styling={styling}
            title={title}
            qrDataUrl={qrDataUrlString}
            publicId={publicId}
            onUpdateStyling={onUpdateStyling}
            onOpenPrintStudio={onOpenPrintStudio}
            onOpenMobilePreview={onOpenPreviewModal}
          />
        </div>
      )}

      {/* VIEW 2: QR CODE BRUT CANVAS */}
      <div className={activeTab === 'qr_code' ? 'block space-y-4' : 'hidden'}>
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 flex flex-col items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto rounded-xl"
            style={{ width: '220px' }}
          />
        </div>

        {/* Title & Mode Description */}
        <div className="text-center space-y-0.5">
          <h4 className="font-bold text-slate-800 text-xs">{title || 'Aperçu du QR Code'}</h4>
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">
            Format : HD Vector & Dot Matrix
          </p>
        </div>
      </div>

      {/* Format Export Actions */}
      <div className="space-y-2.5 pt-2 border-t border-slate-200">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
          Exporter la Carte & le QR Code
        </span>

        {/* Primary Action: Direct Recto/Verso PDF Download */}
        <button
          type="button"
          onClick={handleDirectPDFExport}
          disabled={isExportingPDF}
          className={`w-full py-2.5 px-4 rounded-full text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
            pdfSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          } disabled:opacity-50`}
          title="Télécharger la carte de visite complète (Recto & Verso) au format PDF"
        >
          {isExportingPDF ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Génération du PDF (Recto / Verso)...</span>
            </>
          ) : pdfSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>PDF Téléchargé avec Succès !</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              <span>Exporter en PDF (Recto / Verso)</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-3 gap-2 w-full">
          <button
            onClick={handleDownloadSVG}
            className="py-2 px-2 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="Exporter le QR Code en format vectoriel SVG"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            <span>SVG</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            className="py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="Télécharger l'image PNG haute résolution du QR Code"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG HD</span>
          </button>

          {onOpenPrintStudio && (
            <button
              onClick={onOpenPrintStudio}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="Ouvrir le Studio d'Impression (A4, Planches, Chevalets, Badges)"
            >
              <Printer className="w-3.5 h-3.5 text-blue-300" />
              <span>Studio</span>
            </button>
          )}
        </div>

        {onOpenPreviewModal && (
          <button
            onClick={onOpenPreviewModal}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200"
          >
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Tester la Fiche Mobile Complète</span>
          </button>
        )}

        {/* Short Link Copy */}
        {publicId && (
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 px-2 text-[11px] font-mono text-slate-600 truncate focus:outline-none bg-transparent"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : 'Copier'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

