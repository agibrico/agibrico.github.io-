import React, { useState, useRef } from 'react';
import { RefreshCw, Smartphone, Download, Printer, ShieldAlert, Sparkles, Check, Palette, Upload, Image as ImageIcon } from 'lucide-react';
import { QRContent, QRStyling, CardBackgroundTheme } from '../../types/qr';
import { getCompanyDefaultLogo } from '../../utils/defaultLogos';

interface PhysicalCardVisualizerProps {
  content: QRContent;
  styling: QRStyling;
  title: string;
  qrDataUrl: string;
  publicId?: string;
  className?: string;
  onUpdateStyling?: (key: keyof QRStyling, value: any) => void;
  onOpenPrintStudio?: () => void;
  onOpenMobilePreview?: () => void;
}

export const THEME_PRESETS: {
  id: CardBackgroundTheme;
  name: string;
  bgHex: string;
  textHex: string;
  borderClass: string;
  badge: string;
}[] = [
  { id: 'white_classic', name: 'Blanc Pur Épuré', bgHex: '#FFFFFF', textHex: '#0F172A', borderClass: 'border-slate-200', badge: 'Standard' },
  { id: 'matte_dark', name: 'Noir Carbone Mat', bgHex: '#0F172A', textHex: '#F8FAFC', borderClass: 'border-slate-700', badge: 'Luxe' },
  { id: 'cream_clean', name: 'Ivoire Naturel', bgHex: '#FAF7EE', textHex: '#1E293B', borderClass: 'border-amber-200/80', badge: 'Éco' },
  { id: 'navy_prestige', name: 'Bleu Nuit Prestige', bgHex: '#0A192F', textHex: '#F1F5F9', borderClass: 'border-blue-900', badge: 'Tech' },
  { id: 'emerald_luxe', name: 'Vert Émeraude Royal', bgHex: '#064E3B', textHex: '#F0FDF4', borderClass: 'border-emerald-800', badge: 'Exclusif' },
  { id: 'burgundy_rich', name: 'Bordeaux Velours', bgHex: '#4C0519', textHex: '#FFF1F2', borderClass: 'border-rose-900', badge: 'Élégant' },
  { id: 'slate_minimal', name: 'Gris Minéral Studio', bgHex: '#334155', textHex: '#F8FAFC', borderClass: 'border-slate-600', badge: 'Design' },
  { id: 'custom_solid', name: 'Couleur Personnalisée', bgHex: '#2563EB', textHex: '#FFFFFF', borderClass: 'border-blue-400', badge: 'Libre' }
];

