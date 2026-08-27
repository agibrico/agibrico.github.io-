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
              <span className="text-[10px] text-blue-600 font-semibold">85 × 55 mm • Rendu Réel</span>
            </div>

            <div
              style={getCardStyle(false)}
              className="w-full max-w-[340px] sm:max-w-[360px] aspect-[85/55] rounded-2xl border border-slate-300/80 p-6 flex flex-col justify-between relative select-none transition-all duration-300 shadow-xl overflow-hidden"
            >
              {/* Subtle card sheen effect */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none rounded-tr-2xl" />

              {/* 1. TOP: Logo de l'entreprise / marque */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => onUpdateStyling && fileInputRef.current?.click()}
                    className={`relative group ${onUpdateStyling ? 'cursor-pointer' : ''}`}
                    title={onUpdateStyling ? 'Cliquer pour importer / changer le logo d\'entreprise' : undefined}
                  >
                    {companyLogo ? (
                      <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-slate-200/80 shadow-md flex items-center justify-center overflow-hidden">
                        <img
                          src={companyLogo}
                          alt="Logo Entreprise"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-white text-slate-900 font-black text-xs flex items-center justify-center border border-slate-200 shadow-md">
                        LOGO
                      </div>
                    )}

                    {onUpdateStyling && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Upload className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-black tracking-wider uppercase opacity-95">
                      {companyName}
                    </span>
                    {onUpdateStyling && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[9px] text-emerald-200 hover:text-white underline cursor-pointer text-left print:hidden opacity-80"
                      >
                        Modifier le logo
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs" />
              </div>

              {/* 2. CENTER: Nom & Prénom + Titre */}
              <div className="my-auto py-1.5">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white">
                  {displayName}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-emerald-100/90 mt-0.5">
                  {jobTitle}
                </p>
              </div>

              {/* 3. BOTTOM: Numéro en cas de perte */}
              <div className="pt-2.5 border-t border-emerald-700/60 flex items-center justify-between text-[9.5px] sm:text-[10.5px] font-semibold tracking-wide opacity-95 text-white">
                <span className="flex items-center gap-1.5">
                  <span className="text-red-400">📞</span>
                  <span>{phoneLossText}</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-black opacity-90">AGB</span>
              </div>
            </div>
          </div>
        )}

        {/* VERSO CARD (Back: ONLY QR CODE) */}
        {(activeSide === 'verso' || activeSide === 'both') && (
          <div className="w-full flex flex-col items-center space-y-1.5">
            <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              <span>Face Verso (Arrière)</span>
              <span className="text-[10px] text-emerald-600 font-semibold">100% QR Code Dynamique</span>
            </div>

            <div
              style={getCardStyle(true)}
              className="w-full max-w-[340px] sm:max-w-[360px] aspect-[85/55] rounded-3xl border border-slate-300/80 p-4 sm:p-5 flex flex-col items-center justify-between relative select-none transition-all duration-300 shadow-xl overflow-hidden"
            >
              {/* Centered High-Definition QR Code in White Rounded Box with Banner */}
              <div className="p-3 bg-white rounded-3xl shadow-md border border-slate-200/80 flex flex-col items-center justify-center max-w-[75%] my-auto">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Verso"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-xs text-slate-400">
                    Chargement QR...
                  </div>
                )}
                
                {/* Yellow / Beige instruction banner under QR code */}
                <div className="mt-1.5 px-2 py-0.5 bg-amber-100 text-amber-950 font-black text-[7.5px] sm:text-[8px] uppercase tracking-wide rounded-sm text-center border border-amber-200/80 w-full">
                  SCANNEZ POUR CONTACTER {companyName || 'CANAAN SERVICES'}
                </div>
              </div>

              {/* Bottom centered bold white subtitle */}
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-100 text-center pb-1">
                SCANNEZ POUR LA FICHE COMPLÈTE & COORDONNÉES
              </span>
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
