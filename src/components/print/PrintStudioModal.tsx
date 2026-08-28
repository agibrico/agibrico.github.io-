import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  CreditCard, 
  FileText, 
  LayoutTemplate, 
  Tag, 
  Sparkles,
  Check,
  FileDown,
  Loader2,
  Smartphone,
  Layers
} from 'lucide-react';
import { QRCodeItem } from '../../types/qr';
import { renderQRToCanvas } from '../../utils/qrEngine';
import { getPublicQRUrl } from '../../utils/storage';
import { exportCardTwoPagesPDF, exportA4SheetPDF } from '../../utils/pdfExport';
import { getCompanyDefaultLogo } from '../../utils/defaultLogos';

interface PrintStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: QRCodeItem | null;
}

export type PrintTemplateType = 'card_recto_verso' | 'business_cards_sheet' | 'table_tent' | 'poster_a4' | 'badge_event';
export type PdfExportMode = 'card_2pages' | 'full_sheet';

export const PrintStudioModal: React.FC<PrintStudioModalProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const [template, setTemplate] = useState<PrintTemplateType>('card_recto_verso');
  const [exportMode, setExportMode] = useState<PdfExportMode>('card_2pages');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);
  const printAreaRef = useRef<HTMLDivElement | null>(null);
  const rectoCardRef = useRef<HTMLDivElement | null>(null);
  const versoCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!item) return;

    const canvas = document.createElement('canvas');
    const encoded = item.mode === 'dynamic' ? getPublicQRUrl(item.publicId, item) : (item.content.websiteUrl || getPublicQRUrl(item.publicId, item));
    
    renderQRToCanvas(canvas, encoded, item.styling, 3).then(() => {
      setQrDataUrl(canvas.toDataURL('image/png'));
    });
  }, [item]);

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const displayName = item.content.fullName || `${item.content.firstName || ''} ${item.content.lastName || ''}`.trim() || item.content.company || 'Contact Professionnel';
  const displayTitle = item.content.jobTitle || 'Concepteur d\'applications mobiles & Web';
  const displayCompany = item.content.company || 'AGB';
  const displaySlogan = item.content.slogan || 'L\'innovation technologique et le développement sur mesure';
  const displayCity = item.content.city || 'Abidjan – Côte d\'Ivoire';
  const emergencyPhone = item.content.primaryPhone || '+225 01 04 00 00 00';
  const secondaryPhone = item.content.secondaryPhone;
  const phoneLossText = secondaryPhone 
    ? `En cas de perte : ${emergencyPhone} / ${secondaryPhone}` 
    : `En cas de perte : ${emergencyPhone}`;

  const companyLogo = (item.styling.logoUrl && !item.styling.logoUrl.includes('unsplash.com'))
    ? item.styling.logoUrl
    : (item.content.logoUrl && !item.content.logoUrl.includes('unsplash.com'))
    ? item.content.logoUrl
    : getCompanyDefaultLogo(displayCompany);

  const handleExportPDF = async () => {
    if (isExportingPDF) return;

    try {
      setIsExportingPDF(true);
      setPdfSuccess(false);

      const safeName = (displayName || 'Carte_Visite').replace(/[^a-zA-Z0-9_-]/g, '_');

      if (exportMode === 'card_2pages' && rectoCardRef.current && versoCardRef.current && template === 'card_recto_verso') {
        // Mode 1: Pure 85x55mm 2-pages card PDF (Page 1 = Recto, Page 2 = Verso)
        const filename = `Carte_Visite_${safeName}_85x55mm_Recto_Verso.pdf`;
        await exportCardTwoPagesPDF(rectoCardRef.current, versoCardRef.current, filename, displayName);
      } else if (printAreaRef.current) {
        // Mode 2: Full Sheet Layout (A4)
        const filename = `Carte_Visite_${safeName}_${template}.pdf`;
        await exportA4SheetPDF(printAreaRef.current, filename, displayName);
      }

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3500);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert("Une erreur est survenue lors de l'exportation du fichier PDF. Veuillez réessayer.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const currentCardTheme = item.styling.cardBackgroundTheme || 'white_classic';
  const getCardBgStyle = () => {
    switch (currentCardTheme) {
      case 'matte_dark':
        return { backgroundColor: '#0F172A', color: '#F8FAFC' };
      case 'cream_clean':
        return { backgroundColor: '#FAF7EE', color: '#1E293B' };
      case 'navy_prestige':
        return { backgroundColor: '#0A192F', color: '#F1F5F9' };
      case 'emerald_luxe':
        return { backgroundColor: '#064E3B', color: '#F0FDF4' };
      case 'burgundy_rich':
        return { backgroundColor: '#4C0519', color: '#FFF1F2' };
      case 'slate_minimal':
        return { backgroundColor: '#334155', color: '#F8FAFC' };
      case 'custom_solid':
        return { 
          backgroundColor: item.styling.cardCustomBgColor || '#2563EB', 
          color: item.styling.cardCustomTextColor || '#FFFFFF' 
        };
      case 'white_classic':
      default:
        return { backgroundColor: '#FFFFFF', color: '#0F172A' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm print:p-0 print:bg-white animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">
        
        {/* Header - Screen only */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Studio d'Impression HD — Carte de Visite Pro (Recto / Verso)
              </h2>
              <p className="text-xs text-slate-500">
                Format standard 85 × 55 mm • Rendu ultra-haute définition téléchargeable sur téléphone et ordinateur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Mode Toggle (When in card_recto_verso) */}
            {template === 'card_recto_verso' && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 text-[11px] font-bold mr-1">
                <button
                  type="button"
                  onClick={() => setExportMode('card_2pages')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    exportMode === 'card_2pages'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Génère un PDF 85x55mm de 2 pages (Page 1 = Recto, Page 2 = Verso) prêt pour imprimantes ou stockage mobile"
                >
                  2 Pages (85×55mm)
                </button>
                <button
                  type="button"
                  onClick={() => setExportMode('full_sheet')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    exportMode === 'full_sheet'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Génère une planche A4 complète avec le Recto et le Verso ensemble"
                >
                  Planche A4
                </button>
              </div>
            )}

            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full shadow-xs transition-all cursor-pointer ${
                pdfSuccess
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Télécharger la carte de visite au format document PDF (Recto / Verso) sur votre téléphone ou PC"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Création du PDF...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>PDF Téléchargé !</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Exporter en PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-full shadow-xs transition-colors cursor-pointer"
              title="Lancer l'impression directe sur imprimante"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Template Selector Bar - Screen only */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-200 bg-slate-50 overflow-x-auto print:hidden">
          {[
            { id: 'card_recto_verso', label: 'Carte Pro (Recto & Verso Dédié)', icon: CreditCard },
            { id: 'business_cards_sheet', label: 'Planche 8x Cartes (Page A4)', icon: CreditCard },
            { id: 'table_tent', label: 'Chevalet de Table / Comptoir', icon: LayoutTemplate },
            { id: 'poster_a4', label: 'Affiche Murale A4 & Vitrine', icon: FileText },
            { id: 'badge_event', label: 'Badge Événementiel', icon: Tag },
          ].map(tpl => {
            const Icon = tpl.icon;
            const isActive = template === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => setTemplate(tpl.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tpl.label}</span>
              </button>
            );
          })}
        </div>

        {/* Printable Canvas Viewport */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          
          <div
            ref={printAreaRef}
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-lg print:shadow-none p-8 flex flex-col justify-between"
            style={{ boxSizing: 'border-box' }}
          >
            
            {/* TEMPLATE 0: CARTE PRO RECTO & VERSO DÉDIÉ */}
            {template === 'card_recto_verso' && (
              <div className="space-y-8 my-auto">
                <div className="text-center print:hidden mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    Modèle Professionnel Conforme (85 × 55 mm)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Recto : Logo, Nom & Numéro en cas de perte | Verso : 100% QR Code Dynamique
                  </p>
                </div>

                {/* RECTO */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 print:hidden">
                    <span>1. RECTO (Face Avant Physique)</span>
                    <span className="text-blue-600">Nom • Prénom • Numéro Principal</span>
                  </div>
                  <div
                    ref={rectoCardRef}
                    style={{ ...getCardBgStyle(), height: '55mm' }}
                    className="w-full max-w-[85mm] mx-auto rounded-3xl border border-slate-300/80 p-8 shadow-md flex flex-col items-center justify-center relative overflow-hidden text-center"
                  >
                    {/* Minimalist Identity centered */}
                    <div className="space-y-4">
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight uppercase">
                        {displayName}
                      </h2>

                      <div className="w-20 h-0.5 bg-current opacity-20 mx-auto rounded-full" />

                      <p className="text-lg sm:text-xl font-bold tracking-widest opacity-90">
                        {emergencyPhone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* VERSO */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 print:hidden">
                    <span>2. VERSO (Face Arrière Physique)</span>
                    <span className="text-emerald-600">QR Code Uniquement</span>
                  </div>
                  <div
                    ref={versoCardRef}
                    className="w-full max-w-[85mm] mx-auto rounded-3xl border border-slate-300/80 p-6 shadow-md flex flex-col items-center justify-center relative overflow-hidden"
                    style={{ ...getCardBgStyle(), height: '55mm' }}
                  >
                    {/* Only the QR Code centered in its white box */}
                    <div className="p-3 bg-white rounded-[32px] border border-slate-200/50 flex items-center justify-center shadow-2xl">
                      {qrDataUrl && <img src={qrDataUrl} alt="QR Code Verso" className="w-28 h-28 sm:w-32 sm:h-32 object-contain" />}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TEMPLATE 1: 8x BUSINESS CARDS SHEET (A4) */}
            {template === 'business_cards_sheet' && (
              <div className="grid grid-cols-2 gap-4 h-full my-auto">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-white text-center shadow-sm"
                    style={{ height: '55mm' }}
                  >
                    <div className="space-y-2">
                      <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">{displayName}</h3>
                      <div className="w-12 h-0.5 bg-slate-200 mx-auto" />
                      <p className="font-bold text-[10px] text-slate-600 tracking-widest">{item.content.primaryPhone || '+225 01 04 00 00 00'}</p>
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs mt-1">
                      {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-20 h-22 object-contain" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TEMPLATE 2: TABLE TENT (Chevalet de table) */}
            {template === 'table_tent' && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                <div className="border-4 border-slate-900 rounded-3xl p-8 max-w-md w-full space-y-6 bg-white shadow-sm">
                  {item.styling.logoUrl && (
                    <img src={item.styling.logoUrl} alt="Logo" className="w-16 h-16 mx-auto object-contain" />
                  )}
                  
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{displayCompany || displayName}</h2>
                    <p className="text-sm font-semibold text-blue-600 mt-1">{item.title}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl inline-block border border-slate-200">
                    {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-56 h-56 mx-auto object-contain" />}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                      Scannez avec votre téléphone
                    </p>
                    <p className="text-xs text-slate-500">
                      Accédez instantanément aux coordonnées, aux services et à WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TEMPLATE 3: POSTER A4 */}
            {template === 'poster_a4' && (
              <div className="flex flex-col items-center justify-between h-full text-center py-10 px-6 border-8 border-slate-900 rounded-3xl bg-slate-50">
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-600">SMART QR CODE PROFESSIONNEL</span>
                  <h1 className="text-3xl font-black text-slate-900">{displayName}</h1>
                  <p className="text-base font-semibold text-slate-600">{displayTitle} • {displayCompany}</p>
                  {displaySlogan && <p className="text-xs italic text-slate-500">« {displaySlogan} »</p>}
                </div>

                <div className="p-6 bg-white rounded-3xl shadow-lg border border-slate-200 inline-block">
                  {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-72 h-72 mx-auto object-contain" />}
                </div>

                <div className="space-y-2 max-w-sm">
                  <p className="text-lg font-black text-slate-900 uppercase tracking-wide">
                    Scannez pour enregistrer dans vos contacts
                  </p>
                  <p className="text-xs text-slate-500">
                    Ouvrez l'appareil photo de votre smartphone et pointez vers le code. Fiche complète interactive.
                  </p>
                </div>
              </div>
            )}

            {/* TEMPLATE 4: EVENT BADGE */}
            {template === 'badge_event' && (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div
                  className="w-[100mm] h-[140mm] border-2 border-slate-900 rounded-3xl p-6 flex flex-col justify-between items-center text-center bg-white shadow-md relative"
                >
                  {/* Badge Hole slot indicator */}
                  <div className="w-12 h-3 bg-slate-200 border border-slate-400 rounded-full mx-auto -mt-2" />

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">BADGE PROFESSIONNEL / VIP</span>
                    <h2 className="text-xl font-black text-slate-900">{displayName}</h2>
                    <p className="text-xs font-bold text-slate-600">{displayTitle}</p>
                    <p className="text-[11px] text-slate-400">{displayCompany}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-40 h-40 mx-auto object-contain" />}
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Scannez pour échanger vos contacts
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