export const PhysicalCardVisualizer: React.FC<PhysicalCardVisualizerProps> = ({
  content,
  styling,
  title,
  qrDataUrl,
  publicId,
  className = '',
  onUpdateStyling,
  onOpenPrintStudio,
  onOpenMobilePreview
}) => {
  const [activeSide, setActiveSide] = useState<'both' | 'recto' | 'verso'>('both');
  
  const currentTheme = styling.cardBackgroundTheme || 'emerald_luxe';
  const customBg = styling.cardCustomBgColor || '#0b4d3c';
  const customText = styling.cardCustomTextColor || '#FFFFFF';

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const displayName = content.fullName || `${content.firstName || ''} ${content.lastName || ''}`.trim() || 'Richmond DONGO';
  const jobTitle = content.jobTitle || 'Responsable commercial';
  const companyName = content.company || 'CANAAN SERVICES';
  const companyLogo = (styling.logoUrl && !styling.logoUrl.includes('unsplash.com')) 
    ? styling.logoUrl 
    : (content.logoUrl && !content.logoUrl.includes('unsplash.com')) 
    ? content.logoUrl 
    : getCompanyDefaultLogo(companyName);

  const emergencyPhone = content.primaryPhone || '+225 07 08 07 66 90';
  const secondaryPhone = content.secondaryPhone || '+225 01 71 29 47 67';

  const phoneLossText = secondaryPhone 
    ? `En cas de perte : ${emergencyPhone} / ${secondaryPhone}` 
    : `En cas de perte : ${emergencyPhone}`;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (onUpdateStyling) {
        onUpdateStyling('logoUrl', dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectTheme = (themeId: CardBackgroundTheme) => {
    if (onUpdateStyling) {
      onUpdateStyling('cardBackgroundTheme', themeId);
    }
  };

  // Resolve card inline styles & classes
  const getCardStyle = (isVerso = false) => {
    const selected = THEME_PRESETS.find(p => p.id === currentTheme) || THEME_PRESETS[0];
    if (currentTheme === 'custom_solid') {
      return {
        backgroundColor: customBg,
        color: customText,
      };
    }
    return {
      backgroundColor: selected.bgHex,
      color: selected.textHex,
    };
  };

  const isDarkCard = () => {
    if (currentTheme === 'custom_solid') {
      // Rough brightness check
      return true;
    }
    return ['matte_dark', 'navy_prestige', 'emerald_luxe', 'burgundy_rich', 'slate_minimal'].includes(currentTheme);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Visual Controls Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Side Selector Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSide('recto')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeSide === 'recto'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recto (Face avant)
          </button>
          <button
            type="button"
            onClick={() => setActiveSide('verso')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeSide === 'verso'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verso (QR Code seul)
          </button>
          <button
            type="button"
            onClick={() => setActiveSide('both')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeSide === 'both'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vue Double
          </button>
        </div>

        {/* Theme quick switch indicator */}
        <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <Palette className="w-3.5 h-3.5 text-blue-600" />
          <span>Finition du fond :</span>
        </div>
      </div>

      {/* Designer Card Background Palette Selector */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Choix du fond de la carte physique
          </span>
          <span className="text-[10px] text-blue-600 font-bold">
            {THEME_PRESETS.find(p => p.id === currentTheme)?.name}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {THEME_PRESETS.map((preset) => {
            const isSelected = currentTheme === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectTheme(preset.id)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40' 
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
                title={preset.name}
              >
                <div
                  className="w-6 h-6 rounded-lg border border-slate-300/80 shadow-2xs relative flex items-center justify-center"
                  style={{ backgroundColor: preset.id === 'custom_solid' ? customBg : preset.bgHex }}
                >
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ${preset.id === 'white_classic' || preset.id === 'cream_clean' ? 'text-slate-900' : 'text-white'}`} />
                  )}
                </div>
                <span className="text-[9px] font-medium text-slate-600 truncate w-full text-center">
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Color Pickers if 'custom_solid' is active */}
        {currentTheme === 'custom_solid' && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-600">Couleur de fond :</label>
              <input
                type="color"
                value={customBg}
                onChange={e => onUpdateStyling && onUpdateStyling('cardCustomBgColor', e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-600">Texte :</label>
              <input
                type="color"
                value={customText}
                onChange={e => onUpdateStyling && onUpdateStyling('cardCustomTextColor', e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cards Rendering Area */}
      <div className="flex flex-col items-center justify-center gap-6 py-2">
        
        {/* RECTO CARD (Front) */}
        {(activeSide === 'recto' || activeSide === 'both') && (
          <div className="w-full flex flex-col items-center space-y-1.5">
            <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              <span>Face Recto (Avant)</span>
              <span className="text-[10px] text-blue-600 font-semibold">Design Minimaliste</span>
            </div>

            <div
              style={getCardStyle(false)}
              className="w-full max-w-[340px] sm:max-w-[360px] aspect-[85/55] rounded-2xl border border-slate-300/80 p-8 flex flex-col items-center justify-center relative select-none transition-all duration-300 shadow-xl overflow-hidden text-center"
            >
              {/* Subtle card sheen effect */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none rounded-tr-2xl" />

              {/* Name & Phone Number centered */}
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight uppercase">
                  {displayName}
                </h3>

                <div className="w-24 h-1 bg-white/20 mx-auto rounded-full" />

                <p className="text-lg sm:text-xl font-bold tracking-widest opacity-90">
                  {emergencyPhone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VERSO CARD (Back: ONLY QR CODE) */}
        {(activeSide === 'verso' || activeSide === 'both') && (
          <div className="w-full flex flex-col items-center space-y-1.5">
            <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              <span>Face Verso (Arrière)</span>
              <span className="text-[10px] text-emerald-600 font-semibold">100% QR Code</span>
            </div>

            <div
              style={getCardStyle(true)}
              className="w-full max-w-[340px] sm:max-w-[360px] aspect-[85/55] rounded-3xl border border-slate-300/80 p-6 flex flex-col items-center justify-center relative select-none transition-all duration-300 shadow-xl overflow-hidden"
            >
              <div className="p-4 bg-white rounded-[32px] shadow-2xl border border-slate-200/50 flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Verso"
                    className="w-32 h-32 sm:w-36 sm:h-32 object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-100 animate-pulse rounded-2xl" />
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Information Banner */}
      <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl text-[11px] text-slate-600 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-800">Spécification Carte Physique Conforme :</p>
          <p className="text-slate-600 mt-0.5">
            <strong>Recto :</strong> Logo, nom & prénom, numéro en cas de perte.<br />
            <strong>Verso :</strong> QR Code unique central avec toute la fiche (coordonnées, services, lien GPS/localisation & vCard).
          </p>
        </div>
      </div>

    </div>
  );
};
