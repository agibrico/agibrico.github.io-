import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Share2, 
  ShoppingBag, 
  Image as ImageIcon, 
  Calendar, 
  MapPin, 
  Globe, 
  Sparkles, 
  Plus, 
  Trash2, 
  Lock, 
  Check, 
  Palette, 
  Upload, 
  Clock, 
  Shield, 
  Sliders, 
  Layers, 
  ArrowRight, 
  Eye, 
  Save, 
  X,
  FileCode,
  Info,
  BookOpen,
  Store,
  Navigation,
  CheckCircle2,
  Smartphone,
  Printer,
  CalendarDays,
  Hash,
  Languages,
  DollarSign,
  ShoppingCart,
  Facebook,
  Instagram,
  Truck,
  Wallet,
  Package,
  MapPinned,
  LocateFixed,
  Linkedin,
  Youtube,
  FileText,
  Briefcase,
  Twitter,
  Send
} from 'lucide-react';
import { 
  QRCodeItem, 
  QRType, 
  QRMode, 
  QRStyling, 
  QRContent, 
  CustomField, 
  SocialLink, 
  OpeningHourDay 
} from '../../types/qr';
import { generateSecurePublicId, getPublicQRUrl, saveOrUpdateQRCode } from '../../utils/storage';
import { QRScannabilityCheck } from '../preview/QRScannabilityCheck';
import { generateVCardString } from '../../utils/vcard';
import { OpeningHoursEditor } from './OpeningHoursEditor';

interface QREditorProps {
  initialItem?: QRCodeItem | null;
  onSave: (item: QRCodeItem) => void;
  onCancel: () => void;
  onOpenPrintStudio?: (item: QRCodeItem) => void;
  onOpenSimulator?: (item: QRCodeItem) => void;
}

const DEFAULT_DAYS: OpeningHourDay[] = [
  { day: 'Lundi', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Mardi', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Mercredi', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Jeudi', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Vendredi', isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { day: 'Samedi', isOpen: true, openTime: '09:00', closeTime: '16:00' },
  { day: 'Dimanche', isOpen: false, openTime: '10:00', closeTime: '14:00' },
];

export const QREditor: React.FC<QREditorProps> = ({
  initialItem,
  onSave,
  onCancel,
  onOpenPrintStudio,
  onOpenSimulator
}) => {
  const isEditing = Boolean(initialItem);

  // Core metadata
  const [title, setTitle] = useState(initialItem?.title || 'Nouvelle Fiche Contact');
  const [type, setType] = useState<QRType>(initialItem?.type || 'vcard');
  const [mode, setMode] = useState<QRMode>(initialItem?.mode || 'dynamic');
  const [publicId] = useState<string>(initialItem?.publicId || generateSecurePublicId());
  
  // Editor navigation tab
  const [activeStep, setActiveStep] = useState<'content' | 'logo' | 'social' | 'business' | 'style' | 'settings'>('content');

  // Content state
  const [content, setContent] = useState<QRContent>(
    initialItem?.content || {
      firstName: '',
      lastName: '',
      fullName: '',
      jobTitle: '',
      company: '',
      department: '',
      industry: '',
      bio: '',
      photoUrl: '',
      logoUrl: '',
      bannerUrl: '',
      primaryPhone: '',
      secondaryPhone: '',
      whatsappNumber: '',
      email: '',
      websiteUrl: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      latitude: undefined,
      longitude: undefined,
      googleMapsUrl: '',
      businessTaxId: '',
      businessRegisterNumber: '',
      openingHours: DEFAULT_DAYS,
      servicesList: [],
      socialLinks: [
        { id: '1', platform: 'linkedin', url: '', displayOrder: 1 },
        { id: '2', platform: 'whatsapp', url: '', displayOrder: 2 },
        { id: '3', platform: 'instagram', url: '', displayOrder: 3 }
      ],
      customFields: [],
      privacy: {
        hideAddress: false,
        hideSecondaryPhone: false,
        hideTaxInfo: false,
        requirePassword: false,
        accessPassword: ''
      }
    }
  );

  // QR Styling state
  const [styling, setStyling] = useState<QRStyling>(
    initialItem?.styling || {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      transparentBg: false,
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColor: '#4f46e5',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 360,
      logoUrl: '',
      logoSizeRatio: 0.22,
      logoBackground: true,
      logoBgColor: '#ffffff',
      logoBorderRadius: 8,
      bottomText: 'SCANNEZ POUR ENREGISTRER',
      bottomTextColor: '#0f172a',
      bottomTextBg: '#f1f5f9'
    }
  );

  // Handlers for Content
  const updateContentField = <K extends keyof QRContent>(key: K, value: QRContent[K]) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const updateStylingField = <K extends keyof QRStyling>(key: K, value: QRStyling[K]) => {
    setStyling(prev => ({ ...prev, [key]: value }));
  };

  // Add / Remove social link
  const addSocialLink = () => {
    const newSocial: SocialLink = {
      id: `s_${Date.now()}`,
      platform: 'website',
      url: '',
      displayOrder: content.socialLinks.length + 1
    };
    setContent(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newSocial]
    }));
  };

  const removeSocialLink = (id: string) => {
    setContent(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(s => s.id !== id)
    }));
  };

  const updateSocialLink = (id: string, platform: SocialLink['platform'], url: string) => {
    setContent(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(s => s.id === id ? { ...s, platform, url } : s)
    }));
  };

  // Services list helper
  const [newServiceInput, setNewServiceInput] = useState('');

  const addService = (serviceText?: string) => {
    const textToAdd = (serviceText || newServiceInput).trim();
    if (!textToAdd) return;
    const currentList = content.servicesList || [];
    if (!currentList.includes(textToAdd)) {
      updateContentField('servicesList', [...currentList, textToAdd]);
    }
    setNewServiceInput('');
  };

  const removeService = (index: number) => {
    const currentList = content.servicesList || [];
    updateContentField('servicesList', currentList.filter((_, i) => i !== index));
  };

  // Add / Remove custom field
  const addCustomField = () => {
    const newField: CustomField = {
      id: `cf_${Date.now()}`,
      label: 'Nouveau champ',
      value: '',
      type: 'text'
    };
    setContent(prev => ({
      ...prev,
      customFields: [...prev.customFields, newField]
    }));
  };

  const removeCustomField = (id: string) => {
    setContent(prev => ({
      ...prev,
      customFields: prev.customFields.filter(f => f.id !== id)
    }));
  };

  const updateCustomField = (id: string, label: string, value: string, isPrivate: boolean = false) => {
    setContent(prev => ({
      ...prev,
      customFields: prev.customFields.map(f => f.id === id ? { ...f, label, value, isPrivate } : f)
    }));
  };

  const updateOpeningHour = (index: number, field: keyof OpeningHourDay, value: any) => {
    const currentHours = content.openingHours || DEFAULT_DAYS;
    const newHours = [...currentHours];
    newHours[index] = { ...newHours[index], [field]: value };
    updateContentField('openingHours', newHours);
  };

  // Image Upload helper (compress & scale to Base64)
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    target: 'photo' | 'logo' | 'banner'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'photo') {
        updateContentField('photoUrl', dataUrl);
      } else if (target === 'logo') {
        updateContentField('logoUrl', dataUrl);
        updateStylingField('logoUrl', dataUrl);
        updateStylingField('errorCorrectionLevel', 'H');
      } else if (target === 'banner') {
        updateContentField('bannerUrl', dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Real-time synchronization state
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('À l\'instant');

  // Helper to build the unified current card item
  const getCurrentItem = (): QRCodeItem => ({
    id: initialItem?.id || `qr_${publicId.toLowerCase()}`,
    publicId,
    cardNumber: initialItem?.cardNumber || `AGB-CARD-${publicId.substring(0, 6)}`,
    clientId: initialItem?.clientId,
    title: title.trim() || `${content.firstName || ''} ${content.lastName || ''}`.trim() || 'Carte Connectée AGB',
    type,
    mode,
    status: initialItem?.status || 'active',
    modelId: initialItem?.modelId || 'model_luxury',
    cardFormat: initialItem?.cardFormat || '85x55',
    createdAt: initialItem?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scanCount: initialItem?.scanCount || 0,
    content,
    styling,
  });

  // Automatically register and sync data in the background upon every field edit
  // This guarantees that if anyone scans the QR Code on screen right now, the phone finds all entered data immediately!
  useEffect(() => {
    const item = getCurrentItem();
    saveOrUpdateQRCode(item, true);
    setLastSavedTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [title, type, mode, content, styling]);

  // Final data string encoded into the QR:
  // In dynamic mode: the short URL (https://domain/#q/PUBLIC_ID?d=PAYLOAD)
  // In static mode: raw vCard string or direct URL
  const qrEncodedData = mode === 'dynamic' 
    ? getPublicQRUrl(publicId, getCurrentItem())
    : type === 'vcard'
      ? generateVCardString(content)
      : content.websiteUrl || getPublicQRUrl(publicId, getCurrentItem());

  // Explicit Save and Return
  const handleSave = () => {
    if (type === 'book' && (!content.bookTitle?.trim() || !content.bookAuthor?.trim())) {
      alert("Veuillez renseigner au moins le titre du livre et l'auteur.");
      return;
    }

    if (type === 'shop' && (!content.shopName?.trim() && !content.company?.trim())) {
      alert("Veuillez renseigner au moins le nom du commerce.");
      return;
    }

    if (type !== 'book' && type !== 'shop' && !title.trim() && !content.firstName && !content.company) {
      alert("Veuillez renseigner au moins un prénom, un nom ou une entreprise pour votre carte.");
      return;
    }

    const itemToSave = getCurrentItem();
    saveOrUpdateQRCode(itemToSave, true);
    setShowSavedToast(true);

    // Auto-clear if creating new (no initialItem)
    if (!initialItem) {
      setTitle('');
      setType('vcard');
      setMode('dynamic');
      setContent({
        firstName: '',
        lastName: '',
        fullName: '',
        jobTitle: '',
        company: '',
        department: '',
        industry: '',
        bio: '',
        photoUrl: '',
        logoUrl: '',
        bannerUrl: '',
        primaryPhone: '',
        secondaryPhone: '',
        whatsappNumber: '',
        email: '',
        websiteUrl: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        latitude: undefined,
        longitude: undefined,
        googleMapsUrl: '',
        businessTaxId: '',
        businessRegisterNumber: '',
        openingHours: DEFAULT_DAYS,
        servicesList: [],
        socialLinks: [
          { id: '1', platform: 'linkedin', url: '', displayOrder: 1 },
          { id: '2', platform: 'whatsapp', url: '', displayOrder: 2 },
          { id: '3', platform: 'instagram', url: '', displayOrder: 3 }
        ],
        customFields: [],
        privacy: {
          hideAddress: false,
          hideSecondaryPhone: false,
          hideTaxInfo: false,
          requirePassword: false,
          accessPassword: ''
        }
      });
    }

    setTimeout(() => {
      onSave(itemToSave);
    }, 600);
  };

  // Explicit Save in-place (keeps editor open with confirmation toast)
  const handleSaveInPlace = () => {
    const itemToSave = getCurrentItem();
    saveOrUpdateQRCode(itemToSave, true);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 4000);
  };

  const qrTypesList: { type: QRType; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    { type: 'vcard', label: 'Carte de Visite', desc: 'Contact pro, vCard 3.0, 1-clic mobile', icon: User },
    { type: 'book', label: 'Fiche de Livre', desc: 'Auteur, éditeur, résumé, couverture & ISBN', icon: BookOpen },
    { type: 'invitation', label: 'Invitation Événement', desc: 'Mariage, gala, soirée prestige & RSVP', icon: Calendar },
    { type: 'shop', label: 'Commerce & Boutique', desc: 'Horaires d\'ouverture, boutique & GPS', icon: Store },
    { type: 'location', label: 'Localisation & GPS', desc: 'Position géographique, Waze & Google Maps', icon: Navigation },
    { type: 'business', label: 'Entreprise & Société', desc: 'RCCM, horaires, catalogue & services', icon: Building2 },
    { type: 'social', label: 'Bio & Réseaux', desc: 'Mini page Linktree, photo & liens personnalisés', icon: Share2 },
    { type: 'product', label: 'Produit & Menu', desc: 'Restaurant, prix, description & commande', icon: ShoppingBag },
    { type: 'url', label: 'Lien Web Simple', desc: 'Redirection vers une page externe', icon: Globe },
    { type: 'custom', label: 'Fiche Personnalisée', desc: 'Champs dynamiques entièrement libres', icon: Sparkles },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-28 relative">
      
      {/* Toast Notification when saved */}
      {showSavedToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <div className="text-xs font-semibold">
            <span className="font-bold block">Carte enregistrée dans l'application !</span>
            <span className="text-emerald-100 text-[11px]">Toutes les informations sont sauvegardées et le QR Code est opérationnel.</span>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl shadow-xs">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-100">
              {mode === 'dynamic' ? 'Mode Dynamique' : 'Mode Statique'}
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {publicId}</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Enregistrement automatique actif ({lastSavedTime})</span>
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nom de votre fiche (ex: Alexandre Durand - Carte Pro)"
            className="text-lg sm:text-2xl font-black text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-600 focus:outline-none w-full max-w-md transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSaveInPlace}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-full transition-all cursor-pointer"
            title="Enregistrer sans quitter l'éditeur"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Enregistrer</span>
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Enregistrer & Quitter' : 'Enregistrer dans l\'application'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Dynamic Update Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-blue-900 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block text-slate-900">Synchronisation vCard Dynamique AGB</span>
            <span className="text-slate-600">Vous pouvez modifier, ajouter ou retirer des informations à volonté. Le QR Code physique existant reste 100% identique et affichera automatiquement ces nouvelles données lors des futurs scans.</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Editor & Right Live Scannability Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Tabs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
            {[
              { id: 'content', label: '1. Contenu', icon: User },
              { id: 'logo', label: '2. Logo & Visuels', icon: ImageIcon },
              { id: 'social', label: '3. Réseaux', icon: Share2 },
              { id: 'business', label: '4. Entreprise', icon: Building2 },
              { id: 'style', label: '5. Personnalisation', icon: Palette },
              { id: 'settings', label: '6. Options', icon: Sliders },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeStep === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStep(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Cards */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* STEP 1: Content & Type */}
            {activeStep === 'content' && (
              <div className="space-y-6">
                
                {/* QR Type Selector Grid */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Type de Contenu
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {qrTypesList.map(item => {
                      const Icon = item.icon;
                      const isSelected = type === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setType(item.type)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/20'
                              : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{item.label}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{item.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SPECIALIZED FORM SECTION FOR BOOK */}
                {type === 'book' && (
                  <div className="space-y-6 pt-4 border-t border-indigo-100 bg-indigo-50/40 p-5 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Fiche de Livre Officielle</h4>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Édition AGB</span>
                    </div>

                    {/* Couverture */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-2xl bg-white/60 space-y-3">
                      {content.bookCoverUrl ? (
                        <div className="relative group">
                          <img src={content.bookCoverUrl} className="w-32 h-44 object-cover rounded-lg shadow-md" />
                          <button
                            onClick={() => updateContentField('bookCoverUrl', '')}
                            className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Couverture du livre (Facultatif)</p>
                          <label className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                            Choisir une image
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => updateContentField('bookCoverUrl', ev.target?.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Titre du livre *</label>
                        <input
                          type="text"
                          required
                          value={content.bookTitle || ''}
                          onChange={e => updateContentField('bookTitle', e.target.value)}
                          placeholder="L'ingénierie du Succès"
                          className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Sous-titre</label>
                        <input
                          type="text"
                          value={content.bookSubtitle || ''}
                          onChange={e => updateContentField('bookSubtitle', e.target.value)}
                          placeholder="Guide complet du QR Code"
                          className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Auteur Principal *</label>
                        <input
                          type="text"
                          required
                          value={content.bookAuthor || ''}
                          onChange={e => updateContentField('bookAuthor', e.target.value)}
                          placeholder="Nom de l'auteur"
                          className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Co-auteur(s)</label>
                        <input
                          type="text"
                          value={content.bookCoAuthor || ''}
                          onChange={e => updateContentField('bookCoAuthor', e.target.value)}
                          placeholder="Noms des co-auteurs"
                          className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Éditeur</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-2.5 w-3.5 h-3.5 text-indigo-400" />
                          <input
                            type="text"
                            value={content.bookPublisher || ''}
                            onChange={e => updateContentField('bookPublisher', e.target.value)}
                            placeholder="Maison d'édition"
                            className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">ISBN</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-2.5 w-3.5 h-3.5 text-indigo-400" />
                          <input
                            type="text"
                            value={content.bookIsbn || ''}
                            onChange={e => updateContentField('bookIsbn', e.target.value)}
                            placeholder="978-..."
                            className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-slate-800 focus:border-indigo-600 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Publication</label>
                        <div className="relative">
                          <CalendarDays className="absolute left-3 top-2.5 w-3.5 h-3.5 text-indigo-400" />
                          <input
                            type="text"
                            value={content.bookYear || ''}
                            onChange={e => updateContentField('bookYear', e.target.value)}
                            placeholder="Ex: 2026"
                            className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Genre</label>
                        <input
                          type="text"
                          value={content.bookGenre || ''}
                          onChange={e => updateContentField('bookGenre', e.target.value)}
                          placeholder="Ex: Roman, Essai..."
                          className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Langue</label>
                        <div className="relative">
                          <Languages className="absolute left-3 top-2.5 w-3.5 h-3.5 text-indigo-400" />
                          <input
                            type="text"
                            value={content.bookLanguage || ''}
                            onChange={e => updateContentField('bookLanguage', e.target.value)}
                            placeholder="Ex: Français"
                            className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Pages</label>
                        <input
                          type="number"
                          value={content.bookPages || ''}
                          onChange={e => updateContentField('bookPages', e.target.value)}
                          placeholder="320"
                          className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Prix</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 w-3.5 h-3.5 text-indigo-400" />
                            <input
                              type="text"
                              value={content.bookPrice || ''}
                              onChange={e => updateContentField('bookPrice', e.target.value)}
                              placeholder="15000"
                              className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Devise</label>
                          <input
                            type="text"
                            value={content.bookCurrency || 'FCFA'}
                            onChange={e => updateContentField('bookCurrency', e.target.value)}
                            placeholder="FCFA"
                            className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Disponibilité</label>
                        <select
                          value={content.bookAvailability || 'available'}
                          onChange={e => updateContentField('bookAvailability', e.target.value)}
                          className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-none appearance-none"
                        >
                          <option value="available">Disponible</option>
                          <option value="out_of_stock">Épuisé</option>
                          <option value="preorder">En précommande</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Tél. Commande</label>
                        <input
                          type="tel"
                          value={content.bookOrderPhone || ''}
                          onChange={e => updateContentField('bookOrderPhone', e.target.value)}
                          placeholder="+225..."
                          className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">WhatsApp</label>
                        <input
                          type="tel"
                          value={content.bookWhatsapp || ''}
                          onChange={e => updateContentField('bookWhatsapp', e.target.value)}
                          placeholder="+225..."
                          className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Lien d'achat (URL)</label>
                      <div className="relative">
                        <ShoppingCart className="absolute left-3 top-2.5 w-3.5 h-3.5 text-indigo-400" />
                        <input
                          type="url"
                          value={content.bookBuyUrl || ''}
                          onChange={e => updateContentField('bookBuyUrl', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Site Auteur / Éditeur</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-indigo-400" />
                        <input
                          type="url"
                          value={content.bookWebsite || ''}
                          onChange={e => updateContentField('bookWebsite', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Résumé du livre</label>
                      <textarea
                        rows={4}
                        value={content.bookSummary || ''}
                        onChange={e => updateContentField('bookSummary', e.target.value)}
                        placeholder="Quatrième de couverture, résumé, thèmes abordés..."
                        className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1.5">Autres informations</label>
                      <textarea
                        rows={3}
                        value={content.otherInformation || ''}
                        onChange={e => updateContentField('otherInformation', e.target.value)}
                        placeholder="Informations complémentaires, dédicaces, événements à venir..."
                        className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs font-medium text-slate-800 focus:border-indigo-600 focus:outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR SOCIAL / BIO (LINKTREE STYLE) */}
                {type === 'social' && (
                  <div className="space-y-6 pt-4 border-t border-indigo-100 bg-indigo-50/40 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Profil Bio & Réseaux</h4>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Multi-liens</span>
                    </div>

                    {/* Photo de Profil / Avatar */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-full w-32 h-32 mx-auto bg-white space-y-2 overflow-hidden">
                      {content.photoUrl ? (
                        <div className="relative group w-full h-full">
                          <img src={content.photoUrl} className="w-full h-full object-cover" />
                          <button onClick={() => updateContentField('photoUrl', '')} className="absolute inset-0 flex items-center justify-center bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                          <User className="w-8 h-8 text-indigo-200 mb-1" />
                          <span className="text-[8px] font-black text-indigo-400 uppercase">Photo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => updateContentField('photoUrl', ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Nom affiché *</label>
                        <input type="text" required value={content.socialDisplayName || content.fullName || ''} onChange={e => {updateContentField('socialDisplayName', e.target.value); updateContentField('fullName', e.target.value);}} placeholder="Votre nom ou marque" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Pseudo / Username</label>
                        <input type="text" value={content.socialNickname || ''} onChange={e => updateContentField('socialNickname', e.target.value)} placeholder="@pseudo" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Profession / Activité</label>
                        <input type="text" value={content.socialProfession || content.jobTitle || ''} onChange={e => {updateContentField('socialProfession', e.target.value); updateContentField('jobTitle', e.target.value);}} placeholder="Ex: Créateur de contenu" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Entreprise</label>
                        <input type="text" value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom de votre structure" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Bio / Présentation Courte</label>
                      <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Dites-en plus sur vous en quelques lignes..." className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                    </div>

                    {/* Réseaux Sociaux Dédiés */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Directs</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative"><Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" /><input type="url" value={content.socialFacebookUrl || ''} onChange={e => updateContentField('socialFacebookUrl', e.target.value)} placeholder="Facebook" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" /><input type="url" value={content.socialInstagramUrl || ''} onChange={e => updateContentField('socialInstagramUrl', e.target.value)} placeholder="Instagram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><span className="absolute left-3 top-2.5 text-[9px] font-bold">Tik</span><input type="url" value={content.socialTikTokUrl || ''} onChange={e => updateContentField('socialTikTokUrl', e.target.value)} placeholder="TikTok" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" /><input type="url" value={content.socialYouTubeUrl || ''} onChange={e => updateContentField('socialYouTubeUrl', e.target.value)} placeholder="YouTube" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" /><input type="url" value={content.socialLinkedInUrl || ''} onChange={e => updateContentField('socialLinkedInUrl', e.target.value)} placeholder="LinkedIn" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Twitter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-500" /><input type="url" value={content.socialTwitterUrl || ''} onChange={e => updateContentField('socialTwitterUrl', e.target.value)} placeholder="X / Twitter" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Send className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-600" /><input type="url" value={content.socialTelegramUrl || ''} onChange={e => updateContentField('socialTelegramUrl', e.target.value)} placeholder="Telegram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-500" /><input type="url" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} placeholder="WhatsApp" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                      </div>
                    </div>

                    {/* Liens Personnalisés Libres */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Liens Personnalisés Libres</h5>
                        <button type="button" onClick={addSocialLink} className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-sm">+ Ajouter un lien</button>
                      </div>

                      <div className="space-y-3">
                        {content.socialLinks.map((link) => (
                          <div key={link.id} className="p-3 bg-white border border-indigo-100 rounded-2xl flex gap-3 items-start shadow-xs">
                            <div className="flex-1 space-y-2">
                              <input type="text" value={link.label || ''} onChange={e => {
                                const newLinks = content.socialLinks.map(l => l.id === link.id ? {...l, label: e.target.value} : l);
                                updateContentField('socialLinks', newLinks);
                              }} placeholder="Titre (ex: Mon Catalogue, Ma Boutique...)" className="w-full border-b border-slate-100 text-[11px] font-bold text-slate-800 outline-none pb-1" />
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-slate-400" />
                                <input type="url" value={link.url} onChange={e => updateSocialLink(link.id, link.platform, e.target.value)} placeholder="https://..." className="w-full text-[10px] text-indigo-600 outline-none" />
                              </div>
                            </div>
                            <button onClick={() => removeSocialLink(link.id)} className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR BUSINESS / SOCIÉTÉ */}
                {type === 'business' && (
                  <div className="space-y-6 pt-4 border-t border-slate-200 bg-slate-50/80 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Identification de la Société</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutionnel</span>
                    </div>

                    {/* Logo & Juridique */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-white space-y-3">
                        {content.logoUrl ? (
                          <div className="relative group">
                            <img src={content.logoUrl} className="w-24 h-24 object-contain" />
                            <button onClick={() => {updateContentField('logoUrl', ''); updateStylingField('logoUrl', '');}} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center cursor-pointer">
                            <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Logo Officiel</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  const url = ev.target?.result as string;
                                  updateContentField('logoUrl', url);
                                  updateStylingField('logoUrl', url);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} />
                          </label>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">Raison Sociale *</label>
                          <input type="text" required value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom officiel de l'entreprise" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:border-blue-600 outline-none shadow-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nom Commercial</label>
                          <input type="text" value={content.commercialName || ''} onChange={e => updateContentField('commercialName', e.target.value)} placeholder="Nom public (si différent)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-800 outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Forme Juridique</label>
                        <input type="text" value={content.businessType || ''} onChange={e => updateContentField('businessType', e.target.value)} placeholder="SARL, SA..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">RCCM</label>
                        <input type="text" value={content.businessRegisterNumber || ''} onChange={e => updateContentField('businessRegisterNumber', e.target.value)} placeholder="CI-ABJ-..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Compte Contribuable</label>
                        <input type="text" value={content.businessTaxId || ''} onChange={e => updateContentField('businessTaxId', e.target.value)} placeholder="N° CC" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Création</label>
                        <input type="text" value={content.businessCreationYear || ''} onChange={e => updateContentField('businessCreationYear', e.target.value)} placeholder="Ex: 2012" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Capital Social</label>
                        <input type="text" value={content.businessCapital || ''} onChange={e => updateContentField('businessCapital', e.target.value)} placeholder="Ex: 1 000 000 FCFA" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    {/* Activité */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Activité & Expertise</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Secteur d'activité</label>
                          <input type="text" value={content.industry || ''} onChange={e => updateContentField('industry', e.target.value)} placeholder="Ex: BTP, Conseil, IT..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Activité Principale</label>
                          <input type="text" value={content.businessMainActivity || ''} onChange={e => updateContentField('businessMainActivity', e.target.value)} placeholder="Ex: Construction d'infrastructures" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Description de la Société</label>
                        <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Présentation institutionnelle..." className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Produits</label>
                          <textarea rows={2} value={(content.productsList || []).join('\n')} onChange={e => updateContentField('productsList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Services</label>
                          <textarea rows={2} value={(content.servicesList || []).join('\n')} onChange={e => updateContentField('servicesList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Marques représentées</label>
                          <textarea rows={2} value={(content.brandsRepresented || []).join('\n')} onChange={e => updateContentField('brandsRepresented', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Responsable */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/40 p-4 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Direction / Responsable</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Nom du Responsable</label>
                          <input type="text" value={content.businessManagerName || ''} onChange={e => updateContentField('businessManagerName', e.target.value)} placeholder="Prénom Nom" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Fonction</label>
                          <input type="text" value={content.jobTitle || ''} onChange={e => updateContentField('jobTitle', e.target.value)} placeholder="Directeur Général, Gérant..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Responsable</label>
                          <input type="tel" value={content.businessManagerPhone || ''} onChange={e => updateContentField('businessManagerPhone', e.target.value)} placeholder="+225..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail Responsable</label>
                          <input type="email" value={content.businessManagerEmail || ''} onChange={e => updateContentField('businessManagerEmail', e.target.value)} placeholder="email@pro.com" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Coordonnées & GPS */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Coordonnées du Siège</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Siège</label>
                          <input type="tel" value={content.primaryPhone || ''} onChange={e => updateContentField('primaryPhone', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">WhatsApp Siège</label>
                          <input type="tel" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail général</label>
                          <input type="email" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Site internet</label>
                          <input type="url" value={content.websiteUrl || ''} onChange={e => updateContentField('websiteUrl', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Adresse du Siège</label>
                        <input type="text" value={content.address || ''} onChange={e => updateContentField('address', e.target.value)} placeholder="Immeuble, Rue, Commune..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>

                      <div className="p-4 bg-slate-800 rounded-2xl text-white space-y-3 shadow-lg shadow-blue-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <LocateFixed className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Position GPS du Siège</span>
                          </div>
                          <button type="button" onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                updateContentField('locationLatitude', pos.coords.latitude);
                                updateContentField('locationLongitude', pos.coords.longitude);
                              }, (err) => alert("Géoloc : " + err.message));
                            }
                          }} className="px-3 py-1 bg-white text-slate-900 text-[9px] font-black uppercase rounded-full hover:bg-blue-50 transition-colors shadow-sm">📍 Ma Position</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" step="any" value={content.locationLatitude || ''} onChange={e => updateContentField('locationLatitude', parseFloat(e.target.value))} placeholder="Latitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                          <input type="number" step="any" value={content.locationLongitude || ''} onChange={e => updateContentField('locationLongitude', parseFloat(e.target.value))} placeholder="Longitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                        </div>
                      </div>
                    </div>

                    {/* Documents & Liens */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/60 p-4 rounded-2xl shadow-inner">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Documents & Présentation</h5>
                      <div className="space-y-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Catalogue</span>
                          <input type="url" value={content.businessCatalogueUrl || ''} onChange={e => updateContentField('businessCatalogueUrl', e.target.value)} placeholder="Lien vers le catalogue PDF public" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Brochure</span>
                          <input type="url" value={content.businessBrochureUrl || ''} onChange={e => updateContentField('businessBrochureUrl', e.target.value)} placeholder="Lien vers la brochure PDF publique" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Société</span>
                          <input type="url" value={content.businessPresentationUrl || ''} onChange={e => updateContentField('businessPresentationUrl', e.target.value)} placeholder="Lien vers présentation entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <p className="text-[10px] text-rose-500 font-bold italic leading-relaxed">⚠️ Note de sécurité : Ne renseignez que des liens vers des documents publics hébergés sur internet (Cloud, Dropbox, Site web). Les documents confidentiels ne doivent pas être liés ici.</p>
                      </div>
                    </div>

                    {/* Réseaux Sociaux Business */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Professionnels</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" />
                          <input type="url" value={content.businessLinkedInUrl || ''} onChange={e => updateContentField('businessLinkedInUrl', e.target.value)} placeholder="LinkedIn Entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-700" />
                        </div>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" />
                          <input type="url" value={content.businessYouTubeUrl || ''} onChange={e => updateContentField('businessYouTubeUrl', e.target.value)} placeholder="Chaîne YouTube" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-red-600" />
                        </div>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" />
                          <input type="url" value={content.businessFacebookUrl || ''} onChange={e => updateContentField('businessFacebookUrl', e.target.value)} placeholder="Page Facebook" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" />
                          <input type="url" value={content.businessInstagramUrl || ''} onChange={e => updateContentField('businessInstagramUrl', e.target.value)} placeholder="Profil Instagram" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-rose-500" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-[10px] font-black text-slate-900">Tik</span>
                          <input type="url" value={content.businessTikTokUrl || ''} onChange={e => updateContentField('businessTikTokUrl', e.target.value)} placeholder="Compte TikTok" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR LOCATION / GPS */}
                {type === 'location' && (
                  <div className="space-y-6 pt-4 border-t border-blue-100 bg-blue-50/40 p-5 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                          <MapPinned className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">Localisation & GPS</h4>
                      </div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Navigation Directe</span>
                    </div>

                    {/* Photo du lieu */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 rounded-2xl bg-white/60 space-y-3">
                      {content.locationPhotoUrl ? (
                        <div className="relative group">
                          <img src={content.locationPhotoUrl} className="w-full max-h-48 object-cover rounded-lg shadow-md" />
                          <button
                            onClick={() => updateContentField('locationPhotoUrl', '')}
                            className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Photo du lieu (Facultatif)</p>
                          <label className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                            Choisir une photo
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => updateContentField('locationPhotoUrl', ev.target?.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Nom du lieu *</label>
                        <input
                          type="text"
                          required
                          value={content.locationPlaceName || ''}
                          onChange={e => updateContentField('locationPlaceName', e.target.value)}
                          placeholder="Ex: Siège AGB, Entrepôt Principal..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Type de lieu</label>
                        <input
                          type="text"
                          value={content.locationPlaceType || ''}
                          onChange={e => updateContentField('locationPlaceType', e.target.value)}
                          placeholder="Bureaux, Magasin, Dépôt..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Pays</label>
                        <input
                          type="text"
                          value={content.locationCountry || 'Côte d\'Ivoire'}
                          onChange={e => updateContentField('locationCountry', e.target.value)}
                          placeholder="Côte d'Ivoire"
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Ville (Recommandé)</label>
                        <input
                          type="text"
                          value={content.locationCity || ''}
                          onChange={e => updateContentField('locationCity', e.target.value)}
                          placeholder="Abidjan, Yamoussoukro..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Commune / Ville</label>
                        <input
                          type="text"
                          value={content.locationCommune || ''}
                          onChange={e => updateContentField('locationCommune', e.target.value)}
                          placeholder="Cocody, Marcory..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Quartier</label>
                        <input
                          type="text"
                          value={content.locationNeighborhood || ''}
                          onChange={e => updateContentField('locationNeighborhood', e.target.value)}
                          placeholder="Riviera 3, Angré..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Adresse exacte</label>
                      <input
                        type="text"
                        value={content.locationAddress || ''}
                        onChange={e => updateContentField('locationAddress', e.target.value)}
                        placeholder="Rue, lot, porte..."
                        className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Section GPS Automatique */}
                    <div className="p-5 bg-blue-600 rounded-3xl text-white space-y-4 shadow-lg shadow-blue-900/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LocateFixed className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Coordonnées GPS</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                updateContentField('locationLatitude', pos.coords.latitude);
                                updateContentField('locationLongitude', pos.coords.longitude);
                              }, (err) => alert("Impossible de récupérer la position : " + err.message));
                            } else {
                              alert("La géolocalisation n'est pas supportée par votre appareil.");
                            }
                          }}
                          className="px-3 py-1.5 bg-white text-blue-600 text-[10px] font-black uppercase rounded-full hover:bg-blue-50 transition-colors"
                        >
                          📍 Utiliser ma position actuelle
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-blue-100 uppercase mb-1">Latitude</label>
                          <input
                            type="number"
                            step="any"
                            value={content.locationLatitude || ''}
                            onChange={e => updateContentField('locationLatitude', parseFloat(e.target.value))}
                            className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-blue-100 uppercase mb-1">Longitude</label>
                          <input
                            type="number"
                            step="any"
                            value={content.locationLongitude || ''}
                            onChange={e => updateContentField('locationLongitude', parseFloat(e.target.value))}
                            className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Point de repère</label>
                        <input
                          type="text"
                          value={content.locationLandmark || ''}
                          onChange={e => updateContentField('locationLandmark', e.target.value)}
                          placeholder="Près de la pharmacie, en face de..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Horaires (Libre)</label>
                        <input
                          type="text"
                          value={content.locationOpeningHoursText || ''}
                          onChange={e => updateContentField('locationOpeningHoursText', e.target.value)}
                          placeholder="Ex: Lun-Ven 8h-18h"
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Description d'accès</label>
                      <textarea
                        rows={2}
                        value={content.locationAccessDescription || ''}
                        onChange={e => updateContentField('locationAccessDescription', e.target.value)}
                        placeholder="Détails pour arriver facilement (code porte, étage, etc.)"
                        className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Téléphone</label>
                        <input
                          type="tel"
                          value={content.locationPhone || ''}
                          onChange={e => updateContentField('locationPhone', e.target.value)}
                          placeholder="+225..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">WhatsApp</label>
                        <input
                          type="tel"
                          value={content.locationWhatsapp || ''}
                          onChange={e => updateContentField('locationWhatsapp', e.target.value)}
                          placeholder="+225..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR SOCIAL / BIO (LINKTREE STYLE) */}
                {type === 'social' && (
                  <div className="space-y-6 pt-4 border-t border-indigo-100 bg-indigo-50/40 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Profil Bio & Réseaux</h4>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Multi-liens</span>
                    </div>

                    {/* Photo de Profil / Avatar */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-full w-32 h-32 mx-auto bg-white space-y-2 overflow-hidden">
                      {content.photoUrl ? (
                        <div className="relative group w-full h-full">
                          <img src={content.photoUrl} className="w-full h-full object-cover" />
                          <button onClick={() => updateContentField('photoUrl', '')} className="absolute inset-0 flex items-center justify-center bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                          <User className="w-8 h-8 text-indigo-200 mb-1" />
                          <span className="text-[8px] font-black text-indigo-400 uppercase">Photo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => updateContentField('photoUrl', ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Nom affiché *</label>
                        <input type="text" required value={content.socialDisplayName || content.fullName || ''} onChange={e => {updateContentField('socialDisplayName', e.target.value); updateContentField('fullName', e.target.value);}} placeholder="Votre nom ou marque" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Pseudo / Username</label>
                        <input type="text" value={content.socialNickname || ''} onChange={e => updateContentField('socialNickname', e.target.value)} placeholder="@pseudo" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Profession / Activité</label>
                        <input type="text" value={content.socialProfession || content.jobTitle || ''} onChange={e => {updateContentField('socialProfession', e.target.value); updateContentField('jobTitle', e.target.value);}} placeholder="Ex: Créateur de contenu" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Entreprise</label>
                        <input type="text" value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom de votre structure" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Bio / Présentation Courte</label>
                      <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Dites-en plus sur vous en quelques lignes..." className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                    </div>

                    {/* Réseaux Sociaux Dédiés */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Directs</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative"><Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" /><input type="url" value={content.socialFacebookUrl || ''} onChange={e => updateContentField('socialFacebookUrl', e.target.value)} placeholder="Facebook" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" /><input type="url" value={content.socialInstagramUrl || ''} onChange={e => updateContentField('socialInstagramUrl', e.target.value)} placeholder="Instagram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><span className="absolute left-3 top-2.5 text-[9px] font-bold">Tik</span><input type="url" value={content.socialTikTokUrl || ''} onChange={e => updateContentField('socialTikTokUrl', e.target.value)} placeholder="TikTok" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" /><input type="url" value={content.socialYouTubeUrl || ''} onChange={e => updateContentField('socialYouTubeUrl', e.target.value)} placeholder="YouTube" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" /><input type="url" value={content.socialLinkedInUrl || ''} onChange={e => updateContentField('socialLinkedInUrl', e.target.value)} placeholder="LinkedIn" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Twitter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-500" /><input type="url" value={content.socialTwitterUrl || ''} onChange={e => updateContentField('socialTwitterUrl', e.target.value)} placeholder="X / Twitter" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Send className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-600" /><input type="url" value={content.socialTelegramUrl || ''} onChange={e => updateContentField('socialTelegramUrl', e.target.value)} placeholder="Telegram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-500" /><input type="url" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} placeholder="WhatsApp" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                      </div>
                    </div>

                    {/* Liens Personnalisés Libres */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Liens Personnalisés Libres</h5>
                        <button type="button" onClick={addSocialLink} className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-sm">+ Ajouter un lien</button>
                      </div>

                      <div className="space-y-3">
                        {content.socialLinks.map((link) => (
                          <div key={link.id} className="p-3 bg-white border border-indigo-100 rounded-2xl flex gap-3 items-start shadow-xs">
                            <div className="flex-1 space-y-2">
                              <input type="text" value={link.label || ''} onChange={e => {
                                const newLinks = content.socialLinks.map(l => l.id === link.id ? {...l, label: e.target.value} : l);
                                updateContentField('socialLinks', newLinks);
                              }} placeholder="Titre (ex: Mon Catalogue, Ma Boutique...)" className="w-full border-b border-slate-100 text-[11px] font-bold text-slate-800 outline-none pb-1" />
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-slate-400" />
                                <input type="url" value={link.url} onChange={e => updateSocialLink(link.id, link.platform, e.target.value)} placeholder="https://..." className="w-full text-[10px] text-indigo-600 outline-none" />
                              </div>
                            </div>
                            <button onClick={() => removeSocialLink(link.id)} className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR BUSINESS / SOCIÉTÉ */}
                {type === 'business' && (
                  <div className="space-y-6 pt-4 border-t border-slate-200 bg-slate-50/80 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Identification de la Société</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutionnel</span>
                    </div>

                    {/* Logo & Juridique */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-white space-y-3">
                        {content.logoUrl ? (
                          <div className="relative group">
                            <img src={content.logoUrl} className="w-24 h-24 object-contain" />
                            <button onClick={() => {updateContentField('logoUrl', ''); updateStylingField('logoUrl', '');}} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center cursor-pointer">
                            <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Logo Officiel</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  const url = ev.target?.result as string;
                                  updateContentField('logoUrl', url);
                                  updateStylingField('logoUrl', url);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} />
                          </label>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">Raison Sociale *</label>
                          <input type="text" required value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom officiel de l'entreprise" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:border-blue-600 outline-none shadow-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nom Commercial</label>
                          <input type="text" value={content.commercialName || ''} onChange={e => updateContentField('commercialName', e.target.value)} placeholder="Nom public (si différent)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-800 outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Forme Juridique</label>
                        <input type="text" value={content.businessType || ''} onChange={e => updateContentField('businessType', e.target.value)} placeholder="SARL, SA..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">RCCM</label>
                        <input type="text" value={content.businessRegisterNumber || ''} onChange={e => updateContentField('businessRegisterNumber', e.target.value)} placeholder="CI-ABJ-..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Compte Contribuable</label>
                        <input type="text" value={content.businessTaxId || ''} onChange={e => updateContentField('businessTaxId', e.target.value)} placeholder="N° CC" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Création</label>
                        <input type="text" value={content.businessCreationYear || ''} onChange={e => updateContentField('businessCreationYear', e.target.value)} placeholder="Ex: 2012" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Capital Social</label>
                        <input type="text" value={content.businessCapital || ''} onChange={e => updateContentField('businessCapital', e.target.value)} placeholder="Ex: 1 000 000 FCFA" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    {/* Activité */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Activité & Expertise</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Secteur d'activité</label>
                          <input type="text" value={content.industry || ''} onChange={e => updateContentField('industry', e.target.value)} placeholder="Ex: BTP, Conseil, IT..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Activité Principale</label>
                          <input type="text" value={content.businessMainActivity || ''} onChange={e => updateContentField('businessMainActivity', e.target.value)} placeholder="Ex: Construction d'infrastructures" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Description de la Société</label>
                        <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Présentation institutionnelle..." className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Produits</label>
                          <textarea rows={2} value={(content.productsList || []).join('\n')} onChange={e => updateContentField('productsList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Services</label>
                          <textarea rows={2} value={(content.servicesList || []).join('\n')} onChange={e => updateContentField('servicesList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Marques représentées</label>
                          <textarea rows={2} value={(content.brandsRepresented || []).join('\n')} onChange={e => updateContentField('brandsRepresented', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Responsable */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/40 p-4 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Direction / Responsable</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Nom du Responsable</label>
                          <input type="text" value={content.businessManagerName || ''} onChange={e => updateContentField('businessManagerName', e.target.value)} placeholder="Prénom Nom" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Fonction</label>
                          <input type="text" value={content.jobTitle || ''} onChange={e => updateContentField('jobTitle', e.target.value)} placeholder="Directeur Général, Gérant..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Responsable</label>
                          <input type="tel" value={content.businessManagerPhone || ''} onChange={e => updateContentField('businessManagerPhone', e.target.value)} placeholder="+225..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail Responsable</label>
                          <input type="email" value={content.businessManagerEmail || ''} onChange={e => updateContentField('businessManagerEmail', e.target.value)} placeholder="email@pro.com" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Coordonnées & GPS */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Coordonnées du Siège</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Siège</label>
                          <input type="tel" value={content.primaryPhone || ''} onChange={e => updateContentField('primaryPhone', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">WhatsApp Siège</label>
                          <input type="tel" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail général</label>
                          <input type="email" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Site internet</label>
                          <input type="url" value={content.websiteUrl || ''} onChange={e => updateContentField('websiteUrl', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Adresse du Siège</label>
                        <input type="text" value={content.address || ''} onChange={e => updateContentField('address', e.target.value)} placeholder="Immeuble, Rue, Commune..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>

                      <div className="p-4 bg-slate-800 rounded-2xl text-white space-y-3 shadow-lg shadow-blue-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <LocateFixed className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Position GPS du Siège</span>
                          </div>
                          <button type="button" onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                updateContentField('locationLatitude', pos.coords.latitude);
                                updateContentField('locationLongitude', pos.coords.longitude);
                              }, (err) => alert("Géoloc : " + err.message));
                            }
                          }} className="px-3 py-1 bg-white text-slate-900 text-[9px] font-black uppercase rounded-full hover:bg-blue-50 transition-colors shadow-sm">📍 Ma Position</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" step="any" value={content.locationLatitude || ''} onChange={e => updateContentField('locationLatitude', parseFloat(e.target.value))} placeholder="Latitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                          <input type="number" step="any" value={content.locationLongitude || ''} onChange={e => updateContentField('locationLongitude', parseFloat(e.target.value))} placeholder="Longitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                        </div>
                      </div>
                    </div>

                    {/* Documents & Liens */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/60 p-4 rounded-2xl shadow-inner">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Documents & Présentation</h5>
                      <div className="space-y-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Catalogue</span>
                          <input type="url" value={content.businessCatalogueUrl || ''} onChange={e => updateContentField('businessCatalogueUrl', e.target.value)} placeholder="Lien vers le catalogue PDF public" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Brochure</span>
                          <input type="url" value={content.businessBrochureUrl || ''} onChange={e => updateContentField('businessBrochureUrl', e.target.value)} placeholder="Lien vers la brochure PDF publique" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Société</span>
                          <input type="url" value={content.businessPresentationUrl || ''} onChange={e => updateContentField('businessPresentationUrl', e.target.value)} placeholder="Lien vers présentation entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <p className="text-[10px] text-rose-500 font-bold italic leading-relaxed">⚠️ Note de sécurité : Ne renseignez que des liens vers des documents publics hébergés sur internet (Cloud, Dropbox, Site web). Les documents confidentiels ne doivent pas être liés ici.</p>
                      </div>
                    </div>

                    {/* Réseaux Sociaux Business */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Professionnels</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" />
                          <input type="url" value={content.businessLinkedInUrl || ''} onChange={e => updateContentField('businessLinkedInUrl', e.target.value)} placeholder="LinkedIn Entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-700" />
                        </div>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" />
                          <input type="url" value={content.businessYouTubeUrl || ''} onChange={e => updateContentField('businessYouTubeUrl', e.target.value)} placeholder="Chaîne YouTube" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-red-600" />
                        </div>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" />
                          <input type="url" value={content.businessFacebookUrl || ''} onChange={e => updateContentField('businessFacebookUrl', e.target.value)} placeholder="Page Facebook" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" />
                          <input type="url" value={content.businessInstagramUrl || ''} onChange={e => updateContentField('businessInstagramUrl', e.target.value)} placeholder="Profil Instagram" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-rose-500" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-[10px] font-black text-slate-900">Tik</span>
                          <input type="url" value={content.businessTikTokUrl || ''} onChange={e => updateContentField('businessTikTokUrl', e.target.value)} placeholder="Compte TikTok" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR INVITATION */}
                {type === 'invitation' && (
                  <div className="space-y-6 pt-4 border-t border-amber-100 bg-amber-50/40 p-5 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">Détails de l'Invitation</h4>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Événement Certifié</span>
                    </div>

                    {/* Affiche de l'événement */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-200 rounded-2xl bg-white/60 space-y-3">
                      {content.invitationImageUrl ? (
                        <div className="relative group">
                          <img src={content.invitationImageUrl} className="w-full max-h-48 object-cover rounded-lg shadow-md" />
                          <button
                            onClick={() => updateContentField('invitationImageUrl', '')}
                            className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Affiche / Image de l'événement</p>
                          <label className="px-4 py-1.5 bg-amber-600 text-white text-[10px] font-bold rounded-full cursor-pointer hover:bg-amber-700 transition-colors">
                            Choisir une image
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => updateContentField('invitationImageUrl', ev.target?.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Nom de l'événement *</label>
                        <input
                          type="text"
                          required
                          value={content.invitationTitle || ''}
                          onChange={e => updateContentField('invitationTitle', e.target.value)}
                          placeholder="Ex: Gala de l'Innovation"
                          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-amber-600 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Type d'événement *</label>
                        <input
                          type="text"
                          required
                          value={content.invitationEventType || ''}
                          onChange={e => updateContentField('invitationEventType', e.target.value)}
                          placeholder="Mariage, Conférence, Anniversaire..."
                          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Organisateur</label>
                      <input
                        type="text"
                        value={content.invitationHost || ''}
                        onChange={e => updateContentField('invitationHost', e.target.value)}
                        placeholder="Nom de l'organisation ou de l'hôte"
                        className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-amber-600 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="col-span-1">
                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Date Début *</label>
                        <input
                          type="date"
                          required
                          value={content.invitationDate || ''}
                          onChange={e => updateContentField('invitationDate', e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Heure Début *</label>
                        <input
                          type="time"
                          required
                          value={content.invitationTime || ''}
                          onChange={e => updateContentField('invitationTime', e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Date Fin</label>
                        <input
                          type="date"
                          value={content.invitationEndDate || ''}
                          onChange={e => updateContentField('invitationEndDate', e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Heure Fin</label>
                        <input
                          type="time"
                          value={content.invitationEndTime || ''}
                          onChange={e => updateContentField('invitationEndTime', e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Lieu / Salle *</label>
                        <input
                          type="text"
                          required
                          value={content.invitationLocationName || ''}
                          onChange={e => updateContentField('invitationLocationName', e.target.value)}
                          placeholder="Nom de la salle ou du lieu"
                          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-amber-600 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Adresse</label>
                        <input
                          type="text"
                          value={content.invitationAddress || ''}
                          onChange={e => updateContentField('invitationAddress', e.target.value)}
                          placeholder="Adresse géographique complète"
                          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Position GPS (Lien Maps/Waze)</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-amber-400" />
                        <input
                          type="url"
                          value={content.invitationMapsUrl || ''}
                          onChange={e => updateContentField('invitationMapsUrl', e.target.value)}
                          placeholder="https://maps.app.goo.gl/..."
                          className="w-full bg-white border border-amber-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Description de l'événement</label>
                      <textarea
                        rows={3}
                        value={content.invitationDescription || ''}
                        onChange={e => updateContentField('invitationDescription', e.target.value)}
                        placeholder="Présentez l'objectif de l'événement en quelques mots..."
                        className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-amber-600 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Programme / Déroulement</label>
                      <textarea
                        rows={4}
                        value={content.invitationProgram || ''}
                        onChange={e => updateContentField('invitationProgram', e.target.value)}
                        placeholder="Ex: 19h00 Accueil, 20h00 Dîner, 22h00 Soirée dansante..."
                        className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-amber-600 focus:outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Dress Code</label>
                        <input
                          type="text"
                          value={content.invitationDressCode || ''}
                          onChange={e => updateContentField('invitationDressCode', e.target.value)}
                          placeholder="Ex: Tenue de soirée, Décontracté..."
                          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Invité(s) Spécial(aux)</label>
                        <input
                          type="text"
                          value={content.invitationSpecialGuest || ''}
                          onChange={e => updateContentField('invitationSpecialGuest', e.target.value)}
                          placeholder="Noms des VIP ou intervenants"
                          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Contact Organisateur</label>
                        <input
                          type="tel"
                          value={content.invitationPhone || ''}
                          onChange={e => updateContentField('invitationPhone', e.target.value)}
                          placeholder="+225..."
                          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">WhatsApp RSVP</label>
                        <input
                          type="tel"
                          value={content.invitationWhatsapp || ''}
                          onChange={e => updateContentField('invitationWhatsapp', e.target.value)}
                          placeholder="+225..."
                          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Lien de Réservation / Billetterie</label>
                      <div className="relative">
                        <ShoppingCart className="absolute left-3 top-2.5 w-3.5 h-3.5 text-amber-400" />
                        <input
                          type="url"
                          value={content.invitationBookingUrl || ''}
                          onChange={e => updateContentField('invitationBookingUrl', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-white border border-amber-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-amber-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-white/60 border border-amber-100 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={content.invitationRsvpEnabled || false}
                            onChange={e => updateContentField('invitationRsvpEnabled', e.target.checked)}
                            className="w-4 h-4 accent-amber-600"
                          />
                          <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Activer la demande RSVP</span>
                        </label>
                      </div>
                      {content.invitationRsvpEnabled && (
                        <div>
                          <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Date limite de réponse</label>
                          <input
                            type="date"
                            value={content.invitationRsvpDeadline || ''}
                            onChange={e => updateContentField('invitationRsvpDeadline', e.target.value)}
                            className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-amber-600 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR SOCIAL / BIO (LINKTREE STYLE) */}
                {type === 'social' && (
                  <div className="space-y-6 pt-4 border-t border-indigo-100 bg-indigo-50/40 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Profil Bio & Réseaux</h4>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Multi-liens</span>
                    </div>

                    {/* Photo de Profil / Avatar */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-full w-32 h-32 mx-auto bg-white space-y-2 overflow-hidden">
                      {content.photoUrl ? (
                        <div className="relative group w-full h-full">
                          <img src={content.photoUrl} className="w-full h-full object-cover" />
                          <button onClick={() => updateContentField('photoUrl', '')} className="absolute inset-0 flex items-center justify-center bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                          <User className="w-8 h-8 text-indigo-200 mb-1" />
                          <span className="text-[8px] font-black text-indigo-400 uppercase">Photo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => updateContentField('photoUrl', ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Nom affiché *</label>
                        <input type="text" required value={content.socialDisplayName || content.fullName || ''} onChange={e => {updateContentField('socialDisplayName', e.target.value); updateContentField('fullName', e.target.value);}} placeholder="Votre nom ou marque" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Pseudo / Username</label>
                        <input type="text" value={content.socialNickname || ''} onChange={e => updateContentField('socialNickname', e.target.value)} placeholder="@pseudo" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Profession / Activité</label>
                        <input type="text" value={content.socialProfession || content.jobTitle || ''} onChange={e => {updateContentField('socialProfession', e.target.value); updateContentField('jobTitle', e.target.value);}} placeholder="Ex: Créateur de contenu" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Entreprise</label>
                        <input type="text" value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom de votre structure" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Bio / Présentation Courte</label>
                      <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Dites-en plus sur vous en quelques lignes..." className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                    </div>

                    {/* Réseaux Sociaux Dédiés */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Directs</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative"><Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" /><input type="url" value={content.socialFacebookUrl || ''} onChange={e => updateContentField('socialFacebookUrl', e.target.value)} placeholder="Facebook" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" /><input type="url" value={content.socialInstagramUrl || ''} onChange={e => updateContentField('socialInstagramUrl', e.target.value)} placeholder="Instagram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><span className="absolute left-3 top-2.5 text-[9px] font-bold">Tik</span><input type="url" value={content.socialTikTokUrl || ''} onChange={e => updateContentField('socialTikTokUrl', e.target.value)} placeholder="TikTok" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" /><input type="url" value={content.socialYouTubeUrl || ''} onChange={e => updateContentField('socialYouTubeUrl', e.target.value)} placeholder="YouTube" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" /><input type="url" value={content.socialLinkedInUrl || ''} onChange={e => updateContentField('socialLinkedInUrl', e.target.value)} placeholder="LinkedIn" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Twitter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-500" /><input type="url" value={content.socialTwitterUrl || ''} onChange={e => updateContentField('socialTwitterUrl', e.target.value)} placeholder="X / Twitter" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Send className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-600" /><input type="url" value={content.socialTelegramUrl || ''} onChange={e => updateContentField('socialTelegramUrl', e.target.value)} placeholder="Telegram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-500" /><input type="url" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} placeholder="WhatsApp" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                      </div>
                    </div>

                    {/* Liens Personnalisés Libres */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Liens Personnalisés Libres</h5>
                        <button type="button" onClick={addSocialLink} className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-sm">+ Ajouter un lien</button>
                      </div>

                      <div className="space-y-3">
                        {content.socialLinks.map((link) => (
                          <div key={link.id} className="p-3 bg-white border border-indigo-100 rounded-2xl flex gap-3 items-start shadow-xs">
                            <div className="flex-1 space-y-2">
                              <input type="text" value={link.label || ''} onChange={e => {
                                const newLinks = content.socialLinks.map(l => l.id === link.id ? {...l, label: e.target.value} : l);
                                updateContentField('socialLinks', newLinks);
                              }} placeholder="Titre (ex: Mon Catalogue, Ma Boutique...)" className="w-full border-b border-slate-100 text-[11px] font-bold text-slate-800 outline-none pb-1" />
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-slate-400" />
                                <input type="url" value={link.url} onChange={e => updateSocialLink(link.id, link.platform, e.target.value)} placeholder="https://..." className="w-full text-[10px] text-indigo-600 outline-none" />
                              </div>
                            </div>
                            <button onClick={() => removeSocialLink(link.id)} className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR BUSINESS / SOCIÉTÉ */}
                {type === 'business' && (
                  <div className="space-y-6 pt-4 border-t border-slate-200 bg-slate-50/80 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Identification de la Société</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutionnel</span>
                    </div>

                    {/* Logo & Juridique */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-white space-y-3">
                        {content.logoUrl ? (
                          <div className="relative group">
                            <img src={content.logoUrl} className="w-24 h-24 object-contain" />
                            <button onClick={() => {updateContentField('logoUrl', ''); updateStylingField('logoUrl', '');}} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center cursor-pointer">
                            <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Logo Officiel</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  const url = ev.target?.result as string;
                                  updateContentField('logoUrl', url);
                                  updateStylingField('logoUrl', url);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} />
                          </label>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">Raison Sociale *</label>
                          <input type="text" required value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom officiel de l'entreprise" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:border-blue-600 outline-none shadow-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nom Commercial</label>
                          <input type="text" value={content.commercialName || ''} onChange={e => updateContentField('commercialName', e.target.value)} placeholder="Nom public (si différent)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-800 outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Forme Juridique</label>
                        <input type="text" value={content.businessType || ''} onChange={e => updateContentField('businessType', e.target.value)} placeholder="SARL, SA..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">RCCM</label>
                        <input type="text" value={content.businessRegisterNumber || ''} onChange={e => updateContentField('businessRegisterNumber', e.target.value)} placeholder="CI-ABJ-..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Compte Contribuable</label>
                        <input type="text" value={content.businessTaxId || ''} onChange={e => updateContentField('businessTaxId', e.target.value)} placeholder="N° CC" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Création</label>
                        <input type="text" value={content.businessCreationYear || ''} onChange={e => updateContentField('businessCreationYear', e.target.value)} placeholder="Ex: 2012" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Capital Social</label>
                        <input type="text" value={content.businessCapital || ''} onChange={e => updateContentField('businessCapital', e.target.value)} placeholder="Ex: 1 000 000 FCFA" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    {/* Activité */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Activité & Expertise</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Secteur d'activité</label>
                          <input type="text" value={content.industry || ''} onChange={e => updateContentField('industry', e.target.value)} placeholder="Ex: BTP, Conseil, IT..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Activité Principale</label>
                          <input type="text" value={content.businessMainActivity || ''} onChange={e => updateContentField('businessMainActivity', e.target.value)} placeholder="Ex: Construction d'infrastructures" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Description de la Société</label>
                        <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Présentation institutionnelle..." className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Produits</label>
                          <textarea rows={2} value={(content.productsList || []).join('\n')} onChange={e => updateContentField('productsList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Services</label>
                          <textarea rows={2} value={(content.servicesList || []).join('\n')} onChange={e => updateContentField('servicesList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Marques représentées</label>
                          <textarea rows={2} value={(content.brandsRepresented || []).join('\n')} onChange={e => updateContentField('brandsRepresented', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Responsable */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/40 p-4 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Direction / Responsable</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Nom du Responsable</label>
                          <input type="text" value={content.businessManagerName || ''} onChange={e => updateContentField('businessManagerName', e.target.value)} placeholder="Prénom Nom" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Fonction</label>
                          <input type="text" value={content.jobTitle || ''} onChange={e => updateContentField('jobTitle', e.target.value)} placeholder="Directeur Général, Gérant..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Responsable</label>
                          <input type="tel" value={content.businessManagerPhone || ''} onChange={e => updateContentField('businessManagerPhone', e.target.value)} placeholder="+225..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail Responsable</label>
                          <input type="email" value={content.businessManagerEmail || ''} onChange={e => updateContentField('businessManagerEmail', e.target.value)} placeholder="email@pro.com" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Coordonnées & GPS */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Coordonnées du Siège</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Siège</label>
                          <input type="tel" value={content.primaryPhone || ''} onChange={e => updateContentField('primaryPhone', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">WhatsApp Siège</label>
                          <input type="tel" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail général</label>
                          <input type="email" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Site internet</label>
                          <input type="url" value={content.websiteUrl || ''} onChange={e => updateContentField('websiteUrl', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Adresse du Siège</label>
                        <input type="text" value={content.address || ''} onChange={e => updateContentField('address', e.target.value)} placeholder="Immeuble, Rue, Commune..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>

                      <div className="p-4 bg-slate-800 rounded-2xl text-white space-y-3 shadow-lg shadow-blue-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <LocateFixed className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Position GPS du Siège</span>
                          </div>
                          <button type="button" onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                updateContentField('locationLatitude', pos.coords.latitude);
                                updateContentField('locationLongitude', pos.coords.longitude);
                              }, (err) => alert("Géoloc : " + err.message));
                            }
                          }} className="px-3 py-1 bg-white text-slate-900 text-[9px] font-black uppercase rounded-full hover:bg-blue-50 transition-colors shadow-sm">📍 Ma Position</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" step="any" value={content.locationLatitude || ''} onChange={e => updateContentField('locationLatitude', parseFloat(e.target.value))} placeholder="Latitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                          <input type="number" step="any" value={content.locationLongitude || ''} onChange={e => updateContentField('locationLongitude', parseFloat(e.target.value))} placeholder="Longitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                        </div>
                      </div>
                    </div>

                    {/* Documents & Liens */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/60 p-4 rounded-2xl shadow-inner">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Documents & Présentation</h5>
                      <div className="space-y-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Catalogue</span>
                          <input type="url" value={content.businessCatalogueUrl || ''} onChange={e => updateContentField('businessCatalogueUrl', e.target.value)} placeholder="Lien vers le catalogue PDF public" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Brochure</span>
                          <input type="url" value={content.businessBrochureUrl || ''} onChange={e => updateContentField('businessBrochureUrl', e.target.value)} placeholder="Lien vers la brochure PDF publique" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Société</span>
                          <input type="url" value={content.businessPresentationUrl || ''} onChange={e => updateContentField('businessPresentationUrl', e.target.value)} placeholder="Lien vers présentation entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <p className="text-[10px] text-rose-500 font-bold italic leading-relaxed">⚠️ Note de sécurité : Ne renseignez que des liens vers des documents publics hébergés sur internet (Cloud, Dropbox, Site web). Les documents confidentiels ne doivent pas être liés ici.</p>
                      </div>
                    </div>

                    {/* Réseaux Sociaux Business */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Professionnels</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" />
                          <input type="url" value={content.businessLinkedInUrl || ''} onChange={e => updateContentField('businessLinkedInUrl', e.target.value)} placeholder="LinkedIn Entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-700" />
                        </div>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" />
                          <input type="url" value={content.businessYouTubeUrl || ''} onChange={e => updateContentField('businessYouTubeUrl', e.target.value)} placeholder="Chaîne YouTube" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-red-600" />
                        </div>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" />
                          <input type="url" value={content.businessFacebookUrl || ''} onChange={e => updateContentField('businessFacebookUrl', e.target.value)} placeholder="Page Facebook" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" />
                          <input type="url" value={content.businessInstagramUrl || ''} onChange={e => updateContentField('businessInstagramUrl', e.target.value)} placeholder="Profil Instagram" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-rose-500" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-[10px] font-black text-slate-900">Tik</span>
                          <input type="url" value={content.businessTikTokUrl || ''} onChange={e => updateContentField('businessTikTokUrl', e.target.value)} placeholder="Compte TikTok" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR LOCATION / GPS */}
                {type === 'location' && (
                  <div className="space-y-6 pt-4 border-t border-blue-100 bg-blue-50/40 p-5 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                          <MapPinned className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">Localisation & GPS</h4>
                      </div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Navigation Directe</span>
                    </div>

                    {/* Photo du lieu */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 rounded-2xl bg-white/60 space-y-3">
                      {content.locationPhotoUrl ? (
                        <div className="relative group">
                          <img src={content.locationPhotoUrl} className="w-full max-h-48 object-cover rounded-lg shadow-md" />
                          <button
                            onClick={() => updateContentField('locationPhotoUrl', '')}
                            className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Photo du lieu (Facultatif)</p>
                          <label className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                            Choisir une photo
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => updateContentField('locationPhotoUrl', ev.target?.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Nom du lieu *</label>
                        <input
                          type="text"
                          required
                          value={content.locationPlaceName || ''}
                          onChange={e => updateContentField('locationPlaceName', e.target.value)}
                          placeholder="Ex: Siège AGB, Entrepôt Principal..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Type de lieu</label>
                        <input
                          type="text"
                          value={content.locationPlaceType || ''}
                          onChange={e => updateContentField('locationPlaceType', e.target.value)}
                          placeholder="Bureaux, Magasin, Dépôt..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Pays</label>
                        <input
                          type="text"
                          value={content.locationCountry || 'Côte d\'Ivoire'}
                          onChange={e => updateContentField('locationCountry', e.target.value)}
                          placeholder="Côte d'Ivoire"
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Ville (Recommandé)</label>
                        <input
                          type="text"
                          value={content.locationCity || ''}
                          onChange={e => updateContentField('locationCity', e.target.value)}
                          placeholder="Abidjan, Yamoussoukro..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Commune / Ville</label>
                        <input
                          type="text"
                          value={content.locationCommune || ''}
                          onChange={e => updateContentField('locationCommune', e.target.value)}
                          placeholder="Cocody, Marcory..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Quartier</label>
                        <input
                          type="text"
                          value={content.locationNeighborhood || ''}
                          onChange={e => updateContentField('locationNeighborhood', e.target.value)}
                          placeholder="Riviera 3, Angré..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Adresse exacte</label>
                      <input
                        type="text"
                        value={content.locationAddress || ''}
                        onChange={e => updateContentField('locationAddress', e.target.value)}
                        placeholder="Rue, lot, porte..."
                        className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Section GPS Automatique */}
                    <div className="p-5 bg-blue-600 rounded-3xl text-white space-y-4 shadow-lg shadow-blue-900/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LocateFixed className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Coordonnées GPS</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                updateContentField('locationLatitude', pos.coords.latitude);
                                updateContentField('locationLongitude', pos.coords.longitude);
                              }, (err) => alert("Impossible de récupérer la position : " + err.message));
                            } else {
                              alert("La géolocalisation n'est pas supportée par votre appareil.");
                            }
                          }}
                          className="px-3 py-1.5 bg-white text-blue-600 text-[10px] font-black uppercase rounded-full hover:bg-blue-50 transition-colors"
                        >
                          📍 Utiliser ma position actuelle
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-blue-100 uppercase mb-1">Latitude</label>
                          <input
                            type="number"
                            step="any"
                            value={content.locationLatitude || ''}
                            onChange={e => updateContentField('locationLatitude', parseFloat(e.target.value))}
                            className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-blue-100 uppercase mb-1">Longitude</label>
                          <input
                            type="number"
                            step="any"
                            value={content.locationLongitude || ''}
                            onChange={e => updateContentField('locationLongitude', parseFloat(e.target.value))}
                            className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Point de repère</label>
                        <input
                          type="text"
                          value={content.locationLandmark || ''}
                          onChange={e => updateContentField('locationLandmark', e.target.value)}
                          placeholder="Près de la pharmacie, en face de..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Horaires (Libre)</label>
                        <input
                          type="text"
                          value={content.locationOpeningHoursText || ''}
                          onChange={e => updateContentField('locationOpeningHoursText', e.target.value)}
                          placeholder="Ex: Lun-Ven 8h-18h"
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Description d'accès</label>
                      <textarea
                        rows={2}
                        value={content.locationAccessDescription || ''}
                        onChange={e => updateContentField('locationAccessDescription', e.target.value)}
                        placeholder="Détails pour arriver facilement (code porte, étage, etc.)"
                        className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Téléphone</label>
                        <input
                          type="tel"
                          value={content.locationPhone || ''}
                          onChange={e => updateContentField('locationPhone', e.target.value)}
                          placeholder="+225..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">WhatsApp</label>
                        <input
                          type="tel"
                          value={content.locationWhatsapp || ''}
                          onChange={e => updateContentField('locationWhatsapp', e.target.value)}
                          placeholder="+225..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR SOCIAL / BIO (LINKTREE STYLE) */}
                {type === 'social' && (
                  <div className="space-y-6 pt-4 border-t border-indigo-100 bg-indigo-50/40 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Profil Bio & Réseaux</h4>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Multi-liens</span>
                    </div>

                    {/* Photo de Profil / Avatar */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-full w-32 h-32 mx-auto bg-white space-y-2 overflow-hidden">
                      {content.photoUrl ? (
                        <div className="relative group w-full h-full">
                          <img src={content.photoUrl} className="w-full h-full object-cover" />
                          <button onClick={() => updateContentField('photoUrl', '')} className="absolute inset-0 flex items-center justify-center bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                          <User className="w-8 h-8 text-indigo-200 mb-1" />
                          <span className="text-[8px] font-black text-indigo-400 uppercase">Photo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => updateContentField('photoUrl', ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Nom affiché *</label>
                        <input type="text" required value={content.socialDisplayName || content.fullName || ''} onChange={e => {updateContentField('socialDisplayName', e.target.value); updateContentField('fullName', e.target.value);}} placeholder="Votre nom ou marque" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Pseudo / Username</label>
                        <input type="text" value={content.socialNickname || ''} onChange={e => updateContentField('socialNickname', e.target.value)} placeholder="@pseudo" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Profession / Activité</label>
                        <input type="text" value={content.socialProfession || content.jobTitle || ''} onChange={e => {updateContentField('socialProfession', e.target.value); updateContentField('jobTitle', e.target.value);}} placeholder="Ex: Créateur de contenu" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Entreprise</label>
                        <input type="text" value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom de votre structure" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Bio / Présentation Courte</label>
                      <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Dites-en plus sur vous en quelques lignes..." className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                    </div>

                    {/* Réseaux Sociaux Dédiés */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Directs</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative"><Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" /><input type="url" value={content.socialFacebookUrl || ''} onChange={e => updateContentField('socialFacebookUrl', e.target.value)} placeholder="Facebook" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" /><input type="url" value={content.socialInstagramUrl || ''} onChange={e => updateContentField('socialInstagramUrl', e.target.value)} placeholder="Instagram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><span className="absolute left-3 top-2.5 text-[9px] font-bold">Tik</span><input type="url" value={content.socialTikTokUrl || ''} onChange={e => updateContentField('socialTikTokUrl', e.target.value)} placeholder="TikTok" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" /><input type="url" value={content.socialYouTubeUrl || ''} onChange={e => updateContentField('socialYouTubeUrl', e.target.value)} placeholder="YouTube" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" /><input type="url" value={content.socialLinkedInUrl || ''} onChange={e => updateContentField('socialLinkedInUrl', e.target.value)} placeholder="LinkedIn" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Twitter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-500" /><input type="url" value={content.socialTwitterUrl || ''} onChange={e => updateContentField('socialTwitterUrl', e.target.value)} placeholder="X / Twitter" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Send className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-600" /><input type="url" value={content.socialTelegramUrl || ''} onChange={e => updateContentField('socialTelegramUrl', e.target.value)} placeholder="Telegram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-500" /><input type="url" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} placeholder="WhatsApp" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                      </div>
                    </div>

                    {/* Liens Personnalisés Libres */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Liens Personnalisés Libres</h5>
                        <button type="button" onClick={addSocialLink} className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-sm">+ Ajouter un lien</button>
                      </div>

                      <div className="space-y-3">
                        {content.socialLinks.map((link) => (
                          <div key={link.id} className="p-3 bg-white border border-indigo-100 rounded-2xl flex gap-3 items-start shadow-xs">
                            <div className="flex-1 space-y-2">
                              <input type="text" value={link.label || ''} onChange={e => {
                                const newLinks = content.socialLinks.map(l => l.id === link.id ? {...l, label: e.target.value} : l);
                                updateContentField('socialLinks', newLinks);
                              }} placeholder="Titre (ex: Mon Catalogue, Ma Boutique...)" className="w-full border-b border-slate-100 text-[11px] font-bold text-slate-800 outline-none pb-1" />
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-slate-400" />
                                <input type="url" value={link.url} onChange={e => updateSocialLink(link.id, link.platform, e.target.value)} placeholder="https://..." className="w-full text-[10px] text-indigo-600 outline-none" />
                              </div>
                            </div>
                            <button onClick={() => removeSocialLink(link.id)} className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR BUSINESS / SOCIÉTÉ */}
                {type === 'business' && (
                  <div className="space-y-6 pt-4 border-t border-slate-200 bg-slate-50/80 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Identification de la Société</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutionnel</span>
                    </div>

                    {/* Logo & Juridique */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-white space-y-3">
                        {content.logoUrl ? (
                          <div className="relative group">
                            <img src={content.logoUrl} className="w-24 h-24 object-contain" />
                            <button onClick={() => {updateContentField('logoUrl', ''); updateStylingField('logoUrl', '');}} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center cursor-pointer">
                            <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Logo Officiel</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  const url = ev.target?.result as string;
                                  updateContentField('logoUrl', url);
                                  updateStylingField('logoUrl', url);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} />
                          </label>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">Raison Sociale *</label>
                          <input type="text" required value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom officiel de l'entreprise" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:border-blue-600 outline-none shadow-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nom Commercial</label>
                          <input type="text" value={content.commercialName || ''} onChange={e => updateContentField('commercialName', e.target.value)} placeholder="Nom public (si différent)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-800 outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Forme Juridique</label>
                        <input type="text" value={content.businessType || ''} onChange={e => updateContentField('businessType', e.target.value)} placeholder="SARL, SA..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">RCCM</label>
                        <input type="text" value={content.businessRegisterNumber || ''} onChange={e => updateContentField('businessRegisterNumber', e.target.value)} placeholder="CI-ABJ-..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Compte Contribuable</label>
                        <input type="text" value={content.businessTaxId || ''} onChange={e => updateContentField('businessTaxId', e.target.value)} placeholder="N° CC" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Création</label>
                        <input type="text" value={content.businessCreationYear || ''} onChange={e => updateContentField('businessCreationYear', e.target.value)} placeholder="Ex: 2012" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Capital Social</label>
                        <input type="text" value={content.businessCapital || ''} onChange={e => updateContentField('businessCapital', e.target.value)} placeholder="Ex: 1 000 000 FCFA" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    {/* Activité */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Activité & Expertise</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Secteur d'activité</label>
                          <input type="text" value={content.industry || ''} onChange={e => updateContentField('industry', e.target.value)} placeholder="Ex: BTP, Conseil, IT..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Activité Principale</label>
                          <input type="text" value={content.businessMainActivity || ''} onChange={e => updateContentField('businessMainActivity', e.target.value)} placeholder="Ex: Construction d'infrastructures" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Description de la Société</label>
                        <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Présentation institutionnelle..." className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Produits</label>
                          <textarea rows={2} value={(content.productsList || []).join('\n')} onChange={e => updateContentField('productsList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Services</label>
                          <textarea rows={2} value={(content.servicesList || []).join('\n')} onChange={e => updateContentField('servicesList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Marques représentées</label>
                          <textarea rows={2} value={(content.brandsRepresented || []).join('\n')} onChange={e => updateContentField('brandsRepresented', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Responsable */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/40 p-4 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Direction / Responsable</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Nom du Responsable</label>
                          <input type="text" value={content.businessManagerName || ''} onChange={e => updateContentField('businessManagerName', e.target.value)} placeholder="Prénom Nom" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Fonction</label>
                          <input type="text" value={content.jobTitle || ''} onChange={e => updateContentField('jobTitle', e.target.value)} placeholder="Directeur Général, Gérant..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Responsable</label>
                          <input type="tel" value={content.businessManagerPhone || ''} onChange={e => updateContentField('businessManagerPhone', e.target.value)} placeholder="+225..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail Responsable</label>
                          <input type="email" value={content.businessManagerEmail || ''} onChange={e => updateContentField('businessManagerEmail', e.target.value)} placeholder="email@pro.com" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Coordonnées & GPS */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Coordonnées du Siège</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Siège</label>
                          <input type="tel" value={content.primaryPhone || ''} onChange={e => updateContentField('primaryPhone', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">WhatsApp Siège</label>
                          <input type="tel" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail général</label>
                          <input type="email" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Site internet</label>
                          <input type="url" value={content.websiteUrl || ''} onChange={e => updateContentField('websiteUrl', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Adresse du Siège</label>
                        <input type="text" value={content.address || ''} onChange={e => updateContentField('address', e.target.value)} placeholder="Immeuble, Rue, Commune..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>

                      <div className="p-4 bg-slate-800 rounded-2xl text-white space-y-3 shadow-lg shadow-blue-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <LocateFixed className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Position GPS du Siège</span>
                          </div>
                          <button type="button" onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                updateContentField('locationLatitude', pos.coords.latitude);
                                updateContentField('locationLongitude', pos.coords.longitude);
                              }, (err) => alert("Géoloc : " + err.message));
                            }
                          }} className="px-3 py-1 bg-white text-slate-900 text-[9px] font-black uppercase rounded-full hover:bg-blue-50 transition-colors shadow-sm">📍 Ma Position</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" step="any" value={content.locationLatitude || ''} onChange={e => updateContentField('locationLatitude', parseFloat(e.target.value))} placeholder="Latitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                          <input type="number" step="any" value={content.locationLongitude || ''} onChange={e => updateContentField('locationLongitude', parseFloat(e.target.value))} placeholder="Longitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                        </div>
                      </div>
                    </div>

                    {/* Documents & Liens */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/60 p-4 rounded-2xl shadow-inner">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Documents & Présentation</h5>
                      <div className="space-y-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Catalogue</span>
                          <input type="url" value={content.businessCatalogueUrl || ''} onChange={e => updateContentField('businessCatalogueUrl', e.target.value)} placeholder="Lien vers le catalogue PDF public" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Brochure</span>
                          <input type="url" value={content.businessBrochureUrl || ''} onChange={e => updateContentField('businessBrochureUrl', e.target.value)} placeholder="Lien vers la brochure PDF publique" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Société</span>
                          <input type="url" value={content.businessPresentationUrl || ''} onChange={e => updateContentField('businessPresentationUrl', e.target.value)} placeholder="Lien vers présentation entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <p className="text-[10px] text-rose-500 font-bold italic leading-relaxed">⚠️ Note de sécurité : Ne renseignez que des liens vers des documents publics hébergés sur internet (Cloud, Dropbox, Site web). Les documents confidentiels ne doivent pas être liés ici.</p>
                      </div>
                    </div>

                    {/* Réseaux Sociaux Business */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Professionnels</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" />
                          <input type="url" value={content.businessLinkedInUrl || ''} onChange={e => updateContentField('businessLinkedInUrl', e.target.value)} placeholder="LinkedIn Entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-700" />
                        </div>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" />
                          <input type="url" value={content.businessYouTubeUrl || ''} onChange={e => updateContentField('businessYouTubeUrl', e.target.value)} placeholder="Chaîne YouTube" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-red-600" />
                        </div>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" />
                          <input type="url" value={content.businessFacebookUrl || ''} onChange={e => updateContentField('businessFacebookUrl', e.target.value)} placeholder="Page Facebook" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" />
                          <input type="url" value={content.businessInstagramUrl || ''} onChange={e => updateContentField('businessInstagramUrl', e.target.value)} placeholder="Profil Instagram" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-rose-500" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-[10px] font-black text-slate-900">Tik</span>
                          <input type="url" value={content.businessTikTokUrl || ''} onChange={e => updateContentField('businessTikTokUrl', e.target.value)} placeholder="Compte TikTok" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR SHOP / COMMERCE */}
                {type === 'shop' && (
                  <div className="space-y-6 pt-4 border-t border-emerald-100 bg-emerald-50/40 p-5 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                          <Store className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Commerce & Boutique</h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Fiche Marchande</span>
                    </div>

                    {/* Logo du commerce */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-emerald-200 rounded-2xl bg-white/60 space-y-3">
                      {content.logoUrl ? (
                        <div className="relative group">
                          <img src={content.logoUrl} className="w-24 h-24 object-contain rounded-xl bg-white p-1 shadow-md" />
                          <button
                            onClick={() => {
                              updateContentField('logoUrl', '');
                              updateStylingField('logoUrl', '');
                            }}
                            className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Logo du commerce (Facultatif)</p>
                          <label className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full cursor-pointer hover:bg-emerald-700 transition-colors">
                            Choisir un logo
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    const url = ev.target?.result as string;
                                    updateContentField('logoUrl', url);
                                    updateStylingField('logoUrl', url);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1.5">Nom du commerce *</label>
                        <input
                          type="text"
                          required
                          value={content.shopName || content.company || ''}
                          onChange={e => {
                            updateContentField('shopName', e.target.value);
                            updateContentField('company', e.target.value);
                          }}
                          placeholder="Ex: Boutique AGB Mode"
                          className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1.5">Secteur d'activité</label>
                        <input
                          type="text"
                          value={content.shopIndustry || content.industry || ''}
                          onChange={e => {
                            updateContentField('shopIndustry', e.target.value);
                            updateContentField('industry', e.target.value);
                          }}
                          placeholder="Ex: Prêt-à-porter, Alimentation..."
                          className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1.5">Slogan</label>
                      <input
                        type="text"
                        value={content.shopSlogan || content.slogan || ''}
                        onChange={e => {
                          updateContentField('shopSlogan', e.target.value);
                          updateContentField('slogan', e.target.value);
                        }}
                        placeholder="Votre promesse client..."
                        className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1.5">Description de la boutique</label>
                      <textarea
                        rows={3}
                        value={content.shopDescription || content.bio || ''}
                        onChange={e => {
                          updateContentField('shopDescription', e.target.value);
                          updateContentField('bio', e.target.value);
                        }}
                        placeholder="Présentez votre boutique, vos produits phares et votre univers..."
                        className="w-full bg-white border border-emerald-200 rounded-2xl px-4 py-3 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {/* Services & Produits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1.5">Services Proposés</label>
                        <textarea
                          rows={3}
                          value={(content.shopServices || []).join('\n')}
                          onChange={e => updateContentField('shopServices', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                          placeholder="Un service par ligne..."
                          className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1.5">Produits Vendus</label>
                        <textarea
                          rows={3}
                          value={(content.shopProducts || []).join('\n')}
                          onChange={e => updateContentField('shopProducts', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                          placeholder="Un produit par ligne..."
                          className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Livraison & Paiement */}
                    <div className="space-y-4 p-4 bg-white/40 border border-emerald-100 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Truck className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Livraison disponible</span>
                          <input
                            type="checkbox"
                            checked={content.shopDeliveryAvailable || false}
                            onChange={e => updateContentField('shopDeliveryAvailable', e.target.checked)}
                            className="w-4 h-4 accent-emerald-600 ml-2"
                          />
                        </label>
                      </div>

                      {content.shopDeliveryAvailable && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Zone de livraison</label>
                          <input
                            type="text"
                            value={content.shopDeliveryZone || ''}
                            onChange={e => updateContentField('shopDeliveryZone', e.target.value)}
                            placeholder="Abidjan, Yamoussoukro..."
                            className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
                          />
                        </div>
                      )}

                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1.5">
                          <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Moyens de paiement</span>
                        </label>
                        <input
                          type="text"
                          value={(content.shopPaymentMethods || []).join(', ')}
                          onChange={e => updateContentField('shopPaymentMethods', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          placeholder="Orange Money, Wave, Espèces..."
                          className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Liens & Réseaux Sociaux Boutique */}
                    <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" />
                        Lien Web & Réseaux
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="url"
                            value={content.shopWebsiteUrl || ''}
                            onChange={e => updateContentField('shopWebsiteUrl', e.target.value)}
                            placeholder="Site Internet"
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:border-blue-600 outline-none"
                          />
                        </div>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" />
                          <input
                            type="url"
                            value={content.shopFacebookUrl || ''}
                            onChange={e => updateContentField('shopFacebookUrl', e.target.value)}
                            placeholder="Facebook"
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:border-blue-600 outline-none"
                          />
                        </div>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" />
                          <input
                            type="url"
                            value={content.shopInstagramUrl || ''}
                            onChange={e => updateContentField('shopInstagramUrl', e.target.value)}
                            placeholder="Instagram"
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:border-blue-600 outline-none"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-900">Tik</span>
                          <input
                            type="url"
                            value={content.shopTikTokUrl || ''}
                            onChange={e => updateContentField('shopTikTokUrl', e.target.value)}
                            placeholder="TikTok"
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:border-blue-600 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-emerald-100">
                      <OpeningHoursEditor
                        hours={content.shopOpeningHours || content.openingHours || DEFAULT_DAYS}
                        onChange={(newHours) => {
                          updateContentField('shopOpeningHours', newHours);
                          updateContentField('openingHours', newHours);
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR SOCIAL / BIO (LINKTREE STYLE) */}
                {type === 'social' && (
                  <div className="space-y-6 pt-4 border-t border-indigo-100 bg-indigo-50/40 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Profil Bio & Réseaux</h4>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Multi-liens</span>
                    </div>

                    {/* Photo de Profil / Avatar */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-full w-32 h-32 mx-auto bg-white space-y-2 overflow-hidden">
                      {content.photoUrl ? (
                        <div className="relative group w-full h-full">
                          <img src={content.photoUrl} className="w-full h-full object-cover" />
                          <button onClick={() => updateContentField('photoUrl', '')} className="absolute inset-0 flex items-center justify-center bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                          <User className="w-8 h-8 text-indigo-200 mb-1" />
                          <span className="text-[8px] font-black text-indigo-400 uppercase">Photo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => updateContentField('photoUrl', ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Nom affiché *</label>
                        <input type="text" required value={content.socialDisplayName || content.fullName || ''} onChange={e => {updateContentField('socialDisplayName', e.target.value); updateContentField('fullName', e.target.value);}} placeholder="Votre nom ou marque" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Pseudo / Username</label>
                        <input type="text" value={content.socialNickname || ''} onChange={e => updateContentField('socialNickname', e.target.value)} placeholder="@pseudo" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Profession / Activité</label>
                        <input type="text" value={content.socialProfession || content.jobTitle || ''} onChange={e => {updateContentField('socialProfession', e.target.value); updateContentField('jobTitle', e.target.value);}} placeholder="Ex: Créateur de contenu" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Entreprise</label>
                        <input type="text" value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom de votre structure" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Bio / Présentation Courte</label>
                      <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Dites-en plus sur vous en quelques lignes..." className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                    </div>

                    {/* Réseaux Sociaux Dédiés */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Directs</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative"><Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" /><input type="url" value={content.socialFacebookUrl || ''} onChange={e => updateContentField('socialFacebookUrl', e.target.value)} placeholder="Facebook" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" /><input type="url" value={content.socialInstagramUrl || ''} onChange={e => updateContentField('socialInstagramUrl', e.target.value)} placeholder="Instagram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><span className="absolute left-3 top-2.5 text-[9px] font-bold">Tik</span><input type="url" value={content.socialTikTokUrl || ''} onChange={e => updateContentField('socialTikTokUrl', e.target.value)} placeholder="TikTok" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" /><input type="url" value={content.socialYouTubeUrl || ''} onChange={e => updateContentField('socialYouTubeUrl', e.target.value)} placeholder="YouTube" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" /><input type="url" value={content.socialLinkedInUrl || ''} onChange={e => updateContentField('socialLinkedInUrl', e.target.value)} placeholder="LinkedIn" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Twitter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-500" /><input type="url" value={content.socialTwitterUrl || ''} onChange={e => updateContentField('socialTwitterUrl', e.target.value)} placeholder="X / Twitter" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Send className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-600" /><input type="url" value={content.socialTelegramUrl || ''} onChange={e => updateContentField('socialTelegramUrl', e.target.value)} placeholder="Telegram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-500" /><input type="url" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} placeholder="WhatsApp" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                      </div>
                    </div>

                    {/* Liens Personnalisés Libres */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Liens Personnalisés Libres</h5>
                        <button type="button" onClick={addSocialLink} className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-sm">+ Ajouter un lien</button>
                      </div>

                      <div className="space-y-3">
                        {content.socialLinks.map((link) => (
                          <div key={link.id} className="p-3 bg-white border border-indigo-100 rounded-2xl flex gap-3 items-start shadow-xs">
                            <div className="flex-1 space-y-2">
                              <input type="text" value={link.label || ''} onChange={e => {
                                const newLinks = content.socialLinks.map(l => l.id === link.id ? {...l, label: e.target.value} : l);
                                updateContentField('socialLinks', newLinks);
                              }} placeholder="Titre (ex: Mon Catalogue, Ma Boutique...)" className="w-full border-b border-slate-100 text-[11px] font-bold text-slate-800 outline-none pb-1" />
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-slate-400" />
                                <input type="url" value={link.url} onChange={e => updateSocialLink(link.id, link.platform, e.target.value)} placeholder="https://..." className="w-full text-[10px] text-indigo-600 outline-none" />
                              </div>
                            </div>
                            <button onClick={() => removeSocialLink(link.id)} className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR BUSINESS / SOCIÉTÉ */}
                {type === 'business' && (
                  <div className="space-y-6 pt-4 border-t border-slate-200 bg-slate-50/80 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Identification de la Société</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutionnel</span>
                    </div>

                    {/* Logo & Juridique */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-white space-y-3">
                        {content.logoUrl ? (
                          <div className="relative group">
                            <img src={content.logoUrl} className="w-24 h-24 object-contain" />
                            <button onClick={() => {updateContentField('logoUrl', ''); updateStylingField('logoUrl', '');}} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center cursor-pointer">
                            <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Logo Officiel</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  const url = ev.target?.result as string;
                                  updateContentField('logoUrl', url);
                                  updateStylingField('logoUrl', url);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} />
                          </label>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">Raison Sociale *</label>
                          <input type="text" required value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom officiel de l'entreprise" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:border-blue-600 outline-none shadow-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nom Commercial</label>
                          <input type="text" value={content.commercialName || ''} onChange={e => updateContentField('commercialName', e.target.value)} placeholder="Nom public (si différent)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-800 outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Forme Juridique</label>
                        <input type="text" value={content.businessType || ''} onChange={e => updateContentField('businessType', e.target.value)} placeholder="SARL, SA..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">RCCM</label>
                        <input type="text" value={content.businessRegisterNumber || ''} onChange={e => updateContentField('businessRegisterNumber', e.target.value)} placeholder="CI-ABJ-..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Compte Contribuable</label>
                        <input type="text" value={content.businessTaxId || ''} onChange={e => updateContentField('businessTaxId', e.target.value)} placeholder="N° CC" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Création</label>
                        <input type="text" value={content.businessCreationYear || ''} onChange={e => updateContentField('businessCreationYear', e.target.value)} placeholder="Ex: 2012" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Capital Social</label>
                        <input type="text" value={content.businessCapital || ''} onChange={e => updateContentField('businessCapital', e.target.value)} placeholder="Ex: 1 000 000 FCFA" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    {/* Activité */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Activité & Expertise</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Secteur d'activité</label>
                          <input type="text" value={content.industry || ''} onChange={e => updateContentField('industry', e.target.value)} placeholder="Ex: BTP, Conseil, IT..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Activité Principale</label>
                          <input type="text" value={content.businessMainActivity || ''} onChange={e => updateContentField('businessMainActivity', e.target.value)} placeholder="Ex: Construction d'infrastructures" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Description de la Société</label>
                        <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Présentation institutionnelle..." className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Produits</label>
                          <textarea rows={2} value={(content.productsList || []).join('\n')} onChange={e => updateContentField('productsList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Services</label>
                          <textarea rows={2} value={(content.servicesList || []).join('\n')} onChange={e => updateContentField('servicesList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Marques représentées</label>
                          <textarea rows={2} value={(content.brandsRepresented || []).join('\n')} onChange={e => updateContentField('brandsRepresented', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Responsable */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/40 p-4 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Direction / Responsable</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Nom du Responsable</label>
                          <input type="text" value={content.businessManagerName || ''} onChange={e => updateContentField('businessManagerName', e.target.value)} placeholder="Prénom Nom" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Fonction</label>
                          <input type="text" value={content.jobTitle || ''} onChange={e => updateContentField('jobTitle', e.target.value)} placeholder="Directeur Général, Gérant..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Responsable</label>
                          <input type="tel" value={content.businessManagerPhone || ''} onChange={e => updateContentField('businessManagerPhone', e.target.value)} placeholder="+225..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail Responsable</label>
                          <input type="email" value={content.businessManagerEmail || ''} onChange={e => updateContentField('businessManagerEmail', e.target.value)} placeholder="email@pro.com" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Coordonnées & GPS */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Coordonnées du Siège</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Siège</label>
                          <input type="tel" value={content.primaryPhone || ''} onChange={e => updateContentField('primaryPhone', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">WhatsApp Siège</label>
                          <input type="tel" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail général</label>
                          <input type="email" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Site internet</label>
                          <input type="url" value={content.websiteUrl || ''} onChange={e => updateContentField('websiteUrl', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Adresse du Siège</label>
                        <input type="text" value={content.address || ''} onChange={e => updateContentField('address', e.target.value)} placeholder="Immeuble, Rue, Commune..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>

                      <div className="p-4 bg-slate-800 rounded-2xl text-white space-y-3 shadow-lg shadow-blue-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <LocateFixed className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Position GPS du Siège</span>
                          </div>
                          <button type="button" onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                updateContentField('locationLatitude', pos.coords.latitude);
                                updateContentField('locationLongitude', pos.coords.longitude);
                              }, (err) => alert("Géoloc : " + err.message));
                            }
                          }} className="px-3 py-1 bg-white text-slate-900 text-[9px] font-black uppercase rounded-full hover:bg-blue-50 transition-colors shadow-sm">📍 Ma Position</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" step="any" value={content.locationLatitude || ''} onChange={e => updateContentField('locationLatitude', parseFloat(e.target.value))} placeholder="Latitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                          <input type="number" step="any" value={content.locationLongitude || ''} onChange={e => updateContentField('locationLongitude', parseFloat(e.target.value))} placeholder="Longitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                        </div>
                      </div>
                    </div>

                    {/* Documents & Liens */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/60 p-4 rounded-2xl shadow-inner">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Documents & Présentation</h5>
                      <div className="space-y-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Catalogue</span>
                          <input type="url" value={content.businessCatalogueUrl || ''} onChange={e => updateContentField('businessCatalogueUrl', e.target.value)} placeholder="Lien vers le catalogue PDF public" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Brochure</span>
                          <input type="url" value={content.businessBrochureUrl || ''} onChange={e => updateContentField('businessBrochureUrl', e.target.value)} placeholder="Lien vers la brochure PDF publique" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Société</span>
                          <input type="url" value={content.businessPresentationUrl || ''} onChange={e => updateContentField('businessPresentationUrl', e.target.value)} placeholder="Lien vers présentation entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <p className="text-[10px] text-rose-500 font-bold italic leading-relaxed">⚠️ Note de sécurité : Ne renseignez que des liens vers des documents publics hébergés sur internet (Cloud, Dropbox, Site web). Les documents confidentiels ne doivent pas être liés ici.</p>
                      </div>
                    </div>

                    {/* Réseaux Sociaux Business */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Professionnels</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" />
                          <input type="url" value={content.businessLinkedInUrl || ''} onChange={e => updateContentField('businessLinkedInUrl', e.target.value)} placeholder="LinkedIn Entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-700" />
                        </div>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" />
                          <input type="url" value={content.businessYouTubeUrl || ''} onChange={e => updateContentField('businessYouTubeUrl', e.target.value)} placeholder="Chaîne YouTube" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-red-600" />
                        </div>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" />
                          <input type="url" value={content.businessFacebookUrl || ''} onChange={e => updateContentField('businessFacebookUrl', e.target.value)} placeholder="Page Facebook" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" />
                          <input type="url" value={content.businessInstagramUrl || ''} onChange={e => updateContentField('businessInstagramUrl', e.target.value)} placeholder="Profil Instagram" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-rose-500" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-[10px] font-black text-slate-900">Tik</span>
                          <input type="url" value={content.businessTikTokUrl || ''} onChange={e => updateContentField('businessTikTokUrl', e.target.value)} placeholder="Compte TikTok" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR LOCATION / GPS */}
                {type === 'location' && (
                  <div className="space-y-6 pt-4 border-t border-blue-100 bg-blue-50/40 p-5 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                          <MapPinned className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">Localisation & GPS</h4>
                      </div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Navigation Directe</span>
                    </div>

                    {/* Photo du lieu */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 rounded-2xl bg-white/60 space-y-3">
                      {content.locationPhotoUrl ? (
                        <div className="relative group">
                          <img src={content.locationPhotoUrl} className="w-full max-h-48 object-cover rounded-lg shadow-md" />
                          <button
                            onClick={() => updateContentField('locationPhotoUrl', '')}
                            className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Photo du lieu (Facultatif)</p>
                          <label className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                            Choisir une photo
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => updateContentField('locationPhotoUrl', ev.target?.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Nom du lieu *</label>
                        <input
                          type="text"
                          required
                          value={content.locationPlaceName || ''}
                          onChange={e => updateContentField('locationPlaceName', e.target.value)}
                          placeholder="Ex: Siège AGB, Entrepôt Principal..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Type de lieu</label>
                        <input
                          type="text"
                          value={content.locationPlaceType || ''}
                          onChange={e => updateContentField('locationPlaceType', e.target.value)}
                          placeholder="Bureaux, Magasin, Dépôt..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Pays</label>
                        <input
                          type="text"
                          value={content.locationCountry || 'Côte d\'Ivoire'}
                          onChange={e => updateContentField('locationCountry', e.target.value)}
                          placeholder="Côte d'Ivoire"
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Ville (Recommandé)</label>
                        <input
                          type="text"
                          value={content.locationCity || ''}
                          onChange={e => updateContentField('locationCity', e.target.value)}
                          placeholder="Abidjan, Yamoussoukro..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Commune / Ville</label>
                        <input
                          type="text"
                          value={content.locationCommune || ''}
                          onChange={e => updateContentField('locationCommune', e.target.value)}
                          placeholder="Cocody, Marcory..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Quartier</label>
                        <input
                          type="text"
                          value={content.locationNeighborhood || ''}
                          onChange={e => updateContentField('locationNeighborhood', e.target.value)}
                          placeholder="Riviera 3, Angré..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Adresse exacte</label>
                      <input
                        type="text"
                        value={content.locationAddress || ''}
                        onChange={e => updateContentField('locationAddress', e.target.value)}
                        placeholder="Rue, lot, porte..."
                        className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Section GPS Automatique */}
                    <div className="p-5 bg-blue-600 rounded-3xl text-white space-y-4 shadow-lg shadow-blue-900/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LocateFixed className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Coordonnées GPS</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                updateContentField('locationLatitude', pos.coords.latitude);
                                updateContentField('locationLongitude', pos.coords.longitude);
                              }, (err) => alert("Impossible de récupérer la position : " + err.message));
                            } else {
                              alert("La géolocalisation n'est pas supportée par votre appareil.");
                            }
                          }}
                          className="px-3 py-1.5 bg-white text-blue-600 text-[10px] font-black uppercase rounded-full hover:bg-blue-50 transition-colors"
                        >
                          📍 Utiliser ma position actuelle
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-blue-100 uppercase mb-1">Latitude</label>
                          <input
                            type="number"
                            step="any"
                            value={content.locationLatitude || ''}
                            onChange={e => updateContentField('locationLatitude', parseFloat(e.target.value))}
                            className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-blue-100 uppercase mb-1">Longitude</label>
                          <input
                            type="number"
                            step="any"
                            value={content.locationLongitude || ''}
                            onChange={e => updateContentField('locationLongitude', parseFloat(e.target.value))}
                            className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Point de repère</label>
                        <input
                          type="text"
                          value={content.locationLandmark || ''}
                          onChange={e => updateContentField('locationLandmark', e.target.value)}
                          placeholder="Près de la pharmacie, en face de..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Horaires (Libre)</label>
                        <input
                          type="text"
                          value={content.locationOpeningHoursText || ''}
                          onChange={e => updateContentField('locationOpeningHoursText', e.target.value)}
                          placeholder="Ex: Lun-Ven 8h-18h"
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Description d'accès</label>
                      <textarea
                        rows={2}
                        value={content.locationAccessDescription || ''}
                        onChange={e => updateContentField('locationAccessDescription', e.target.value)}
                        placeholder="Détails pour arriver facilement (code porte, étage, etc.)"
                        className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Téléphone</label>
                        <input
                          type="tel"
                          value={content.locationPhone || ''}
                          onChange={e => updateContentField('locationPhone', e.target.value)}
                          placeholder="+225..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">WhatsApp</label>
                        <input
                          type="tel"
                          value={content.locationWhatsapp || ''}
                          onChange={e => updateContentField('locationWhatsapp', e.target.value)}
                          placeholder="+225..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR SOCIAL / BIO (LINKTREE STYLE) */}
                {type === 'social' && (
                  <div className="space-y-6 pt-4 border-t border-indigo-100 bg-indigo-50/40 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Profil Bio & Réseaux</h4>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Multi-liens</span>
                    </div>

                    {/* Photo de Profil / Avatar */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-full w-32 h-32 mx-auto bg-white space-y-2 overflow-hidden">
                      {content.photoUrl ? (
                        <div className="relative group w-full h-full">
                          <img src={content.photoUrl} className="w-full h-full object-cover" />
                          <button onClick={() => updateContentField('photoUrl', '')} className="absolute inset-0 flex items-center justify-center bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                          <User className="w-8 h-8 text-indigo-200 mb-1" />
                          <span className="text-[8px] font-black text-indigo-400 uppercase">Photo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => updateContentField('photoUrl', ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Nom affiché *</label>
                        <input type="text" required value={content.socialDisplayName || content.fullName || ''} onChange={e => {updateContentField('socialDisplayName', e.target.value); updateContentField('fullName', e.target.value);}} placeholder="Votre nom ou marque" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Pseudo / Username</label>
                        <input type="text" value={content.socialNickname || ''} onChange={e => updateContentField('socialNickname', e.target.value)} placeholder="@pseudo" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Profession / Activité</label>
                        <input type="text" value={content.socialProfession || content.jobTitle || ''} onChange={e => {updateContentField('socialProfession', e.target.value); updateContentField('jobTitle', e.target.value);}} placeholder="Ex: Créateur de contenu" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Entreprise</label>
                        <input type="text" value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom de votre structure" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Bio / Présentation Courte</label>
                      <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Dites-en plus sur vous en quelques lignes..." className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                    </div>

                    {/* Réseaux Sociaux Dédiés */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Directs</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative"><Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" /><input type="url" value={content.socialFacebookUrl || ''} onChange={e => updateContentField('socialFacebookUrl', e.target.value)} placeholder="Facebook" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" /><input type="url" value={content.socialInstagramUrl || ''} onChange={e => updateContentField('socialInstagramUrl', e.target.value)} placeholder="Instagram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><span className="absolute left-3 top-2.5 text-[9px] font-bold">Tik</span><input type="url" value={content.socialTikTokUrl || ''} onChange={e => updateContentField('socialTikTokUrl', e.target.value)} placeholder="TikTok" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" /><input type="url" value={content.socialYouTubeUrl || ''} onChange={e => updateContentField('socialYouTubeUrl', e.target.value)} placeholder="YouTube" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" /><input type="url" value={content.socialLinkedInUrl || ''} onChange={e => updateContentField('socialLinkedInUrl', e.target.value)} placeholder="LinkedIn" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Twitter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-500" /><input type="url" value={content.socialTwitterUrl || ''} onChange={e => updateContentField('socialTwitterUrl', e.target.value)} placeholder="X / Twitter" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Send className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-600" /><input type="url" value={content.socialTelegramUrl || ''} onChange={e => updateContentField('socialTelegramUrl', e.target.value)} placeholder="Telegram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-500" /><input type="url" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} placeholder="WhatsApp" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                      </div>
                    </div>

                    {/* Liens Personnalisés Libres */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Liens Personnalisés Libres</h5>
                        <button type="button" onClick={addSocialLink} className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-sm">+ Ajouter un lien</button>
                      </div>

                      <div className="space-y-3">
                        {content.socialLinks.map((link) => (
                          <div key={link.id} className="p-3 bg-white border border-indigo-100 rounded-2xl flex gap-3 items-start shadow-xs">
                            <div className="flex-1 space-y-2">
                              <input type="text" value={link.label || ''} onChange={e => {
                                const newLinks = content.socialLinks.map(l => l.id === link.id ? {...l, label: e.target.value} : l);
                                updateContentField('socialLinks', newLinks);
                              }} placeholder="Titre (ex: Mon Catalogue, Ma Boutique...)" className="w-full border-b border-slate-100 text-[11px] font-bold text-slate-800 outline-none pb-1" />
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-slate-400" />
                                <input type="url" value={link.url} onChange={e => updateSocialLink(link.id, link.platform, e.target.value)} placeholder="https://..." className="w-full text-[10px] text-indigo-600 outline-none" />
                              </div>
                            </div>
                            <button onClick={() => removeSocialLink(link.id)} className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR BUSINESS / SOCIÉTÉ */}
                {type === 'business' && (
                  <div className="space-y-6 pt-4 border-t border-slate-200 bg-slate-50/80 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Identification de la Société</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutionnel</span>
                    </div>

                    {/* Logo & Juridique */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-white space-y-3">
                        {content.logoUrl ? (
                          <div className="relative group">
                            <img src={content.logoUrl} className="w-24 h-24 object-contain" />
                            <button onClick={() => {updateContentField('logoUrl', ''); updateStylingField('logoUrl', '');}} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center cursor-pointer">
                            <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Logo Officiel</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  const url = ev.target?.result as string;
                                  updateContentField('logoUrl', url);
                                  updateStylingField('logoUrl', url);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} />
                          </label>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">Raison Sociale *</label>
                          <input type="text" required value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom officiel de l'entreprise" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:border-blue-600 outline-none shadow-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nom Commercial</label>
                          <input type="text" value={content.commercialName || ''} onChange={e => updateContentField('commercialName', e.target.value)} placeholder="Nom public (si différent)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-800 outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Forme Juridique</label>
                        <input type="text" value={content.businessType || ''} onChange={e => updateContentField('businessType', e.target.value)} placeholder="SARL, SA..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">RCCM</label>
                        <input type="text" value={content.businessRegisterNumber || ''} onChange={e => updateContentField('businessRegisterNumber', e.target.value)} placeholder="CI-ABJ-..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Compte Contribuable</label>
                        <input type="text" value={content.businessTaxId || ''} onChange={e => updateContentField('businessTaxId', e.target.value)} placeholder="N° CC" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Création</label>
                        <input type="text" value={content.businessCreationYear || ''} onChange={e => updateContentField('businessCreationYear', e.target.value)} placeholder="Ex: 2012" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Capital Social</label>
                        <input type="text" value={content.businessCapital || ''} onChange={e => updateContentField('businessCapital', e.target.value)} placeholder="Ex: 1 000 000 FCFA" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    {/* Activité */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Activité & Expertise</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Secteur d'activité</label>
                          <input type="text" value={content.industry || ''} onChange={e => updateContentField('industry', e.target.value)} placeholder="Ex: BTP, Conseil, IT..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Activité Principale</label>
                          <input type="text" value={content.businessMainActivity || ''} onChange={e => updateContentField('businessMainActivity', e.target.value)} placeholder="Ex: Construction d'infrastructures" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Description de la Société</label>
                        <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Présentation institutionnelle..." className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Produits</label>
                          <textarea rows={2} value={(content.productsList || []).join('\n')} onChange={e => updateContentField('productsList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Services</label>
                          <textarea rows={2} value={(content.servicesList || []).join('\n')} onChange={e => updateContentField('servicesList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Marques représentées</label>
                          <textarea rows={2} value={(content.brandsRepresented || []).join('\n')} onChange={e => updateContentField('brandsRepresented', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Responsable */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/40 p-4 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Direction / Responsable</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Nom du Responsable</label>
                          <input type="text" value={content.businessManagerName || ''} onChange={e => updateContentField('businessManagerName', e.target.value)} placeholder="Prénom Nom" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Fonction</label>
                          <input type="text" value={content.jobTitle || ''} onChange={e => updateContentField('jobTitle', e.target.value)} placeholder="Directeur Général, Gérant..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Responsable</label>
                          <input type="tel" value={content.businessManagerPhone || ''} onChange={e => updateContentField('businessManagerPhone', e.target.value)} placeholder="+225..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail Responsable</label>
                          <input type="email" value={content.businessManagerEmail || ''} onChange={e => updateContentField('businessManagerEmail', e.target.value)} placeholder="email@pro.com" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Coordonnées & GPS */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Coordonnées du Siège</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Siège</label>
                          <input type="tel" value={content.primaryPhone || ''} onChange={e => updateContentField('primaryPhone', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">WhatsApp Siège</label>
                          <input type="tel" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail général</label>
                          <input type="email" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Site internet</label>
                          <input type="url" value={content.websiteUrl || ''} onChange={e => updateContentField('websiteUrl', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Adresse du Siège</label>
                        <input type="text" value={content.address || ''} onChange={e => updateContentField('address', e.target.value)} placeholder="Immeuble, Rue, Commune..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>

                      <div className="p-4 bg-slate-800 rounded-2xl text-white space-y-3 shadow-lg shadow-blue-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <LocateFixed className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Position GPS du Siège</span>
                          </div>
                          <button type="button" onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                updateContentField('locationLatitude', pos.coords.latitude);
                                updateContentField('locationLongitude', pos.coords.longitude);
                              }, (err) => alert("Géoloc : " + err.message));
                            }
                          }} className="px-3 py-1 bg-white text-slate-900 text-[9px] font-black uppercase rounded-full hover:bg-blue-50 transition-colors shadow-sm">📍 Ma Position</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" step="any" value={content.locationLatitude || ''} onChange={e => updateContentField('locationLatitude', parseFloat(e.target.value))} placeholder="Latitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                          <input type="number" step="any" value={content.locationLongitude || ''} onChange={e => updateContentField('locationLongitude', parseFloat(e.target.value))} placeholder="Longitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                        </div>
                      </div>
                    </div>

                    {/* Documents & Liens */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/60 p-4 rounded-2xl shadow-inner">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Documents & Présentation</h5>
                      <div className="space-y-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Catalogue</span>
                          <input type="url" value={content.businessCatalogueUrl || ''} onChange={e => updateContentField('businessCatalogueUrl', e.target.value)} placeholder="Lien vers le catalogue PDF public" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Brochure</span>
                          <input type="url" value={content.businessBrochureUrl || ''} onChange={e => updateContentField('businessBrochureUrl', e.target.value)} placeholder="Lien vers la brochure PDF publique" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Société</span>
                          <input type="url" value={content.businessPresentationUrl || ''} onChange={e => updateContentField('businessPresentationUrl', e.target.value)} placeholder="Lien vers présentation entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <p className="text-[10px] text-rose-500 font-bold italic leading-relaxed">⚠️ Note de sécurité : Ne renseignez que des liens vers des documents publics hébergés sur internet (Cloud, Dropbox, Site web). Les documents confidentiels ne doivent pas être liés ici.</p>
                      </div>
                    </div>

                    {/* Réseaux Sociaux Business */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Professionnels</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" />
                          <input type="url" value={content.businessLinkedInUrl || ''} onChange={e => updateContentField('businessLinkedInUrl', e.target.value)} placeholder="LinkedIn Entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-700" />
                        </div>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" />
                          <input type="url" value={content.businessYouTubeUrl || ''} onChange={e => updateContentField('businessYouTubeUrl', e.target.value)} placeholder="Chaîne YouTube" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-red-600" />
                        </div>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" />
                          <input type="url" value={content.businessFacebookUrl || ''} onChange={e => updateContentField('businessFacebookUrl', e.target.value)} placeholder="Page Facebook" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" />
                          <input type="url" value={content.businessInstagramUrl || ''} onChange={e => updateContentField('businessInstagramUrl', e.target.value)} placeholder="Profil Instagram" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-rose-500" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-[10px] font-black text-slate-900">Tik</span>
                          <input type="url" value={content.businessTikTokUrl || ''} onChange={e => updateContentField('businessTikTokUrl', e.target.value)} placeholder="Compte TikTok" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Identity Fields */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Coordonnées Principales</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Prénom</label>
                      <input
                        type="text"
                        value={content.firstName || ''}
                        onChange={e => updateContentField('firstName', e.target.value)}
                        placeholder="Alexandre"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nom de famille</label>
                      <input
                        type="text"
                        value={content.lastName || ''}
                        onChange={e => updateContentField('lastName', e.target.value)}
                        placeholder="Durand"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fonction / Titre</label>
                      <input
                        type="text"
                        value={content.jobTitle || ''}
                        onChange={e => updateContentField('jobTitle', e.target.value)}
                        placeholder="Concepteur d'applications & Solutions Web"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Entreprise / Société / Marque</label>
                      <input
                        type="text"
                        value={content.company || ''}
                        onChange={e => updateContentField('company', e.target.value)}
                        placeholder="AGB"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Slogan / Devise Professionnelle</label>
                    <input
                      type="text"
                      value={content.slogan || ''}
                      onChange={e => updateContentField('slogan', e.target.value)}
                      placeholder="L'innovation numérique et le développement sur mesure"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bio / Présentation</label>
                    <textarea
                      rows={3}
                      value={content.bio || ''}
                      onChange={e => updateContentField('bio', e.target.value)}
                      placeholder="Présentez votre activité, vos expertises ou votre offre..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Téléphone Principal</label>
                      <input
                        type="tel"
                        value={content.primaryPhone || ''}
                        onChange={e => updateContentField('primaryPhone', e.target.value)}
                        placeholder="+225 01 04 00 00 00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Téléphone Secondaire</label>
                      <input
                        type="tel"
                        value={content.secondaryPhone || ''}
                        onChange={e => updateContentField('secondaryPhone', e.target.value)}
                        placeholder="+225 07 97 00 00 00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">WhatsApp Direct</label>
                      <input
                        type="tel"
                        value={content.whatsappNumber || ''}
                        onChange={e => updateContentField('whatsappNumber', e.target.value)}
                        placeholder="+225 01 04 00 00 00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-mail</label>
                      <input
                        type="email"
                        value={content.email || ''}
                        onChange={e => updateContentField('email', e.target.value)}
                        placeholder="atsegillesbrice@gmail.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Site Web</label>
                      <input
                        type="url"
                        value={content.websiteUrl || ''}
                        onChange={e => updateContentField('websiteUrl', e.target.value)}
                        placeholder="https://agb-solutions.ci"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Adresse / Quartier</label>
                      <input
                        type="text"
                        value={content.address || ''}
                        onChange={e => updateContentField('address', e.target.value)}
                        placeholder="Cocody Riviera"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ville & Pays</label>
                      <input
                        type="text"
                        value={content.city || ''}
                        onChange={e => updateContentField('city', e.target.value)}
                        placeholder="Abidjan – Côte d'Ivoire"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Zone d'intervention</label>
                      <input
                        type="text"
                        value={content.operatingZone || ''}
                        onChange={e => updateContentField('operatingZone', e.target.value)}
                        placeholder="Côte d'Ivoire & International"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Lien de Localisation (Google Maps / GPS / Itinéraire) */}
                  <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <label className="text-xs font-bold text-slate-800">
                          Lien de Localisation / Itinéraire GPS (Optionnel)
                        </label>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        Intégré au QR
                      </span>
                    </div>
                    <input
                      type="url"
                      value={content.locationLink || ''}
                      onChange={e => updateContentField('locationLink', e.target.value)}
                      placeholder="https://maps.app.goo.gl/... ou https://waze.com/ul/..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-blue-600 focus:outline-none transition-colors"
                    />
                    <p className="text-[11px] text-slate-500">
                      Permet au contact d'ouvrir directement votre itinéraire sur Google Maps, Apple Plans ou Waze en scannant le QR code.
                    </p>
                  </div>

                </div>

                {/* Case Autre / Informations complémentaires pour TOUS les types */}
                <div className="p-5 rounded-3xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Autres informations / Notes</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                      Libre
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={content.otherInformation || ''}
                    onChange={e => updateContentField('otherInformation', e.target.value)}
                    placeholder="Saisissez ici toute information complémentaire (notes, précisions, horaires spéciaux, messages, etc.)"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 focus:border-blue-600 focus:outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Tab 1 Footer Actions */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSaveInPlace}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Enregistrer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveInPlace();
                      setActiveStep('logo');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Étape 2 : Logo & Visuels</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Logo Entreprise & QR Code */}
            {activeStep === 'logo' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Logo Entreprise & QR Code</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Le logo de votre entreprise est synchronisé sur la fiche publique scannée et intégré au centre du QR Code avec correction d'erreur maximale (Niveau H).
                  </p>
                </div>

                {/* Logo Officiel de l'Entreprise */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-4">
                  <div className="flex items-center gap-4">
                    {styling.logoUrl || content.logoUrl ? (
                      <div className="w-20 h-20 rounded-2xl bg-white p-2 border-2 border-blue-600 shadow-md flex items-center justify-center overflow-hidden">
                        <img 
                          src={styling.logoUrl || content.logoUrl} 
                          alt="Logo Entreprise" 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-slate-300 flex items-center justify-center text-white text-2xl font-black shadow-sm">
                        {content.company?.[0] || content.firstName?.[0] || 'LOGO'}
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <span className="text-xs font-bold text-slate-800 block">Logo de l'entreprise</span>
                      <p className="text-[11px] text-slate-500">
                        Format carré recommandé (PNG, JPG, SVG ou WebP avec fond transparent ou blanc).
                      </p>
                      
                      <div className="flex items-center gap-2 pt-1">
                        <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{styling.logoUrl || content.logoUrl ? 'Modifier le logo' : 'Importer le logo'}</span>
                          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'logo')} className="hidden" />
                        </label>

                        {(styling.logoUrl || content.logoUrl) && (
                          <button
                            type="button"
                            onClick={() => {
                              updateStylingField('logoUrl', '');
                              updateContentField('logoUrl', '');
                            }}
                            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Option de personnalisation du logo dans le QR */}
                {(styling.logoUrl || content.logoUrl) && (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>Paramètres du logo dans le QR Code</span>
                    </h5>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Taille relative du logo</span>
                        <span className="font-mono font-bold text-blue-600">{Math.round((styling.logoSizeRatio || 0.22) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.15"
                        max="0.28"
                        step="0.01"
                        value={styling.logoSizeRatio || 0.22}
                        onChange={e => updateStylingField('logoSizeRatio', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <p className="text-[10px] text-slate-400">
                        Une taille entre 20% et 24% garantit une scannabilité optimale sur tous les smartphones.
                      </p>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR SOCIAL / BIO (LINKTREE STYLE) */}
                {type === 'social' && (
                  <div className="space-y-6 pt-4 border-t border-indigo-100 bg-indigo-50/40 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Profil Bio & Réseaux</h4>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Multi-liens</span>
                    </div>

                    {/* Photo de Profil / Avatar */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-full w-32 h-32 mx-auto bg-white space-y-2 overflow-hidden">
                      {content.photoUrl ? (
                        <div className="relative group w-full h-full">
                          <img src={content.photoUrl} className="w-full h-full object-cover" />
                          <button onClick={() => updateContentField('photoUrl', '')} className="absolute inset-0 flex items-center justify-center bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                          <User className="w-8 h-8 text-indigo-200 mb-1" />
                          <span className="text-[8px] font-black text-indigo-400 uppercase">Photo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => updateContentField('photoUrl', ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Nom affiché *</label>
                        <input type="text" required value={content.socialDisplayName || content.fullName || ''} onChange={e => {updateContentField('socialDisplayName', e.target.value); updateContentField('fullName', e.target.value);}} placeholder="Votre nom ou marque" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Pseudo / Username</label>
                        <input type="text" value={content.socialNickname || ''} onChange={e => updateContentField('socialNickname', e.target.value)} placeholder="@pseudo" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Profession / Activité</label>
                        <input type="text" value={content.socialProfession || content.jobTitle || ''} onChange={e => {updateContentField('socialProfession', e.target.value); updateContentField('jobTitle', e.target.value);}} placeholder="Ex: Créateur de contenu" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Entreprise</label>
                        <input type="text" value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom de votre structure" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Bio / Présentation Courte</label>
                      <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Dites-en plus sur vous en quelques lignes..." className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                    </div>

                    {/* Réseaux Sociaux Dédiés */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Directs</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative"><Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" /><input type="url" value={content.socialFacebookUrl || ''} onChange={e => updateContentField('socialFacebookUrl', e.target.value)} placeholder="Facebook" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" /><input type="url" value={content.socialInstagramUrl || ''} onChange={e => updateContentField('socialInstagramUrl', e.target.value)} placeholder="Instagram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><span className="absolute left-3 top-2.5 text-[9px] font-bold">Tik</span><input type="url" value={content.socialTikTokUrl || ''} onChange={e => updateContentField('socialTikTokUrl', e.target.value)} placeholder="TikTok" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" /><input type="url" value={content.socialYouTubeUrl || ''} onChange={e => updateContentField('socialYouTubeUrl', e.target.value)} placeholder="YouTube" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" /><input type="url" value={content.socialLinkedInUrl || ''} onChange={e => updateContentField('socialLinkedInUrl', e.target.value)} placeholder="LinkedIn" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Twitter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-500" /><input type="url" value={content.socialTwitterUrl || ''} onChange={e => updateContentField('socialTwitterUrl', e.target.value)} placeholder="X / Twitter" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Send className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-600" /><input type="url" value={content.socialTelegramUrl || ''} onChange={e => updateContentField('socialTelegramUrl', e.target.value)} placeholder="Telegram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-500" /><input type="url" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} placeholder="WhatsApp" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                      </div>
                    </div>

                    {/* Liens Personnalisés Libres */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Liens Personnalisés Libres</h5>
                        <button type="button" onClick={addSocialLink} className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-sm">+ Ajouter un lien</button>
                      </div>

                      <div className="space-y-3">
                        {content.socialLinks.map((link) => (
                          <div key={link.id} className="p-3 bg-white border border-indigo-100 rounded-2xl flex gap-3 items-start shadow-xs">
                            <div className="flex-1 space-y-2">
                              <input type="text" value={link.label || ''} onChange={e => {
                                const newLinks = content.socialLinks.map(l => l.id === link.id ? {...l, label: e.target.value} : l);
                                updateContentField('socialLinks', newLinks);
                              }} placeholder="Titre (ex: Mon Catalogue, Ma Boutique...)" className="w-full border-b border-slate-100 text-[11px] font-bold text-slate-800 outline-none pb-1" />
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-slate-400" />
                                <input type="url" value={link.url} onChange={e => updateSocialLink(link.id, link.platform, e.target.value)} placeholder="https://..." className="w-full text-[10px] text-indigo-600 outline-none" />
                              </div>
                            </div>
                            <button onClick={() => removeSocialLink(link.id)} className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR BUSINESS / SOCIÉTÉ */}
                {type === 'business' && (
                  <div className="space-y-6 pt-4 border-t border-slate-200 bg-slate-50/80 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Identification de la Société</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutionnel</span>
                    </div>

                    {/* Logo & Juridique */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-white space-y-3">
                        {content.logoUrl ? (
                          <div className="relative group">
                            <img src={content.logoUrl} className="w-24 h-24 object-contain" />
                            <button onClick={() => {updateContentField('logoUrl', ''); updateStylingField('logoUrl', '');}} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center cursor-pointer">
                            <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Logo Officiel</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  const url = ev.target?.result as string;
                                  updateContentField('logoUrl', url);
                                  updateStylingField('logoUrl', url);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} />
                          </label>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">Raison Sociale *</label>
                          <input type="text" required value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom officiel de l'entreprise" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:border-blue-600 outline-none shadow-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nom Commercial</label>
                          <input type="text" value={content.commercialName || ''} onChange={e => updateContentField('commercialName', e.target.value)} placeholder="Nom public (si différent)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-800 outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Forme Juridique</label>
                        <input type="text" value={content.businessType || ''} onChange={e => updateContentField('businessType', e.target.value)} placeholder="SARL, SA..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">RCCM</label>
                        <input type="text" value={content.businessRegisterNumber || ''} onChange={e => updateContentField('businessRegisterNumber', e.target.value)} placeholder="CI-ABJ-..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Compte Contribuable</label>
                        <input type="text" value={content.businessTaxId || ''} onChange={e => updateContentField('businessTaxId', e.target.value)} placeholder="N° CC" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Création</label>
                        <input type="text" value={content.businessCreationYear || ''} onChange={e => updateContentField('businessCreationYear', e.target.value)} placeholder="Ex: 2012" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Capital Social</label>
                        <input type="text" value={content.businessCapital || ''} onChange={e => updateContentField('businessCapital', e.target.value)} placeholder="Ex: 1 000 000 FCFA" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    {/* Activité */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Activité & Expertise</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Secteur d'activité</label>
                          <input type="text" value={content.industry || ''} onChange={e => updateContentField('industry', e.target.value)} placeholder="Ex: BTP, Conseil, IT..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Activité Principale</label>
                          <input type="text" value={content.businessMainActivity || ''} onChange={e => updateContentField('businessMainActivity', e.target.value)} placeholder="Ex: Construction d'infrastructures" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Description de la Société</label>
                        <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Présentation institutionnelle..." className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Produits</label>
                          <textarea rows={2} value={(content.productsList || []).join('\n')} onChange={e => updateContentField('productsList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Services</label>
                          <textarea rows={2} value={(content.servicesList || []).join('\n')} onChange={e => updateContentField('servicesList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Marques représentées</label>
                          <textarea rows={2} value={(content.brandsRepresented || []).join('\n')} onChange={e => updateContentField('brandsRepresented', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Responsable */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/40 p-4 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Direction / Responsable</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Nom du Responsable</label>
                          <input type="text" value={content.businessManagerName || ''} onChange={e => updateContentField('businessManagerName', e.target.value)} placeholder="Prénom Nom" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Fonction</label>
                          <input type="text" value={content.jobTitle || ''} onChange={e => updateContentField('jobTitle', e.target.value)} placeholder="Directeur Général, Gérant..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Responsable</label>
                          <input type="tel" value={content.businessManagerPhone || ''} onChange={e => updateContentField('businessManagerPhone', e.target.value)} placeholder="+225..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail Responsable</label>
                          <input type="email" value={content.businessManagerEmail || ''} onChange={e => updateContentField('businessManagerEmail', e.target.value)} placeholder="email@pro.com" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Coordonnées & GPS */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Coordonnées du Siège</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Siège</label>
                          <input type="tel" value={content.primaryPhone || ''} onChange={e => updateContentField('primaryPhone', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">WhatsApp Siège</label>
                          <input type="tel" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail général</label>
                          <input type="email" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Site internet</label>
                          <input type="url" value={content.websiteUrl || ''} onChange={e => updateContentField('websiteUrl', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Adresse du Siège</label>
                        <input type="text" value={content.address || ''} onChange={e => updateContentField('address', e.target.value)} placeholder="Immeuble, Rue, Commune..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>

                      <div className="p-4 bg-slate-800 rounded-2xl text-white space-y-3 shadow-lg shadow-blue-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <LocateFixed className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Position GPS du Siège</span>
                          </div>
                          <button type="button" onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                updateContentField('locationLatitude', pos.coords.latitude);
                                updateContentField('locationLongitude', pos.coords.longitude);
                              }, (err) => alert("Géoloc : " + err.message));
                            }
                          }} className="px-3 py-1 bg-white text-slate-900 text-[9px] font-black uppercase rounded-full hover:bg-blue-50 transition-colors shadow-sm">📍 Ma Position</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" step="any" value={content.locationLatitude || ''} onChange={e => updateContentField('locationLatitude', parseFloat(e.target.value))} placeholder="Latitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                          <input type="number" step="any" value={content.locationLongitude || ''} onChange={e => updateContentField('locationLongitude', parseFloat(e.target.value))} placeholder="Longitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                        </div>
                      </div>
                    </div>

                    {/* Documents & Liens */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/60 p-4 rounded-2xl shadow-inner">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Documents & Présentation</h5>
                      <div className="space-y-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Catalogue</span>
                          <input type="url" value={content.businessCatalogueUrl || ''} onChange={e => updateContentField('businessCatalogueUrl', e.target.value)} placeholder="Lien vers le catalogue PDF public" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Brochure</span>
                          <input type="url" value={content.businessBrochureUrl || ''} onChange={e => updateContentField('businessBrochureUrl', e.target.value)} placeholder="Lien vers la brochure PDF publique" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Société</span>
                          <input type="url" value={content.businessPresentationUrl || ''} onChange={e => updateContentField('businessPresentationUrl', e.target.value)} placeholder="Lien vers présentation entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <p className="text-[10px] text-rose-500 font-bold italic leading-relaxed">⚠️ Note de sécurité : Ne renseignez que des liens vers des documents publics hébergés sur internet (Cloud, Dropbox, Site web). Les documents confidentiels ne doivent pas être liés ici.</p>
                      </div>
                    </div>

                    {/* Réseaux Sociaux Business */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Professionnels</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" />
                          <input type="url" value={content.businessLinkedInUrl || ''} onChange={e => updateContentField('businessLinkedInUrl', e.target.value)} placeholder="LinkedIn Entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-700" />
                        </div>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" />
                          <input type="url" value={content.businessYouTubeUrl || ''} onChange={e => updateContentField('businessYouTubeUrl', e.target.value)} placeholder="Chaîne YouTube" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-red-600" />
                        </div>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" />
                          <input type="url" value={content.businessFacebookUrl || ''} onChange={e => updateContentField('businessFacebookUrl', e.target.value)} placeholder="Page Facebook" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" />
                          <input type="url" value={content.businessInstagramUrl || ''} onChange={e => updateContentField('businessInstagramUrl', e.target.value)} placeholder="Profil Instagram" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-rose-500" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-[10px] font-black text-slate-900">Tik</span>
                          <input type="url" value={content.businessTikTokUrl || ''} onChange={e => updateContentField('businessTikTokUrl', e.target.value)} placeholder="Compte TikTok" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR LOCATION / GPS */}
                {type === 'location' && (
                  <div className="space-y-6 pt-4 border-t border-blue-100 bg-blue-50/40 p-5 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                          <MapPinned className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">Localisation & GPS</h4>
                      </div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Navigation Directe</span>
                    </div>

                    {/* Photo du lieu */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 rounded-2xl bg-white/60 space-y-3">
                      {content.locationPhotoUrl ? (
                        <div className="relative group">
                          <img src={content.locationPhotoUrl} className="w-full max-h-48 object-cover rounded-lg shadow-md" />
                          <button
                            onClick={() => updateContentField('locationPhotoUrl', '')}
                            className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Photo du lieu (Facultatif)</p>
                          <label className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                            Choisir une photo
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => updateContentField('locationPhotoUrl', ev.target?.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Nom du lieu *</label>
                        <input
                          type="text"
                          required
                          value={content.locationPlaceName || ''}
                          onChange={e => updateContentField('locationPlaceName', e.target.value)}
                          placeholder="Ex: Siège AGB, Entrepôt Principal..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Type de lieu</label>
                        <input
                          type="text"
                          value={content.locationPlaceType || ''}
                          onChange={e => updateContentField('locationPlaceType', e.target.value)}
                          placeholder="Bureaux, Magasin, Dépôt..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Pays</label>
                        <input
                          type="text"
                          value={content.locationCountry || 'Côte d\'Ivoire'}
                          onChange={e => updateContentField('locationCountry', e.target.value)}
                          placeholder="Côte d'Ivoire"
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Ville (Recommandé)</label>
                        <input
                          type="text"
                          value={content.locationCity || ''}
                          onChange={e => updateContentField('locationCity', e.target.value)}
                          placeholder="Abidjan, Yamoussoukro..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Commune / Ville</label>
                        <input
                          type="text"
                          value={content.locationCommune || ''}
                          onChange={e => updateContentField('locationCommune', e.target.value)}
                          placeholder="Cocody, Marcory..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Quartier</label>
                        <input
                          type="text"
                          value={content.locationNeighborhood || ''}
                          onChange={e => updateContentField('locationNeighborhood', e.target.value)}
                          placeholder="Riviera 3, Angré..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Adresse exacte</label>
                      <input
                        type="text"
                        value={content.locationAddress || ''}
                        onChange={e => updateContentField('locationAddress', e.target.value)}
                        placeholder="Rue, lot, porte..."
                        className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Section GPS Automatique */}
                    <div className="p-5 bg-blue-600 rounded-3xl text-white space-y-4 shadow-lg shadow-blue-900/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LocateFixed className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Coordonnées GPS</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                updateContentField('locationLatitude', pos.coords.latitude);
                                updateContentField('locationLongitude', pos.coords.longitude);
                              }, (err) => alert("Impossible de récupérer la position : " + err.message));
                            } else {
                              alert("La géolocalisation n'est pas supportée par votre appareil.");
                            }
                          }}
                          className="px-3 py-1.5 bg-white text-blue-600 text-[10px] font-black uppercase rounded-full hover:bg-blue-50 transition-colors"
                        >
                          📍 Utiliser ma position actuelle
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-blue-100 uppercase mb-1">Latitude</label>
                          <input
                            type="number"
                            step="any"
                            value={content.locationLatitude || ''}
                            onChange={e => updateContentField('locationLatitude', parseFloat(e.target.value))}
                            className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-blue-100 uppercase mb-1">Longitude</label>
                          <input
                            type="number"
                            step="any"
                            value={content.locationLongitude || ''}
                            onChange={e => updateContentField('locationLongitude', parseFloat(e.target.value))}
                            className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Point de repère</label>
                        <input
                          type="text"
                          value={content.locationLandmark || ''}
                          onChange={e => updateContentField('locationLandmark', e.target.value)}
                          placeholder="Près de la pharmacie, en face de..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Horaires (Libre)</label>
                        <input
                          type="text"
                          value={content.locationOpeningHoursText || ''}
                          onChange={e => updateContentField('locationOpeningHoursText', e.target.value)}
                          placeholder="Ex: Lun-Ven 8h-18h"
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Description d'accès</label>
                      <textarea
                        rows={2}
                        value={content.locationAccessDescription || ''}
                        onChange={e => updateContentField('locationAccessDescription', e.target.value)}
                        placeholder="Détails pour arriver facilement (code porte, étage, etc.)"
                        className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Téléphone</label>
                        <input
                          type="tel"
                          value={content.locationPhone || ''}
                          onChange={e => updateContentField('locationPhone', e.target.value)}
                          placeholder="+225..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1.5">WhatsApp</label>
                        <input
                          type="tel"
                          value={content.locationWhatsapp || ''}
                          onChange={e => updateContentField('locationWhatsapp', e.target.value)}
                          placeholder="+225..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR SOCIAL / BIO (LINKTREE STYLE) */}
                {type === 'social' && (
                  <div className="space-y-6 pt-4 border-t border-indigo-100 bg-indigo-50/40 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Profil Bio & Réseaux</h4>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Multi-liens</span>
                    </div>

                    {/* Photo de Profil / Avatar */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-full w-32 h-32 mx-auto bg-white space-y-2 overflow-hidden">
                      {content.photoUrl ? (
                        <div className="relative group w-full h-full">
                          <img src={content.photoUrl} className="w-full h-full object-cover" />
                          <button onClick={() => updateContentField('photoUrl', '')} className="absolute inset-0 flex items-center justify-center bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                          <User className="w-8 h-8 text-indigo-200 mb-1" />
                          <span className="text-[8px] font-black text-indigo-400 uppercase">Photo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => updateContentField('photoUrl', ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Nom affiché *</label>
                        <input type="text" required value={content.socialDisplayName || content.fullName || ''} onChange={e => {updateContentField('socialDisplayName', e.target.value); updateContentField('fullName', e.target.value);}} placeholder="Votre nom ou marque" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Pseudo / Username</label>
                        <input type="text" value={content.socialNickname || ''} onChange={e => updateContentField('socialNickname', e.target.value)} placeholder="@pseudo" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Profession / Activité</label>
                        <input type="text" value={content.socialProfession || content.jobTitle || ''} onChange={e => {updateContentField('socialProfession', e.target.value); updateContentField('jobTitle', e.target.value);}} placeholder="Ex: Créateur de contenu" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Entreprise</label>
                        <input type="text" value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom de votre structure" className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-indigo-900 uppercase mb-1">Bio / Présentation Courte</label>
                      <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Dites-en plus sur vous en quelques lignes..." className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                    </div>

                    {/* Réseaux Sociaux Dédiés */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Directs</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative"><Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" /><input type="url" value={content.socialFacebookUrl || ''} onChange={e => updateContentField('socialFacebookUrl', e.target.value)} placeholder="Facebook" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" /><input type="url" value={content.socialInstagramUrl || ''} onChange={e => updateContentField('socialInstagramUrl', e.target.value)} placeholder="Instagram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><span className="absolute left-3 top-2.5 text-[9px] font-bold">Tik</span><input type="url" value={content.socialTikTokUrl || ''} onChange={e => updateContentField('socialTikTokUrl', e.target.value)} placeholder="TikTok" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" /><input type="url" value={content.socialYouTubeUrl || ''} onChange={e => updateContentField('socialYouTubeUrl', e.target.value)} placeholder="YouTube" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" /><input type="url" value={content.socialLinkedInUrl || ''} onChange={e => updateContentField('socialLinkedInUrl', e.target.value)} placeholder="LinkedIn" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Twitter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-500" /><input type="url" value={content.socialTwitterUrl || ''} onChange={e => updateContentField('socialTwitterUrl', e.target.value)} placeholder="X / Twitter" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><Send className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-600" /><input type="url" value={content.socialTelegramUrl || ''} onChange={e => updateContentField('socialTelegramUrl', e.target.value)} placeholder="Telegram" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                        <div className="relative"><MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-500" /><input type="url" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} placeholder="WhatsApp" className="w-full bg-white border border-indigo-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none" /></div>
                      </div>
                    </div>

                    {/* Liens Personnalisés Libres */}
                    <div className="space-y-4 pt-4 border-t border-indigo-200">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Liens Personnalisés Libres</h5>
                        <button type="button" onClick={addSocialLink} className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-sm">+ Ajouter un lien</button>
                      </div>

                      <div className="space-y-3">
                        {content.socialLinks.map((link) => (
                          <div key={link.id} className="p-3 bg-white border border-indigo-100 rounded-2xl flex gap-3 items-start shadow-xs">
                            <div className="flex-1 space-y-2">
                              <input type="text" value={link.label || ''} onChange={e => {
                                const newLinks = content.socialLinks.map(l => l.id === link.id ? {...l, label: e.target.value} : l);
                                updateContentField('socialLinks', newLinks);
                              }} placeholder="Titre (ex: Mon Catalogue, Ma Boutique...)" className="w-full border-b border-slate-100 text-[11px] font-bold text-slate-800 outline-none pb-1" />
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-slate-400" />
                                <input type="url" value={link.url} onChange={e => updateSocialLink(link.id, link.platform, e.target.value)} placeholder="https://..." className="w-full text-[10px] text-indigo-600 outline-none" />
                              </div>
                            </div>
                            <button onClick={() => removeSocialLink(link.id)} className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SPECIALIZED FORM SECTION FOR BUSINESS / SOCIÉTÉ */}
                {type === 'business' && (
                  <div className="space-y-6 pt-4 border-t border-slate-200 bg-slate-50/80 p-6 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Identification de la Société</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutionnel</span>
                    </div>

                    {/* Logo & Juridique */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-white space-y-3">
                        {content.logoUrl ? (
                          <div className="relative group">
                            <img src={content.logoUrl} className="w-24 h-24 object-contain" />
                            <button onClick={() => {updateContentField('logoUrl', ''); updateStylingField('logoUrl', '');}} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center cursor-pointer">
                            <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Logo Officiel</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  const url = ev.target?.result as string;
                                  updateContentField('logoUrl', url);
                                  updateStylingField('logoUrl', url);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} />
                          </label>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">Raison Sociale *</label>
                          <input type="text" required value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} placeholder="Nom officiel de l'entreprise" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:border-blue-600 outline-none shadow-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nom Commercial</label>
                          <input type="text" value={content.commercialName || ''} onChange={e => updateContentField('commercialName', e.target.value)} placeholder="Nom public (si différent)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-800 outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Forme Juridique</label>
                        <input type="text" value={content.businessType || ''} onChange={e => updateContentField('businessType', e.target.value)} placeholder="SARL, SA..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">RCCM</label>
                        <input type="text" value={content.businessRegisterNumber || ''} onChange={e => updateContentField('businessRegisterNumber', e.target.value)} placeholder="CI-ABJ-..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Compte Contribuable</label>
                        <input type="text" value={content.businessTaxId || ''} onChange={e => updateContentField('businessTaxId', e.target.value)} placeholder="N° CC" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Création</label>
                        <input type="text" value={content.businessCreationYear || ''} onChange={e => updateContentField('businessCreationYear', e.target.value)} placeholder="Ex: 2012" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Capital Social</label>
                        <input type="text" value={content.businessCapital || ''} onChange={e => updateContentField('businessCapital', e.target.value)} placeholder="Ex: 1 000 000 FCFA" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>
                    </div>

                    {/* Activité */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Activité & Expertise</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Secteur d'activité</label>
                          <input type="text" value={content.industry || ''} onChange={e => updateContentField('industry', e.target.value)} placeholder="Ex: BTP, Conseil, IT..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Activité Principale</label>
                          <input type="text" value={content.businessMainActivity || ''} onChange={e => updateContentField('businessMainActivity', e.target.value)} placeholder="Ex: Construction d'infrastructures" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Description de la Société</label>
                        <textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} placeholder="Présentation institutionnelle..." className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none resize-none leading-relaxed" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Produits</label>
                          <textarea rows={2} value={(content.productsList || []).join('\n')} onChange={e => updateContentField('productsList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Services</label>
                          <textarea rows={2} value={(content.servicesList || []).join('\n')} onChange={e => updateContentField('servicesList', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Marques représentées</label>
                          <textarea rows={2} value={(content.brandsRepresented || []).join('\n')} onChange={e => updateContentField('brandsRepresented', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} placeholder="Un par ligne" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Responsable */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/40 p-4 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Direction / Responsable</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Nom du Responsable</label>
                          <input type="text" value={content.businessManagerName || ''} onChange={e => updateContentField('businessManagerName', e.target.value)} placeholder="Prénom Nom" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Fonction</label>
                          <input type="text" value={content.jobTitle || ''} onChange={e => updateContentField('jobTitle', e.target.value)} placeholder="Directeur Général, Gérant..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Responsable</label>
                          <input type="tel" value={content.businessManagerPhone || ''} onChange={e => updateContentField('businessManagerPhone', e.target.value)} placeholder="+225..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail Responsable</label>
                          <input type="email" value={content.businessManagerEmail || ''} onChange={e => updateContentField('businessManagerEmail', e.target.value)} placeholder="email@pro.com" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Coordonnées & GPS */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-[10px] font-black uppercase text-slate-400">Coordonnées du Siège</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Téléphone Siège</label>
                          <input type="tel" value={content.primaryPhone || ''} onChange={e => updateContentField('primaryPhone', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">WhatsApp Siège</label>
                          <input type="tel" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail général</label>
                          <input type="email" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Site internet</label>
                          <input type="url" value={content.websiteUrl || ''} onChange={e => updateContentField('websiteUrl', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Adresse du Siège</label>
                        <input type="text" value={content.address || ''} onChange={e => updateContentField('address', e.target.value)} placeholder="Immeuble, Rue, Commune..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" />
                      </div>

                      <div className="p-4 bg-slate-800 rounded-2xl text-white space-y-3 shadow-lg shadow-blue-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <LocateFixed className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Position GPS du Siège</span>
                          </div>
                          <button type="button" onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                updateContentField('locationLatitude', pos.coords.latitude);
                                updateContentField('locationLongitude', pos.coords.longitude);
                              }, (err) => alert("Géoloc : " + err.message));
                            }
                          }} className="px-3 py-1 bg-white text-slate-900 text-[9px] font-black uppercase rounded-full hover:bg-blue-50 transition-colors shadow-sm">📍 Ma Position</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" step="any" value={content.locationLatitude || ''} onChange={e => updateContentField('locationLatitude', parseFloat(e.target.value))} placeholder="Latitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                          <input type="number" step="any" value={content.locationLongitude || ''} onChange={e => updateContentField('locationLongitude', parseFloat(e.target.value))} placeholder="Longitude" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white outline-none focus:border-blue-400" />
                        </div>
                      </div>
                    </div>

                    {/* Documents & Liens */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 bg-white/60 p-4 rounded-2xl shadow-inner">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Documents & Présentation</h5>
                      <div className="space-y-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Catalogue</span>
                          <input type="url" value={content.businessCatalogueUrl || ''} onChange={e => updateContentField('businessCatalogueUrl', e.target.value)} placeholder="Lien vers le catalogue PDF public" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Brochure</span>
                          <input type="url" value={content.businessBrochureUrl || ''} onChange={e => updateContentField('businessBrochureUrl', e.target.value)} placeholder="Lien vers la brochure PDF publique" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[9px] font-bold text-slate-400 uppercase">Société</span>
                          <input type="url" value={content.businessPresentationUrl || ''} onChange={e => updateContentField('businessPresentationUrl', e.target.value)} placeholder="Lien vers présentation entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-20 pr-4 py-2.5 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <p className="text-[10px] text-rose-500 font-bold italic leading-relaxed">⚠️ Note de sécurité : Ne renseignez que des liens vers des documents publics hébergés sur internet (Cloud, Dropbox, Site web). Les documents confidentiels ne doivent pas être liés ici.</p>
                      </div>
                    </div>

                    {/* Réseaux Sociaux Business */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Réseaux Sociaux Professionnels</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-700" />
                          <input type="url" value={content.businessLinkedInUrl || ''} onChange={e => updateContentField('businessLinkedInUrl', e.target.value)} placeholder="LinkedIn Entreprise" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-700" />
                        </div>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-2.5 w-3.5 h-3.5 text-red-600" />
                          <input type="url" value={content.businessYouTubeUrl || ''} onChange={e => updateContentField('businessYouTubeUrl', e.target.value)} placeholder="Chaîne YouTube" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-red-600" />
                        </div>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-600" />
                          <input type="url" value={content.businessFacebookUrl || ''} onChange={e => updateContentField('businessFacebookUrl', e.target.value)} placeholder="Page Facebook" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-600" />
                        </div>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-500" />
                          <input type="url" value={content.businessInstagramUrl || ''} onChange={e => updateContentField('businessInstagramUrl', e.target.value)} placeholder="Profil Instagram" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-rose-500" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-[10px] font-black text-slate-900">Tik</span>
                          <input type="url" value={content.businessTikTokUrl || ''} onChange={e => updateContentField('businessTikTokUrl', e.target.value)} placeholder="Compte TikTok" className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2 Footer Actions */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('content')}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ← Précédent
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveInPlace}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Enregistrer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveInPlace();
                        setActiveStep('social');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Étape 3 : Réseaux</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Social Links */}
            {activeStep === 'social' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Réseaux Sociaux</h4>
                    <p className="text-xs text-slate-500">Boutons cliquables sur la fiche mobile.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {content.socialLinks.map(social => (
                    <div key={social.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <select
                        value={social.platform}
                        onChange={e => updateSocialLink(social.id, e.target.value as any, social.url)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="twitter">X / Twitter</option>
                        <option value="facebook">Facebook</option>
                        <option value="youtube">YouTube</option>
                        <option value="telegram">Telegram</option>
                        <option value="github">GitHub</option>
                        <option value="website">Autre Lien</option>
                      </select>

                      <input
                        type="url"
                        value={social.url}
                        onChange={e => updateSocialLink(social.id, social.platform, e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => removeSocialLink(social.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tab 3 Footer Actions */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('logo')}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ← Précédent
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveInPlace}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Enregistrer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveInPlace();
                        setActiveStep('business');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Étape 4 : Entreprise</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Business, Services & Custom Fields */}
            {activeStep === 'business' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Informations Commerciales & Services</h4>
                  <p className="text-xs text-slate-500 mb-4">Mettez en avant vos services clés, zone d'intervention et mentions légales.</p>
                </div>

                {/* Services Principaux */}
                <div className="space-y-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Services Principaux & Solutions
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {(content.servicesList || []).length} service(s)
                    </span>
                  </div>

                  {/* Input to add custom service */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newServiceInput}
                      onChange={e => setNewServiceInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addService();
                        }
                      }}
                      placeholder="Ex: Applications mobiles, Logiciels SaaS..."
                      className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => addService()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>

                  {/* Quick Preset Badges */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Suggestions rapides :</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Applications mobiles',
                        'Applications Web',
                        'Logiciels de gestion',
                        'Solutions SaaS',
                        'Développement sur mesure',
                        'Conseil & Stratégie',
                        'Intégration d\'API'
                      ].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => addService(preset)}
                          className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Services List */}
                  <div className="space-y-1.5 pt-2">
                    {(content.servicesList || []).map((srv, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                          <span>{srv}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeService(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Retirer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">RCCM / SIREN / Immatriculation</label>
                    <input
                      type="text"
                      value={content.businessRegisterNumber || ''}
                      onChange={e => updateContentField('businessRegisterNumber', e.target.value)}
                      placeholder="CI-ABJ-2024-B-12849"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Numéro TVA / Compte Contribuable</label>
                    <input
                      type="text"
                      value={content.businessTaxId || ''}
                      onChange={e => updateContentField('businessTaxId', e.target.value)}
                      placeholder="CC-2409817-A"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Opening Hours Section in Business Tab */}
                <div className="pt-3 border-t border-slate-100">
                  <OpeningHoursEditor
                    hours={content.openingHours || DEFAULT_DAYS}
                    onChange={(newHours) => updateContentField('openingHours', newHours)}
                  />
                </div>

                {/* Custom Fields */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-800">Champs Personnalisés</h5>
                    <button
                      type="button"
                      onClick={addCustomField}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {content.customFields.map(field => (
                      <div key={field.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <input
                          type="text"
                          value={field.label}
                          onChange={e => updateCustomField(field.id, e.target.value, field.value, field.isPrivate)}
                          placeholder="Libellé"
                          className="w-1/3 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={e => updateCustomField(field.id, field.label, e.target.value, field.isPrivate)}
                          placeholder="Valeur"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomField(field.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tab 4 Footer Actions */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('social')}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ← Précédent
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveInPlace}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Enregistrer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveInPlace();
                        setActiveStep('style');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Étape 5 : Personnalisation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Visual QR Customizer */}
            {activeStep === 'style' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Personnalisation Visuelle</h4>
                  <p className="text-xs text-slate-500 mb-4">Palette de couleurs et style des motifs.</p>
                </div>

                {/* Color quick presets */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Palette Rapide</label>
                  <div className="flex gap-3">
                    {[
                      { color: '#2563eb', label: 'Bleu Royal' },
                      { color: '#0f172a', label: 'Noir Ardoise' },
                      { color: '#10b981', label: 'Émeraude' },
                      { color: '#f43f5e', label: 'Rose Rubis' },
                      { color: '#f59e0b', label: 'Ambre' },
                    ].map(preset => (
                      <div
                        key={preset.color}
                        onClick={() => {
                          updateStylingField('fgColor', preset.color);
                          updateStylingField('eyeColor', preset.color);
                        }}
                        style={{ backgroundColor: preset.color }}
                        className={`w-9 h-9 rounded-full cursor-pointer transition-transform hover:scale-110 ${
                          styling.fgColor === preset.color ? 'ring-2 ring-offset-2 ring-blue-600' : 'border border-slate-200'
                        }`}
                        title={preset.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Color pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Couleur des Modules</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styling.fgColor}
                        onChange={e => updateStylingField('fgColor', e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={styling.fgColor}
                        onChange={e => updateStylingField('fgColor', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Arrière-Plan</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styling.bgColor}
                        onChange={e => updateStylingField('bgColor', e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={styling.bgColor}
                        onChange={e => updateStylingField('bgColor', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Module Style */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Forme des Modules</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'square', label: 'Carré' },
                      { id: 'rounded', label: 'Arrondi' },
                      { id: 'smooth', label: 'Doux' },
                      { id: 'dots', label: 'Points' },
                    ].map(style => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => updateStylingField('moduleStyle', style.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          styling.moduleStyle === style.id
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eye Style */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Style des Yeux</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'square', label: 'Carré' },
                      { id: 'rounded', label: 'Arrondi' },
                      { id: 'circle', label: 'Cercle' },
                      { id: 'leaf', label: 'Feuille' },
                    ].map(eye => (
                      <button
                        key={eye.id}
                        type="button"
                        onClick={() => updateStylingField('eyeStyle', eye.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          styling.eyeStyle === eye.id
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {eye.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab 5 Footer Actions */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('business')}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ← Précédent
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveInPlace}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Enregistrer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveInPlace();
                        setActiveStep('settings');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Étape 6 : Options</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Dynamic vs Static & Privacy Options */}
            {activeStep === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mode & Sécurité</h4>
                  <p className="text-xs text-slate-500 mb-4">Mode dynamique ou statique et options de protection.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setMode('dynamic')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      mode === 'dynamic'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <h5 className="font-bold text-xs text-slate-800">QR Dynamique (Recommandé)</h5>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Modifiez le contenu sans réimprimer le code. Statistiques en temps réel.
                    </p>
                  </div>

                  <div
                    onClick={() => setMode('static')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      mode === 'static'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      <h5 className="font-bold text-xs text-slate-800">QR Statique</h5>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Données gravées dans le QR. Fonctionne 100% hors-ligne.
                    </p>
                  </div>
                </div>

                {/* Password Protection */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">Protection par Mot de Passe</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={content.privacy?.requirePassword || false}
                      onChange={e => updateContentField('privacy', { ...content.privacy, requirePassword: e.target.checked })}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {content.privacy?.requirePassword && (
                    <input
                      type="password"
                      value={content.privacy?.accessPassword || ''}
                      onChange={e => updateContentField('privacy', { ...content.privacy, accessPassword: e.target.value })}
                      placeholder="Mot de passe requis..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                    />
                  )}
                </div>

                {/* Tab 6 Footer Actions */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep('style')}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ← Précédent
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveInPlace}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Enregistrer</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Terminer & Enregistrer</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Right Column: Live Scannability Checker & Preview Card (5 cols) */}
        <div className="lg:col-span-5">
          <QRScannabilityCheck
            dataUrl={qrEncodedData}
            styling={styling}
            title={title}
            content={content}
            publicId={publicId}
            onUpdateStyling={updateStylingField}
            onOpenPrintStudio={onOpenPrintStudio ? () => {
              const currentItem = getCurrentItem();
              onOpenPrintStudio(currentItem);
            } : undefined}
            onOpenPreviewModal={onOpenSimulator ? () => {
              const currentItem = getCurrentItem();
              onOpenSimulator(currentItem);
            } : undefined}
          />
        </div>

      </div>

      {/* Sticky Bottom Action Toolbar */}
      <div className="fixed bottom-3 inset-x-4 max-w-7xl mx-auto z-40 bg-slate-900/95 backdrop-blur-md text-white border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Check className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                {title || 'Nouvelle Carte de Visite'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] border border-emerald-500/30 shrink-0">
                ID: {publicId}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Enregistrement instantané actif. Les données sont conservées dans l'application.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          {onOpenSimulator && (
            <button
              type="button"
              onClick={() => onOpenSimulator(getCurrentItem())}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Aperçu mobile"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Aperçu Mobile</span>
            </button>
          )}

          {onOpenPrintStudio && (
            <button
              type="button"
              onClick={() => onOpenPrintStudio(getCurrentItem())}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Export Recto-Verso PDF"
            >
              <Printer className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Imprimer PDF</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveInPlace}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer & Fermer</span>
          </button>
        </div>
      </div>

    </div>
  );
};
