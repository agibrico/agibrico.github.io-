import React, { useState, useEffect } from 'react';
import {
  User, Building2, Share2, ShoppingBag, Image as ImageIcon, Calendar, MapPin, Globe, Sparkles, Plus, Trash2, Lock, Check, Palette, Upload, Clock, Shield, Sliders, Layers, ArrowRight, Eye, Save, X, FileCode, Info, BookOpen, Store, Navigation, CheckCircle2, Smartphone, Printer, CalendarDays, Hash, Languages, DollarSign, ShoppingCart, Facebook, Instagram, Truck, Wallet, Package, MapPinned, LocateFixed, Linkedin, Youtube, FileText, Briefcase, Twitter, Send, MessageSquare, Book, Link, Map, UserPlus, List, ImagePlus, FileUp, Star, Tag, Activity, CheckSquare, LayoutList, GripVertical, Phone, BadgeCheck, GraduationCap, Quote, Users, Landmark, TruckIcon, CreditCard, PenTool, BookMarked, Languages as LangIcon, Headphones, Video
} from 'lucide-react';
import { QRCodeItem, QRType, QRMode, QRStyling, QRContent, CustomField, SocialLink, OpeningHourDay } from '../../types/qr';
import { generateSecurePublicId, getPublicQRUrl, saveOrUpdateQRCode } from '../../utils/storage';
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

export const QREditor: React.FC<QREditorProps> = ({ initialItem, onSave, onCancel, onOpenPrintStudio, onOpenSimulator }) => {
  const isEditing = Boolean(initialItem);
  const [title, setTitle] = useState(initialItem?.title || 'Nouvelle Fiche');
  const [type, setType] = useState<QRType>(initialItem?.type || 'BUSINESS_CARD');
  const [mode, setMode] = useState<QRMode>(initialItem?.mode || 'dynamic');
  const [publicId] = useState<string>(initialItem?.publicId || generateSecurePublicId());
  const [activeStep, setActiveStep] = useState<'content' | 'logo' | 'style' | 'settings'>('content');

  const [content, setContent] = useState<QRContent>(initialItem?.content || {
    firstName: '', lastName: '', fullName: '', company: '', jobTitle: '', industry: '', bio: '',
    photoUrl: '', logoUrl: '', primaryPhone: '', whatsappNumber: '', email: '', websiteUrl: '',
    address: '', city: '', country: '', languagesSpoken: [], servicesOffered: [],
    openingHours: DEFAULT_DAYS, socialLinks: [], customFields: [], customSections: [],
    privacy: { hideAddress: false }, productSheetType: 'PRODUCT', menuItems: [],
    socialDisplayName: '', socialNickname: '', socialProfession: '',
    linkDestinationUrl: '', redirectMode: 'LANDING_PAGE',
    eventTitle: '', eventStartDate: '', eventStartTime: '',
    shopIndustry: '', companyLegalForm: '',
    bookTitle: '', bookAuthor: '',
    locationPlaceName: ''
  } as any);

  const [styling, setStyling] = useState<QRStyling>(initialItem?.styling || {
    fgColor: '#0f172a', bgColor: '#ffffff', moduleStyle: 'rounded', eyeStyle: 'rounded', eyeColor: '#2563eb',
    margin: 2, errorCorrectionLevel: 'H', logoSizeRatio: 0.22, bottomText: 'SCANNEZ MOI'
  });

  const updateContentField = <K extends keyof QRContent>(key: K, value: QRContent[K]) => setContent(prev => ({ ...prev, [key]: value }));
  const updateStylingField = <K extends keyof QRStyling>(key: K, value: QRStyling[K]) => setStyling(prev => ({ ...prev, [key]: value }));

  const getCurrentItem = (): QRCodeItem => ({
    id: initialItem?.id || `qr_${publicId}`,
    publicId, title, type, mode, status: initialItem?.status || 'active',
    createdAt: initialItem?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(), scanCount: initialItem?.scanCount || 0,
    content, styling
  });

  useEffect(() => { saveOrUpdateQRCode(getCurrentItem(), true); }, [title, type, mode, content, styling]);

  const handleSave = () => { onSave(getCurrentItem()); };

  const qrTypesList = [
    { type: 'BUSINESS_CARD', label: 'Carte Visite', desc: 'vCard Pro', icon: User },
    { type: 'BOOK', label: 'Livre', desc: 'Fiche Livre & ISBN', icon: BookOpen },
    { type: 'EVENT', label: 'Événement', desc: 'Invitation & RSVP', icon: Calendar },
    { type: 'SHOP', label: 'Boutique', desc: 'Commerce & Horaires', icon: Store },
    { type: 'LOCATION', label: 'Lieu / GPS', desc: 'Position & Itinéraire', icon: MapPin },
    { type: 'COMPANY', label: 'Entreprise', desc: 'Profil Institutionnel', icon: Building2 },
    { type: 'SOCIAL', label: 'Bio & Réseaux', desc: 'Page Multi-liens', icon: Share2 },
    { type: 'PRODUCT', label: 'Produit/Menu', desc: 'Catalogue & Carte', icon: ShoppingBag },
    { type: 'WEB_LINK', label: 'Lien Web', desc: 'Redirection Simple', icon: Globe },
    { type: 'CUSTOM', label: 'Personnalisée', desc: 'Fiche sur mesure', icon: Sparkles },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex-1 w-full">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="text-xl font-black w-full outline-none border-b border-transparent focus:border-blue-600" placeholder="Titre de la fiche..." />
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Annuler</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Enregistrer</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex gap-1 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto shadow-inner">
            {['content', 'logo', 'style', 'settings'].map(tab => (
              <button key={tab} onClick={() => setActiveStep(tab as any)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeStep === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{tab}</button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8 min-h-[400px]">
            {activeStep === 'content' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {qrTypesList.map(item => (
                    <button key={item.type} onClick={() => setType(item.type as any)} className={`p-3.5 rounded-2xl border text-left transition-all group ${type === item.type ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/10' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <item.icon className={`w-5 h-5 mb-2 group-hover:scale-110 transition-transform ${type === item.type ? 'text-blue-600' : 'text-slate-400'}`} />
                      <p className="text-[10px] font-black uppercase tracking-tighter text-slate-900 leading-tight">{item.label}</p>
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  {/* --- 1. BUSINESS CARD --- */}
                  {type === 'BUSINESS_CARD' && (
                    <div className="space-y-10">
                      {/* IDENTITY */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><User className="w-4 h-4 text-slate-600"/> Identité</h4>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative group">
                              {content.photoUrl ? (
                                <div className="relative"><img src={content.photoUrl} className="w-16 h-16 rounded-xl object-cover shadow-md" /><button onClick={() => updateContentField('photoUrl', '')} className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3"/></button></div>
                              ) : (
                                <label className="flex flex-col items-center cursor-pointer"><ImageIcon className="w-5 h-5 text-slate-300 mb-1" /><span className="text-[8px] font-black uppercase text-slate-400">Photo Profil</span><input type="file" className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if(file) { const r = new FileReader(); r.onload = ev => updateContentField('photoUrl', ev.target?.result as string); r.readAsDataURL(file); } }} /></label>
                              )}
                           </div>
                           <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative group">
                              {content.logoUrl ? (
                                <div className="relative"><img src={content.logoUrl} className="w-16 h-16 rounded-xl object-contain shadow-md p-1 bg-white" /><button onClick={() => updateContentField('logoUrl', '')} className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3"/></button></div>
                              ) : (
                                <label className="flex flex-col items-center cursor-pointer"><Building2 className="w-5 h-5 text-slate-300 mb-1" /><span className="text-[8px] font-black uppercase text-slate-400">Logo Entreprise</span><input type="file" className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if(file) { const r = new FileReader(); r.onload = ev => updateContentField('logoUrl', ev.target?.result as string); r.readAsDataURL(file); } }} /></label>
                              )}
                           </div>
                        </div>

                        <div className="grid grid-cols-6 gap-4">
                          <div className="col-span-1">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Civilité</label>
                            <select value={content.civility || ''} onChange={e => updateContentField('civility', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-xs font-bold">
                              <option value="">—</option>
                              <option value="M.">M.</option>
                              <option value="Mme">Mme</option>
                              <option value="Mlle">Mlle</option>
                              <option value="Dr.">Dr.</option>
                              <option value="Prof.">Prof.</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Prénom(s)</label>
                            <input type="text" placeholder="Gilles Brice" value={content.firstName || ''} onChange={e => updateContentField('firstName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="col-span-1">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Second Prénom</label>
                            <input type="text" placeholder="..." value={content.middleName || ''} onChange={e => updateContentField('middleName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Nom</label>
                            <input type="text" placeholder="ATSÉ" value={content.lastName || ''} onChange={e => updateContentField('lastName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>
                        <input type="text" placeholder="Nom Complet d'affichage (ex: Gilles Brice ATSÉ)" value={content.fullName || ''} onChange={e => updateContentField('fullName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                      </div>

                      {/* PROFESSIONAL */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Briefcase className="w-4 h-4 text-purple-600"/> Professionnel</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Poste actuel / Titre (ex: Ingénieur)" value={content.jobTitle || ''} onChange={e => updateContentField('jobTitle', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Profession" value={content.profession || ''} onChange={e => updateContentField('profession', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Entreprise" value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Département" value={content.department || ''} onChange={e => updateContentField('department', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <input type="text" placeholder="Slogan / Devise" value={content.slogan || ''} onChange={e => updateContentField('slogan', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        <textarea placeholder="Biographie professionnelle..." value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={3} />
                      </div>

                      {/* CONTACT */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-600"/> Coordonnées</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Tél. Principal</label>
                            <input type="tel" placeholder="+225..." value={content.primaryPhone || ''} onChange={e => updateContentField('primaryPhone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Tél. Secondaire</label>
                            <input type="tel" placeholder="+225..." value={content.secondaryPhone || ''} onChange={e => updateContentField('secondaryPhone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Tél. Travail</label>
                            <input type="tel" placeholder="+225..." value={content.workPhone || ''} onChange={e => updateContentField('workPhone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">WhatsApp</label>
                            <input type="tel" placeholder="+225..." value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold border-emerald-200 focus:ring-emerald-500" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">E-mail Principal</label>
                            <input type="email" placeholder="contact@domaine.com" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">E-mail Travail</label>
                            <input type="email" placeholder="work@company.com" value={content.workEmail || ''} onChange={e => updateContentField('workEmail', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Site Web</label>
                            <input type="url" placeholder="https://..." value={content.websiteUrl || ''} onChange={e => updateContentField('websiteUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-blue-600" />
                          </div>
                        </div>
                      </div>

                      {/* ADDRESS */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><MapPinned className="w-4 h-4 text-rose-600"/> Adresse & Localisation</h4>
                        <textarea placeholder="Adresse complète / Rue" value={content.address || ''} onChange={e => updateContentField('address', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Commune / Quartier" value={content.commune || content.neighborhood || ''} onChange={e => updateContentField('commune', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Ville" value={content.city || ''} onChange={e => updateContentField('city', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <input type="text" placeholder="Région / État" value={content.region || ''} onChange={e => updateContentField('region', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Code Postal" value={content.postalCode || ''} onChange={e => updateContentField('postalCode', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Pays" value={content.country || ''} onChange={e => updateContentField('country', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Latitude</label>
                            <input type="number" step="any" placeholder="0.000000" value={content.latitude || ''} onChange={e => updateContentField('latitude', parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Longitude</label>
                            <input type="number" step="any" placeholder="0.000000" value={content.longitude || ''} onChange={e => updateContentField('longitude', parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>
                      </div>

                      {/* SOCIAL */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Share2 className="w-4 h-4 text-indigo-600"/> Réseaux Sociaux</h4>
                          <button onClick={() => updateContentField('socialLinks', [...(content.socialLinks || []), { id: `link_${Date.now()}`, platform: 'website', url: '', label: '', displayOrder: (content.socialLinks?.length || 0) + 1 }])} className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-full shadow-lg">+ Ajouter</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(content.socialLinks || []).map((link, idx) => (
                            <div key={link.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                              <select
                                value={link.platform}
                                onChange={e => {
                                  const newList = [...content.socialLinks!];
                                  newList[idx].platform = e.target.value as any;
                                  updateContentField('socialLinks', newList);
                                }}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase"
                              >
                                <option value="facebook">Facebook</option>
                                <option value="instagram">Instagram</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="twitter">X (Twitter)</option>
                                <option value="youtube">YouTube</option>
                                <option value="tiktok">TikTok</option>
                                <option value="snapchat">Snapchat</option>
                                <option value="telegram">Telegram</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="website">Site Web</option>
                              </select>
                              <input type="url" placeholder="Lien ou @username" value={link.url} onChange={e => {
                                const newList = [...content.socialLinks!];
                                newList[idx].url = e.target.value;
                                updateContentField('socialLinks', newList);
                              }} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] text-blue-600 font-bold" />
                              <button onClick={() => updateContentField('socialLinks', content.socialLinks!.filter(l => l.id !== link.id))} className="text-rose-500 p-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ADDITIONAL */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4 text-amber-600"/> Informations Complémentaires</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Disponibilité</label>
                            <input type="text" placeholder="ex: Lun-Ven, 8h-18h" value={content.availabilityHours || ''} onChange={e => updateContentField('availabilityHours', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Langues (virgules)</label>
                            <input type="text" placeholder="Français, Anglais..." value={content.languagesSpoken?.join(', ') || ''} onChange={e => updateContentField('languagesSpoken', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400">Services Offerts (virgules)</label>
                          <input type="text" placeholder="Audit, Conseil, Développement..." value={content.servicesOffered?.join(', ') || ''} onChange={e => updateContentField('servicesOffered', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                      </div>

                      {/* LINKS & DOCS */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Link className="w-4 h-4 text-slate-500"/> Liens & Documents</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="url" placeholder="Lien Catalogue" value={content.catalogUrl || ''} onChange={e => updateContentField('catalogUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          <input type="url" placeholder="Lien Brochure PDF" value={content.brochurePdfUrl || ''} onChange={e => updateContentField('brochurePdfUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="url" placeholder="Lien Portfolio" value={content.portfolioUrl || ''} onChange={e => updateContentField('portfolioUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          <input type="url" placeholder="Lien Réservation / Booking" value={content.bookingLink || ''} onChange={e => updateContentField('bookingLink', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="url" placeholder="Lien Paiement" value={content.paymentLink || ''} onChange={e => updateContentField('paymentLink', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          <input type="text" placeholder="Notes Publiques" value={content.publicNotes || ''} onChange={e => updateContentField('publicNotes', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- 2. BOOK --- */}
                  {type === 'BOOK' && (
                    <div className="space-y-10">
                      {/* 1. Identification */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-600"/> 1. Identification</h4>

                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50 relative group mb-6">
                          {content.photoUrl ? (
                            <div className="relative">
                              <img src={content.photoUrl} className="h-48 w-32 rounded-xl object-cover shadow-2xl border-4 border-white" />
                              <button onClick={() => updateContentField('photoUrl', '')} className="absolute -top-3 -right-3 p-2 bg-rose-600 text-white rounded-full shadow-xl hover:scale-110 transition-all"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center cursor-pointer group">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 group-hover:text-indigo-500 shadow-xl border border-slate-100 transition-all mb-3"><ImageIcon className="w-8 h-8" /></div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Couverture du livre</span>
                              <input type="file" className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if(file) { const r = new FileReader(); r.onload = ev => updateContentField('photoUrl', ev.target?.result as string); r.readAsDataURL(file); } }} />
                            </label>
                          )}
                        </div>

                        <div className="space-y-4">
                          <input type="text" placeholder="Titre principal de l'ouvrage" value={content.bookTitle || ''} onChange={e => updateContentField('bookTitle', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Sous-titre (facultatif)" value={content.bookSubtitle || ''} onChange={e => updateContentField('bookSubtitle', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Titre Original (si traduction)" value={content.bookOriginalTitle || ''} onChange={e => updateContentField('bookOriginalTitle', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Auteur Principal</label>
                            <input type="text" placeholder="Nom de l'auteur" value={content.bookAuthor || ''} onChange={e => updateContentField('bookAuthor', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Co-auteur(s)</label>
                            <input type="text" placeholder="Contributeurs" value={content.bookCoAuthor || ''} onChange={e => updateContentField('bookCoAuthor', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Illustrateur</label>
                            <input type="text" placeholder="..." value={content.bookIllustrator || ''} onChange={e => updateContentField('bookIllustrator', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Traducteur</label>
                            <input type="text" placeholder="..." value={content.bookTranslator || ''} onChange={e => updateContentField('bookTranslator', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Préface par</label>
                            <input type="text" placeholder="..." value={content.bookPrefaceAuthor || ''} onChange={e => updateContentField('bookPrefaceAuthor', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Maison d'Édition</label>
                            <input type="text" placeholder="Éditeur" value={content.bookPublisher || ''} onChange={e => updateContentField('bookPublisher', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Collection / Édition</label>
                            <input type="text" placeholder="ex: Folio, 2026..." value={content.bookPublisherCollection || content.bookEdition || ''} onChange={e => updateContentField('bookPublisherCollection', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>
                      </div>

                      {/* 2. Edition & Publication */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><PenTool className="w-4 h-4 text-slate-600"/> 2. Édition & Publication</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">ISBN-13</label>
                            <input type="text" placeholder="978-..." value={content.bookIsbn13 || ''} onChange={e => updateContentField('bookIsbn13', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">ISBN-10</label>
                            <input type="text" placeholder="..." value={content.bookIsbn10 || ''} onChange={e => updateContentField('bookIsbn10', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">ISSN</label>
                            <input type="text" placeholder="..." value={content.bookIssn || ''} onChange={e => updateContentField('bookIssn', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-bold" />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">N° Édition</label>
                            <input type="text" placeholder="1" value={content.bookEditionNumber || ''} onChange={e => updateContentField('bookEditionNumber', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Année</label>
                            <input type="text" placeholder="2026" value={content.bookYear || ''} onChange={e => updateContentField('bookYear', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-bold" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Date de parution</label>
                            <input type="date" value={content.bookDate || ''} onChange={e => updateContentField('bookDate', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-bold uppercase" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Lieu</label>
                            <input type="text" placeholder="Ville, Pays" value={content.bookPlace || ''} onChange={e => updateContentField('bookPlace', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Langue</label>
                            <input type="text" placeholder="Français" value={content.bookLanguage || ''} onChange={e => updateContentField('bookLanguage', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Langue Orig.</label>
                            <input type="text" placeholder="Anglais" value={content.bookOriginalLanguage || ''} onChange={e => updateContentField('bookOriginalLanguage', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                        </div>
                      </div>

                      {/* 3. Characteristics */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-600"/> 3. Caractéristiques</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Genre</label>
                            <input type="text" placeholder="Roman, Essai..." value={content.bookGenre || ''} onChange={e => updateContentField('bookGenre', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Catégorie</label>
                            <input type="text" placeholder="Fiction, Droit..." value={content.bookCategory || ''} onChange={e => updateContentField('bookCategory', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Sous-cat.</label>
                            <input type="text" placeholder="..." value={content.bookSubCategory || ''} onChange={e => updateContentField('bookSubCategory', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Public Cible</label>
                            <input type="text" placeholder="Adulte, Jeunesse..." value={content.bookTargetAudience || ''} onChange={e => updateContentField('bookTargetAudience', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Niveau de lecture</label>
                            <input type="text" placeholder="Intermédiaire..." value={content.bookReadingLevel || ''} onChange={e => updateContentField('bookReadingLevel', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Pages</label>
                            <input type="text" placeholder="320" value={content.bookPages || ''} onChange={e => updateContentField('bookPages', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Format</label>
                            <input type="text" placeholder="Poche, A5..." value={content.bookFormat || ''} onChange={e => updateContentField('bookFormat', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Type Couverture</label>
                            <input type="text" placeholder="Souple, Rigide..." value={content.bookCoverType || ''} onChange={e => updateContentField('bookCoverType', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Dimensions</label>
                            <input type="text" placeholder="15x21 cm" value={content.bookDimensions || ''} onChange={e => updateContentField('bookDimensions', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Poids (g)</label>
                            <input type="text" placeholder="450g" value={content.bookWeight || ''} onChange={e => updateContentField('bookWeight', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Version / Support</label>
                            <select value={content.bookMediumType || 'paper'} onChange={e => updateContentField('bookMediumType', e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[9px] font-black uppercase">
                              <option value="paper">Papier</option>
                              <option value="digital">Numérique</option>
                              <option value="audio">Audio</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* 4. Presentation */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><LayoutList className="w-4 h-4 text-slate-500"/> 4. Présentation</h4>
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Résumé (Court)</label>
                            <textarea placeholder="Brève présentation..." value={content.bookSummary || ''} onChange={e => updateContentField('bookSummary', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Synopsis / Description Longue</label>
                            <textarea placeholder="L'histoire ou le sujet en détail..." value={content.bookSynopsis || content.bookLongDescription || ''} onChange={e => updateContentField('bookSynopsis', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={4} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Bio de l'Auteur</label>
                            <textarea placeholder="À propos de l'auteur..." value={content.bookAuthorBio || ''} onChange={e => updateContentField('bookAuthorBio', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={3} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Table des Matières</label>
                            <textarea placeholder="Sommaire..." value={content.bookTableOfContents || ''} onChange={e => updateContentField('bookTableOfContents', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={3} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Mots-clés (virgules)</label>
                            <input type="text" placeholder="Aventure, Histoire..." value={content.bookKeywords?.join(', ') || ''} onChange={e => updateContentField('bookKeywords', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Thèmes (virgules)</label>
                            <input type="text" placeholder="Famille, Guerre..." value={content.bookThemes?.join(', ') || ''} onChange={e => updateContentField('bookThemes', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400">Extrait Public (Lien ou Texte)</label>
                          <textarea placeholder="Quelques lignes ou lien vers un PDF..." value={content.bookExerpt || ''} onChange={e => updateContentField('bookExerpt', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={3} />
                        </div>
                      </div>

                      {/* 5. Sales */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><DollarSign className="w-4 h-4 text-amber-600"/> 5. Vente & Commandes</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Prix Public</label>
                            <input type="text" placeholder="Prix" value={content.bookPrice || ''} onChange={e => updateContentField('bookPrice', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-emerald-600" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Prix Promo</label>
                            <input type="text" placeholder="Promo" value={content.bookPromoPrice || ''} onChange={e => updateContentField('bookPromoPrice', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-rose-500" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Devise</label>
                            <input type="text" placeholder="FCFA" value={content.bookCurrency || 'FCFA'} onChange={e => updateContentField('bookCurrency', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Disponibilité</label>
                            <input type="text" placeholder="En stock, Sur commande..." value={content.bookStockStatus || ''} onChange={e => updateContentField('bookStockStatus', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Points de Vente</label>
                            <input type="text" placeholder="Librairies..." value={content.bookSalePoints || ''} onChange={e => updateContentField('bookSalePoints', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Tél. Commande</label>
                            <input type="tel" placeholder="+225..." value={content.bookOrderPhone || ''} onChange={e => updateContentField('bookOrderPhone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">WhatsApp</label>
                            <input type="tel" placeholder="+225..." value={content.bookOrderWhatsapp || ''} onChange={e => updateContentField('bookOrderWhatsapp', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold border-emerald-200" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Email Commande</label>
                            <input type="email" placeholder="sales@..." value={content.bookOrderEmail || ''} onChange={e => updateContentField('bookOrderEmail', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Lien Boutique en ligne</label>
                            <input type="url" placeholder="https://..." value={content.bookBuyUrl || content.bookOnlineStoreUrl || ''} onChange={e => updateContentField('bookBuyUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-blue-600" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Lien E-book (Téléchargement)</label>
                              <input type="url" placeholder="https://..." value={content.bookEbookUrl || content.bookDownloadUrl || ''} onChange={e => updateContentField('bookEbookUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Lien Livre Audio</label>
                              <input type="url" placeholder="https://..." value={content.bookAudioUrl || ''} onChange={e => updateContentField('bookAudioUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 6. Medias */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><ImageIcon className="w-4 h-4 text-purple-600"/> 6. Médias & Promotion</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Lien Trailer Vidéo</label>
                            <input type="url" placeholder="YouTube, Vimeo..." value={content.bookTrailerUrl || ''} onChange={e => updateContentField('bookTrailerUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Vidéo de Présentation</label>
                            <input type="url" placeholder="Lien vidéo..." value={content.bookPresentationVideoUrl || ''} onChange={e => updateContentField('bookPresentationVideoUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Interview Auteur</label>
                            <input type="url" placeholder="Lien interview..." value={content.bookInterviewUrl || ''} onChange={e => updateContentField('bookInterviewUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Dossier de Presse (PDF)</label>
                            <input type="url" placeholder="Lien PDF..." value={content.bookPresentationPdfUrl || ''} onChange={e => updateContentField('bookPresentationPdfUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400">Lien Site Web Auteur</label>
                          <input type="url" placeholder="https://..." value={content.bookAuthorWebsite || ''} onChange={e => updateContentField('bookAuthorWebsite', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold text-blue-600" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400">Lien Extrait Web (Alternative)</label>
                          <input type="url" placeholder="Lien vers chapitre 1..." value={content.bookExerptUrl || ''} onChange={e => updateContentField('bookExerptUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- 3. EVENT --- */}
                  {type === 'EVENT' && (
                    <div className="space-y-10">
                      {/* IDENTITY */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Calendar className="w-4 h-4 text-rose-600"/> 1. Identité de l'Événement</h4>

                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50 relative group mb-6">
                          {content.eventPosterUrl ? (
                            <div className="relative">
                              <img src={content.eventPosterUrl} className="h-48 w-full rounded-xl object-cover shadow-2xl border-4 border-white" />
                              <button onClick={() => updateContentField('eventPosterUrl', '')} className="absolute -top-3 -right-3 p-2 bg-rose-600 text-white rounded-full shadow-xl hover:scale-110 transition-all"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center cursor-pointer group">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 group-hover:text-rose-500 shadow-xl border border-slate-100 transition-all mb-3"><ImagePlus className="w-8 h-8" /></div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Affiche / Poster</span>
                              <input type="file" className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if(file) { const r = new FileReader(); r.onload = ev => updateContentField('eventPosterUrl', ev.target?.result as string); r.readAsDataURL(file); } }} />
                            </label>
                          )}
                        </div>

                        <div className="space-y-4">
                          <input type="text" placeholder="Titre de l'événement (ex: Mariage de X & Y)" value={content.eventTitle || ''} onChange={e => updateContentField('eventTitle', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black" />
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Sous-titre" value={content.eventSubtitle || ''} onChange={e => updateContentField('eventSubtitle', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="text" placeholder="Type (Cérémonie, Gala, Concert...)" value={content.eventType || ''} onChange={e => updateContentField('eventType', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Thème" value={content.eventTheme || ''} onChange={e => updateContentField('eventTheme', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="text" placeholder="Slogan / Devise" value={content.eventSlogan || ''} onChange={e => updateContentField('eventSlogan', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <textarea placeholder="Description complète de l'événement..." value={content.eventDescription || ''} onChange={e => updateContentField('eventDescription', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={3} />

                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Hôte / Organisateur" value={content.eventHost || ''} onChange={e => updateContentField('eventHost', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="text" placeholder="Co-Hôte" value={content.eventCoHost || ''} onChange={e => updateContentField('eventCoHost', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Parrain (Sponsor)" value={content.eventSponsor || ''} onChange={e => updateContentField('eventSponsor', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="text" placeholder="Marraine" value={content.eventGodmother || ''} onChange={e => updateContentField('eventGodmother', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="grid grid-cols-1">
                            <input type="text" placeholder="Invité d'Honneur" value={content.eventGuestOfHonor || ''} onChange={e => updateContentField('eventGuestOfHonor', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Invités Spéciaux (virgules)" value={content.eventSpecialGuests?.join(', ') || ''} onChange={e => updateContentField('eventSpecialGuests', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="text" placeholder="Artistes / Performers (virgules)" value={content.eventPerformers?.join(', ') || ''} onChange={e => updateContentField('eventPerformers', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>
                      </div>

                      {/* DATE & TIME */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4 text-amber-600"/> 2. Date & Horaires</h4>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Date de début</label><input type="date" value={content.eventStartDate || ''} onChange={e => updateContentField('eventStartDate', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Heure de début</label><input type="time" value={content.eventStartTime || ''} onChange={e => updateContentField('eventStartTime', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Ouverture des portes</label><input type="time" value={content.eventDoorsOpenTime || ''} onChange={e => updateContentField('eventDoorsOpenTime', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Date de fin</label><input type="date" value={content.eventEndDate || ''} onChange={e => updateContentField('eventEndDate', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Heure de fin</label><input type="time" value={content.eventEndTime || ''} onChange={e => updateContentField('eventEndTime', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Fuseau Horaire</label><input type="text" placeholder="GMT, UTC+1..." value={content.eventTimezone || ''} onChange={e => updateContentField('eventTimezone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                          </div>
                        </div>
                      </div>

                      {/* LOCATION */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-600"/> 3. Lieu & Localisation</h4>
                        <div className="space-y-4">
                          <input type="text" placeholder="Nom du Lieu (Hôtel Ivoire, Salle A...)" value={content.eventLocationName || ''} onChange={e => updateContentField('eventLocationName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Adresse complète" value={content.eventAddress || ''} onChange={e => updateContentField('eventAddress', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Commune" value={content.eventCommune || ''} onChange={e => updateContentField('eventCommune', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="text" placeholder="Quartier" value={content.eventNeighborhood || ''} onChange={e => updateContentField('eventNeighborhood', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Ville" value={content.eventCity || ''} onChange={e => updateContentField('eventCity', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="text" placeholder="Pays" value={content.eventCountry || ''} onChange={e => updateContentField('eventCountry', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <input type="text" placeholder="Point de repère / Landmark" value={content.eventLandmark || ''} onChange={e => updateContentField('eventLandmark', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Latitude</label>
                              <input type="number" step="any" placeholder="5.3085" value={content.eventLatitude || ''} onChange={e => updateContentField('eventLatitude', parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Longitude</label>
                              <input type="number" step="any" placeholder="-4.0183" value={content.eventLongitude || ''} onChange={e => updateContentField('eventLongitude', parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            </div>
                          </div>
                          <textarea placeholder="Instructions d'accès particulières..." value={content.eventAccessInstructions || ''} onChange={e => updateContentField('eventAccessInstructions', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                        </div>
                      </div>

                      {/* PROGRAM */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><List className="w-4 h-4 text-indigo-600"/> 4. Programme</h4>
                        <div className="space-y-4">
                          <textarea placeholder="Déroulement de l'événement..." value={content.eventProgram || ''} onChange={e => updateContentField('eventProgram', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={4} />
                          <div className="grid grid-cols-1 gap-4">
                            <input type="text" placeholder="Activités (Séparez par des points)" value={content.eventActivities || ''} onChange={e => updateContentField('eventActivities', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="text" placeholder="Intervenants / Speakers" value={content.eventSpeakers || ''} onChange={e => updateContentField('eventSpeakers', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="text" placeholder="Sessions / Ateliers" value={content.eventSessions || ''} onChange={e => updateContentField('eventSessions', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="url" placeholder="Lien Programme PDF" value={content.eventProgramPdfUrl || ''} onChange={e => updateContentField('eventProgramPdfUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>
                      </div>

                      {/* INVITATION / GUEST */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><User className="w-4 h-4 text-emerald-600"/> 5. Invitation & Invité</h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="N° Invitation" value={content.eventInvitationNumber || ''} onChange={e => updateContentField('eventInvitationNumber', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="text" placeholder="Catégorie (VIP, Standard...)" value={content.eventGuestCategory || ''} onChange={e => updateContentField('eventGuestCategory', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <input type="text" placeholder="Table" value={content.eventTable || ''} onChange={e => updateContentField('eventTable', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="text" placeholder="Siège / Place" value={content.eventSeat || ''} onChange={e => updateContentField('eventSeat', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <input type="text" placeholder="Zone" value={content.eventZone || ''} onChange={e => updateContentField('eventZone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Nombre de Pax</label>
                              <input type="number" placeholder="1" value={content.eventGuestPax || ''} onChange={e => updateContentField('eventGuestPax', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Dress Code</label>
                              <input type="text" placeholder="Tenue de Soirée, Blanc..." value={content.eventDressCode || ''} onChange={e => updateContentField('eventDressCode', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Instructions Invité</label>
                            <input type="text" placeholder="Munissez-vous de votre invitation..." value={content.eventGuestInstructions || ''} onChange={e => updateContentField('eventGuestInstructions', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          </div>
                        </div>
                      </div>

                      {/* RESERVATION / RSVP */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600"/> 6. Réservation & RSVP</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                             <div>
                               <span className="text-[10px] font-black uppercase text-slate-900 block">Activer le RSVP</span>
                               <p className="text-[8px] font-bold text-slate-400 uppercase">Permet aux invités de confirmer leur présence</p>
                             </div>
                             <input type="checkbox" checked={content.eventRsvpEnabled || false} onChange={e => updateContentField('eventRsvpEnabled', e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Date Limite Confirmation</label>
                              <input type="date" value={content.eventRsvpDeadline || ''} onChange={e => updateContentField('eventRsvpDeadline', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-black uppercase" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Capacité Totale (Pax)</label>
                              <input type="number" placeholder="500" value={content.eventMaxCapacity || ''} onChange={e => updateContentField('eventMaxCapacity', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Prix du Ticket</label>
                              <input type="text" placeholder="Prix du ticket" value={content.eventTicketPrice || ''} onChange={e => updateContentField('eventTicketPrice', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-emerald-600" />
                            </div>
                            <div className="flex items-center gap-2 mt-5">
                               <input type="checkbox" checked={content.eventIsPaid || false} onChange={e => updateContentField('eventIsPaid', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                               <span className="text-[10px] font-black uppercase text-slate-700">Événement Payant</span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Lien de Billetterie</label>
                              <input type="url" placeholder="https://..." value={content.eventTicketUrl || content.eventBookingUrl || ''} onChange={e => updateContentField('eventTicketUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-blue-600" />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 pt-2">
                             <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase text-slate-400">Tél. RSVP</label>
                               <input type="tel" placeholder="+225..." value={content.eventPhone || content.primaryPhone || ''} onChange={e => updateContentField('eventPhone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                             </div>
                             <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase text-slate-400">WhatsApp RSVP</label>
                               <input type="tel" placeholder="+225..." value={content.eventWhatsApp || content.whatsappNumber || ''} onChange={e => updateContentField('eventWhatsApp', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold border-emerald-200" />
                             </div>
                             <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase text-slate-400">Email RSVP</label>
                               <input type="email" placeholder="rsvp@..." value={content.eventEmail || content.email || ''} onChange={e => updateContentField('eventEmail', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold" />
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- 4. SHOP --- */}
                  {type === 'SHOP' && (
                    <div className="space-y-10">
                      {/* 1. IDENTITÉ */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Store className="w-4 h-4 text-emerald-600"/> 1. Identité du Commerce</h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative group">
                            {content.logoUrl ? (
                              <div className="relative"><img src={content.logoUrl} className="w-16 h-16 rounded-xl object-contain shadow-md p-1 bg-white" /><button onClick={() => updateContentField('logoUrl', '')} className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3"/></button></div>
                            ) : (
                              <label className="flex flex-col items-center cursor-pointer"><Building2 className="w-5 h-5 text-slate-300 mb-1" /><span className="text-[8px] font-black uppercase text-slate-400">Logo</span><input type="file" className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if(file) { const r = new FileReader(); r.onload = ev => updateContentField('logoUrl', ev.target?.result as string); r.readAsDataURL(file); } }} /></label>
                            )}
                          </div>
                          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative group">
                            {content.shopCoverUrl ? (
                              <div className="relative"><img src={content.shopCoverUrl} className="w-24 h-16 rounded-xl object-cover shadow-md" /><button onClick={() => updateContentField('shopCoverUrl', '')} className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3"/></button></div>
                            ) : (
                              <label className="flex flex-col items-center cursor-pointer"><ImageIcon className="w-5 h-5 text-slate-300 mb-1" /><span className="text-[8px] font-black uppercase text-slate-400">Photo Couverture</span><input type="file" className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if(file) { const r = new FileReader(); r.onload = ev => updateContentField('shopCoverUrl', ev.target?.result as string); r.readAsDataURL(file); } }} /></label>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Nom du commerce (ex: Boutique XYZ)" value={content.shopName || content.company || ''} onChange={e => updateContentField('shopName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Nom commercial (ex: Superette)" value={content.shopCommercialName || content.commercialName || ''} onChange={e => updateContentField('shopCommercialName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Slogan / Devise" value={content.slogan || ''} onChange={e => updateContentField('slogan', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Type (ex: Dépôt, Supermarché...)" value={content.shopType || ''} onChange={e => updateContentField('shopType', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <input type="text" placeholder="Secteur d'activité (ex: Alimentation)" value={content.shopIndustry || ''} onChange={e => updateContentField('shopIndustry', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        <textarea placeholder="Description du commerce..." value={content.shopDescription || content.bio || ''} onChange={e => updateContentField('shopDescription', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={3} />
                      </div>

                      {/* 2. CONTACT */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Phone className="w-4 h-4 text-blue-600"/> 2. Contact</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="tel" placeholder="Téléphone Principal" value={content.primaryPhone || ''} onChange={e => updateContentField('primaryPhone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="tel" placeholder="Téléphone Secondaire" value={content.secondaryPhone || ''} onChange={e => updateContentField('secondaryPhone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="tel" placeholder="WhatsApp" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold border-emerald-200" />
                          <input type="email" placeholder="E-mail" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <input type="url" placeholder="Site Web" value={content.websiteUrl || ''} onChange={e => updateContentField('websiteUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-blue-600" />
                      </div>

                      {/* 3. ADRESSE */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><MapPinned className="w-4 h-4 text-rose-600"/> 3. Adresse & Localisation</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Pays" value={content.country || ''} onChange={e => updateContentField('country', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Ville" value={content.city || ''} onChange={e => updateContentField('city', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Commune" value={content.commune || ''} onChange={e => updateContentField('commune', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Quartier" value={content.neighborhood || ''} onChange={e => updateContentField('neighborhood', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <input type="text" placeholder="Adresse complète" value={content.address || ''} onChange={e => updateContentField('address', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        <input type="text" placeholder="Point de repère" value={content.landmark || ''} onChange={e => updateContentField('landmark', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="number" step="any" placeholder="Latitude" value={content.latitude || ''} onChange={e => updateContentField('latitude', parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="number" step="any" placeholder="Longitude" value={content.longitude || ''} onChange={e => updateContentField('longitude', parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <input type="url" placeholder="Lien direct Google Maps / Itinéraire" value={content.locationLink || content.googleMapsUrl || ''} onChange={e => updateContentField('locationLink', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                      </div>

                      {/* 4. HORAIRES */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4 text-slate-600"/> 4. Horaires d'Ouverture</h4>
                        <OpeningHoursEditor days={content.openingHours || DEFAULT_DAYS} onChange={days => updateContentField('openingHours', days)} />
                      </div>

                      {/* 5. ACTIVITÉ COMMERCIALE */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-indigo-600"/> 5. Activité Commerciale</h4>
                        <textarea placeholder="Liste des produits principaux..." value={content.shopProducts || ''} onChange={e => updateContentField('shopProducts', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Catégories (virgules)" value={content.shopProductsCategories?.join(', ') || ''} onChange={e => updateContentField('shopProductsCategories', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Services (virgules)" value={content.shopServices?.join(', ') || content.servicesOffered?.join(', ') || ''} onChange={e => updateContentField('shopServices', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <input type="text" placeholder="Marques vendues (virgules)" value={content.shopBrands?.join(', ') || ''} onChange={e => updateContentField('shopBrands', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        <textarea placeholder="Promotions en cours..." value={content.shopPromotions || ''} onChange={e => updateContentField('shopPromotions', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                        <textarea placeholder="Nouveautés / Arrivages..." value={content.shopNewArrivals || ''} onChange={e => updateContentField('shopNewArrivals', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                      </div>

                      {/* 6. LIVRAISON */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><TruckIcon className="w-4 h-4 text-emerald-600"/> 6. Livraison & Commandes</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <input type="checkbox" checked={content.shopDeliveryAvailable || false} onChange={e => updateContentField('shopDeliveryAvailable', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-emerald-600" />
                            <span className="text-[10px] font-black uppercase text-slate-700">Livraison disponible</span>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <input type="checkbox" checked={content.shopInStorePickup || false} onChange={e => updateContentField('shopInStorePickup', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                            <span className="text-[10px] font-black uppercase text-slate-700">Retrait en magasin</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Zone de livraison" value={content.shopDeliveryZone || ''} onChange={e => updateContentField('shopDeliveryZone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Frais de livraison" value={content.shopDeliveryFees || ''} onChange={e => updateContentField('shopDeliveryFees', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <input type="text" placeholder="Minimum de commande" value={content.shopMinOrderAmount || ''} onChange={e => updateContentField('shopMinOrderAmount', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                      </div>

                      {/* 7. PAIEMENTS */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-600"/> 7. Modes de Paiement</h4>
                        <input type="text" placeholder="Espèces, Mobile Money, Visa, Virement..." value={content.shopPaymentMethods?.join(', ') || ''} onChange={e => updateContentField('shopPaymentMethods', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                      </div>

                      {/* 8. RÉSEAUX */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Share2 className="w-4 h-4 text-indigo-600"/> 8. Réseaux Sociaux</h4>
                          <button onClick={() => updateContentField('socialLinks', [...(content.socialLinks || []), { id: `link_${Date.now()}`, platform: 'website', url: '', label: '', displayOrder: (content.socialLinks?.length || 0) + 1 }])} className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-full shadow-lg">+ Ajouter</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(content.socialLinks || []).map((link, idx) => (
                            <div key={link.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                              <select value={link.platform} onChange={e => { const nl = [...content.socialLinks!]; nl[idx].platform = e.target.value as any; updateContentField('socialLinks', nl); }} className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-black uppercase">
                                <option value="facebook">Facebook</option>
                                <option value="instagram">Instagram</option>
                                <option value="tiktok">TikTok</option>
                                <option value="youtube">YouTube</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="website">Site Web</option>
                              </select>
                              <input type="url" placeholder="URL" value={link.url} onChange={e => { const nl = [...content.socialLinks!]; nl[idx].url = e.target.value; updateContentField('socialLinks', nl); }} className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px]" />
                              <button onClick={() => updateContentField('socialLinks', content.socialLinks!.filter(l => l.id !== link.id))} className="text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 9. DOCUMENTS */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><FileText className="w-4 h-4 text-slate-500"/> 9. Documents & Catalogues</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="url" placeholder="Lien Catalogue" value={content.shopCatalogUrl || content.catalogUrl || ''} onChange={e => updateContentField('shopCatalogUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="url" placeholder="Lien Liste de Prix" value={content.shopPriceListUrl || ''} onChange={e => updateContentField('shopPriceListUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="url" placeholder="Lien Menu (si resto)" value={content.shopMenuUrl || ''} onChange={e => updateContentField('shopMenuUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="url" placeholder="Lien Brochure PDF" value={content.shopBrochureUrl || content.brochurePdfUrl || ''} onChange={e => updateContentField('shopBrochureUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- 5. LOCATION --- */}
                  {type === 'LOCATION' && (
                    <div className="space-y-10">
                      {/* 1. IDENTIFICATION */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-600"/> 1. Identification</h4>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative group">
                              {content.photoUrl ? (
                                <div className="relative"><img src={content.photoUrl} className="w-full h-24 rounded-xl object-cover shadow-md" /><button onClick={() => updateContentField('photoUrl', '')} className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3"/></button></div>
                              ) : (
                                <label className="flex flex-col items-center cursor-pointer"><ImageIcon className="w-5 h-5 text-slate-300 mb-1" /><span className="text-[8px] font-black uppercase text-slate-400">Photo du Lieu</span><input type="file" className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if(file) { const r = new FileReader(); r.onload = ev => updateContentField('photoUrl', ev.target?.result as string); r.readAsDataURL(file); } }} /></label>
                              )}
                           </div>
                           <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative group">
                              {content.logoUrl ? (
                                <div className="relative"><img src={content.logoUrl} className="w-24 h-24 rounded-xl object-contain shadow-md p-1 bg-white" /><button onClick={() => updateContentField('logoUrl', '')} className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-lg"><Trash2 className="w-3 h-3"/></button></div>
                              ) : (
                                <label className="flex flex-col items-center cursor-pointer"><Building2 className="w-5 h-5 text-slate-300 mb-1" /><span className="text-[8px] font-black uppercase text-slate-400">Logo</span><input type="file" className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if(file) { const r = new FileReader(); r.onload = ev => updateContentField('logoUrl', ev.target?.result as string); r.readAsDataURL(file); } }} /></label>
                              )}
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Nom du lieu (ex: Siège Social)" value={content.locationPlaceName || ''} onChange={e => updateContentField('locationPlaceName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Type de lieu (Hôtel, Bureau...)" value={content.locationPlaceType || ''} onChange={e => updateContentField('locationPlaceType', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <textarea placeholder="Brève description du lieu..." value={content.locationDescription || ''} onChange={e => updateContentField('locationDescription', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                      </div>

                      {/* 2. ADRESSE */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><MapPinned className="w-4 h-4 text-rose-600"/> 2. Adresse Détailée</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Pays" value={content.country || ''} onChange={e => updateContentField('country', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Région" value={content.region || ''} onChange={e => updateContentField('region', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Ville" value={content.city || ''} onChange={e => updateContentField('city', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Commune" value={content.commune || ''} onChange={e => updateContentField('commune', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Quartier" value={content.neighborhood || ''} onChange={e => updateContentField('neighborhood', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Rue" value={content.locationStreet || ''} onChange={e => updateContentField('locationStreet', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <textarea placeholder="Adresse complète / Instructions" value={content.address || ''} onChange={e => updateContentField('address', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Code Postal" value={content.postalCode || ''} onChange={e => updateContentField('postalCode', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Point de repère (Landmark)" value={content.landmark || ''} onChange={e => updateContentField('landmark', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                      </div>

                      {/* 3. GPS */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><LocateFixed className="w-4 h-4 text-blue-600"/> 3. Coordonnées GPS</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-slate-400">Latitude</label>
                            <input type="number" step="any" value={content.latitude || ''} onChange={e => updateContentField('latitude', parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" placeholder="5.3085" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-slate-400">Longitude</label>
                            <input type="number" step="any" value={content.longitude || ''} onChange={e => updateContentField('longitude', parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" placeholder="-4.0183" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-slate-400">Altitude</label>
                            <input type="number" step="any" value={content.altitude || ''} onChange={e => updateContentField('altitude', parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" placeholder="0" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <input type="url" placeholder="Lien Google Maps" value={content.googleMapsUrl || content.locationLink || ''} onChange={e => updateContentField('googleMapsUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-blue-600" />
                          <input type="url" placeholder="Lien Apple Maps" value={content.appleMapsUrl || ''} onChange={e => updateContentField('appleMapsUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-indigo-600" />
                        </div>
                      </div>

                      {/* 4. ACCÈS */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Navigation className="w-4 h-4 text-emerald-600"/> 4. Accès & Commodités</h4>
                        <textarea placeholder="Description de l'itinéraire..." value={content.locationItineraryDescription || ''} onChange={e => updateContentField('locationItineraryDescription', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Entrée principale" value={content.locationMainEntrance || ''} onChange={e => updateContentField('locationMainEntrance', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Point de rencontre" value={content.locationMeetingPoint || ''} onChange={e => updateContentField('locationMeetingPoint', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Infos Parking" value={content.locationParkingInfo || ''} onChange={e => updateContentField('locationParkingInfo', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Transports disponibles" value={content.locationTransportInfo || ''} onChange={e => updateContentField('locationTransportInfo', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <input type="text" placeholder="Accessibilité (PMR, etc.)" value={content.locationAccessibilityInfo || ''} onChange={e => updateContentField('locationAccessibilityInfo', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                      </div>

                      {/* 5. CONTACT */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Phone className="w-4 h-4 text-indigo-600"/> 5. Contact du Responsable</h4>
                        <input type="text" placeholder="Nom du responsable / gérant" value={content.locationManagerName || ''} onChange={e => updateContentField('locationManagerName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="tel" placeholder="Téléphone" value={content.primaryPhone || ''} onChange={e => updateContentField('primaryPhone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="tel" placeholder="WhatsApp" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold border-emerald-200" />
                        </div>
                        <input type="email" placeholder="E-mail de contact" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                      </div>

                      {/* 6. HORAIRES */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4 text-slate-600"/> 6. Horaires d'Ouverture</h4>
                        <OpeningHoursEditor days={content.openingHours || DEFAULT_DAYS} onChange={days => updateContentField('openingHours', days)} />
                      </div>
                    </div>
                  )}

                  {/* --- 6. COMPANY --- */}
                  {type === 'COMPANY' && (
                    <div className="space-y-10">
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Building2 className="w-4 h-4 text-blue-700"/> Informations Administratives</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Raison Sociale" value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="text" placeholder="Forme Juridique (SARL, SA, SAS...)" value={content.companyLegalForm || ''} onChange={e => updateContentField('companyLegalForm', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Activité Principale (Code APE/NAF)" value={content.companyMainActivity || ''} onChange={e => updateContentField('companyMainActivity', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="date" value={content.companyCreationDate || ''} onChange={e => updateContentField('companyCreationDate', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">RCCM</label><input type="text" placeholder="CI-ABJ-..." value={content.companyRccm || ''} onChange={e => updateContentField('companyRccm', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                          <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">ID Fiscal (IFU)</label><input type="text" placeholder="0000000X" value={content.companyTaxId || ''} onChange={e => updateContentField('companyTaxId', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                          <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Capital Social</label><input type="text" placeholder="1 000 000 FCFA" value={content.companyCapital || ''} onChange={e => updateContentField('companyCapital', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-600"/> Présentation & Vision</h4>
                        <textarea placeholder="Mission de l'entreprise (Pourquoi existons-nous ?)" value={content.companyMission || ''} onChange={e => updateContentField('companyMission', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                        <textarea placeholder="Vision & Ambition à long terme" value={content.companyVision || ''} onChange={e => updateContentField('companyVision', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                        <textarea placeholder="Valeurs fondamentales (Intégrité, Innovation...)" value={content.companyValues || ''} onChange={e => updateContentField('companyValues', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-6">
                          <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4 text-slate-600"/> Dirigeant & Contact</h4>
                          <input type="text" placeholder="Nom du Gérant / DG" value={content.companyManagerName || ''} onChange={updateContentField.bind(null, 'companyManagerName' as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="tel" placeholder="Tél. Direct Direction" value={content.companyManagerPhone || ''} onChange={e => updateContentField('companyManagerPhone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="email" placeholder="Email Institutionnel" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                        <div className="space-y-6">
                          <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><FileCode className="w-4 h-4 text-indigo-500"/> Documents & Médias</h4>
                          <input type="url" placeholder="Lien vers Plaquette PDF" value={content.companyPresentationPdfUrl || ''} onChange={e => updateContentField('companyPresentationPdfUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="url" placeholder="Lien vers Catalogue produits" value={content.companyCatalogueUrl || ''} onChange={e => updateContentField('companyCatalogueUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                          <input type="url" placeholder="Lien vers Portfolio" value={content.companyPortfolioUrl || ''} onChange={e => updateContentField('companyPortfolioUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- 7. SOCIAL --- */}
                  {type === 'SOCIAL' && (
                    <div className="space-y-8">
                       <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-100 rounded-full w-32 h-32 mx-auto bg-slate-50 relative group">
                          {content.photoAvatarUrl ? (
                            <img src={content.photoAvatarUrl} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center text-slate-300"><ImageIcon className="w-8 h-8" /><span className="text-[8px] font-black uppercase mt-1">Avatar</span></div>
                          )}
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if(file) {
                              const r = new FileReader();
                              r.onload = ev => updateContentField('photoAvatarUrl', ev.target?.result as string);
                              r.readAsDataURL(file);
                            }
                          }} />
                       </div>

                       <div className="space-y-4">
                          <input type="text" placeholder="Nom d'affichage (ex: @jean_pro)" value={content.socialDisplayName || ''} onChange={e => updateContentField('socialDisplayName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-center" />
                          <input type="text" placeholder="Profession / Titre" value={content.socialProfession || ''} onChange={e => updateContentField('socialProfession', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-center" />
                          <textarea placeholder="Petite biographie..." value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-center" rows={3} />
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center justify-between"><h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Link className="w-4 h-4 text-indigo-600"/> Mes Liens Linktree</h4><button onClick={() => updateContentField('socialLinks', [...(content.socialLinks || []), { id: `link_${Date.now()}`, platform: 'website', url: '', label: '', displayOrder: (content.socialLinks?.length || 0) + 1 }])} className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-full shadow-lg">+ Ajouter</button></div>
                          <div className="space-y-3">
                            {(content.socialLinks || []).map((link, idx) => (
                              <div key={link.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                                <div className="flex-1 space-y-2">
                                  <input type="text" placeholder="Label (ex: Mon Portfolio)" value={link.label || ''} onChange={e => {
                                    const newList = [...content.socialLinks!];
                                    newList[idx].label = e.target.value;
                                    updateContentField('socialLinks', newList);
                                  }} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold" />
                                  <input type="url" placeholder="Lien (https://...)" value={link.url} onChange={e => {
                                    const newList = [...content.socialLinks!];
                                    newList[idx].url = e.target.value;
                                    updateContentField('socialLinks', newList);
                                  }} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] text-blue-600" />
                                </div>
                                <button onClick={() => updateContentField('socialLinks', content.socialLinks!.filter(l => l.id !== link.id))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ))}
                          </div>
                       </div>
                    </div>
                  )}

                  {/* --- 8. PRODUCT / MENU / SERVICE --- */}
                  {type === 'PRODUCT' && (
                    <div className="space-y-8">
                       <div className="bg-slate-900 p-1.5 rounded-2xl flex gap-1 shadow-lg">
                          {(['PRODUCT', 'MENU', 'SERVICE'] as const).map(st => (
                            <button key={st} onClick={() => updateContentField('productSheetType', st)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${content.productSheetType === st ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>{st}</button>
                          ))}
                       </div>

                       {content.productSheetType === 'PRODUCT' && (
                         <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Marque</label><input type="text" placeholder="ex: Apple, AGB..." value={content.productBrand || ''} onChange={e => updateContentField('productBrand', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                              <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Nom du produit</label><input type="text" placeholder="iPhone 16 Pro" value={content.productName || ''} onChange={e => updateContentField('productName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Référence / SKU</label><input type="text" placeholder="SKU-001" value={content.productSku || ''} onChange={e => updateContentField('productSku', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                              <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Modèle</label><input type="text" placeholder="Modèle 2026" value={content.productModel || ''} onChange={e => updateContentField('productModel', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 mt-5">
                                <input type="checkbox" checked={content.productIsAvailable || true} onChange={e => updateContentField('productIsAvailable', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                <span className="text-[10px] font-black uppercase text-slate-700">En Stock</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Prix Normal</label><input type="text" placeholder="Prix" value={content.productPriceNormal || ''} onChange={e => updateContentField('productPriceNormal', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-900" /></div>
                              <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Prix Promo</label><input type="text" placeholder="Promo" value={content.productPricePromo || ''} onChange={e => updateContentField('productPricePromo', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-emerald-600" /></div>
                              <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400">Devise</label><input type="text" placeholder="FCFA" value={content.productCurrency || 'FCFA'} onChange={e => updateContentField('productCurrency', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <textarea placeholder="Description courte (1 phrase)" value={content.productDescriptionShort || ''} onChange={e => updateContentField('productDescriptionShort', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                               <textarea placeholder="Caractéristiques techniques (liste)" value={content.productCharacteristics || ''} onChange={e => updateContentField('productCharacteristics', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={2} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <input type="url" placeholder="Lien d'achat direct" value={content.productBuyUrl || ''} onChange={e => updateContentField('productBuyUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-bold text-blue-600" />
                              <input type="tel" placeholder="Tél. Commande" value={content.productOrderPhone || ''} onChange={e => updateContentField('productOrderPhone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-bold" />
                              <input type="url" placeholder="Lien Vidéo Démo" value={content.productVideoUrl || ''} onChange={e => updateContentField('productVideoUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[9px] font-bold" />
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                               {content.productMainImageUrl ? (
                                 <div className="relative group"><img src={content.productMainImageUrl} className="h-40 rounded-2xl object-cover" /><button onClick={() => updateContentField('productMainImageUrl', '')} className="absolute inset-0 flex items-center justify-center bg-rose-500/80 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-6 h-6" /></button></div>
                               ) : (
                                 <div className="flex flex-col items-center cursor-pointer relative"><ImageIcon className="w-8 h-8 text-slate-300" /><span className="text-[10px] font-black uppercase text-slate-400 mt-2">Image Principale</span><input type="file" className="absolute inset-0 opacity-0" accept="image/*" onChange={e => {
                                   const file = e.target.files?.[0];
                                   if(file) {
                                     const r = new FileReader();
                                     r.onload = ev => updateContentField('productMainImageUrl', ev.target?.result as string);
                                     r.readAsDataURL(file);
                                   }
                                 }} /></div>
                               )}
                            </div>
                         </div>
                       )}

                       {content.productSheetType === 'MENU' && (
                         <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4"><h5 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><List className="w-4 h-4 text-emerald-500" /> Articles de la Carte</h5><button onClick={() => updateContentField('menuItems', [...(content.menuItems || []), { id: `item_${Date.now()}`, category: 'Plats', name: '', description: '', price: '', isAvailable: true }])} className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-full shadow-lg">+ Ajouter Article</button></div>
                            <div className="space-y-4">
                              {(content.menuItems || []).map((item, idx) => (
                                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                  <div className="flex gap-2">
                                    <select value={item.category} onChange={e => { const m = [...content.menuItems!]; m[idx].category = e.target.value; updateContentField('menuItems', m); }} className="bg-white border-slate-200 rounded-lg px-2 py-1 text-[10px] font-black uppercase">
                                      {['Entrées', 'Plats', 'Desserts', 'Boissons', 'Accompagnements', 'Extras'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <input type="text" placeholder="Nom du plat" value={item.name} onChange={e => { const m = [...content.menuItems!]; m[idx].name = e.target.value; updateContentField('menuItems', m); }} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold" />
                                    <input type="text" placeholder="Prix" value={item.price} onChange={e => { const m = [...content.menuItems!]; m[idx].price = e.target.value; updateContentField('menuItems', m); }} className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-emerald-600 text-center" />
                                    <button onClick={() => updateContentField('menuItems', content.menuItems!.filter(i => i.id !== item.id))} className="text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                  <input type="text" placeholder="Ingrédients / Description courte" value={item.description || ''} onChange={e => { const m = [...content.menuItems!]; m[idx].description = e.target.value; updateContentField('menuItems', m); }} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 text-[10px]" />
                                </div>
                              ))}
                            </div>
                         </div>
                       )}

                       {content.productSheetType === 'SERVICE' && (
                         <div className="space-y-6">
                            <input type="text" placeholder="Nom de la prestation" value={content.serviceName || ''} onChange={e => updateContentField('serviceName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            <div className="grid grid-cols-2 gap-4">
                              <input type="text" placeholder="Tarif indicatif" value={content.servicePrice || ''} onChange={e => updateContentField('servicePrice', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-blue-600" />
                              <input type="text" placeholder="Durée estimée" value={content.serviceDuration || ''} onChange={e => updateContentField('serviceDuration', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                            </div>
                            <textarea placeholder="Description du service..." value={content.serviceDescription || ''} onChange={e => updateContentField('serviceDescription', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={4} />
                         </div>
                       )}
                    </div>
                  )}

                  {/* --- 9. WEB_LINK --- */}
                  {type === 'WEB_LINK' && (
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Globe className="w-4 h-4 text-blue-600"/> Destination</h4>
                          <input type="url" placeholder="Lien complet (https://...)" value={content.linkDestinationUrl || ''} onChange={e => updateContentField('linkDestinationUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold text-blue-600" />
                       </div>

                       <div className="bg-slate-900 p-5 rounded-3xl space-y-4 shadow-xl">
                          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Mode de Redirection</label>
                          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-2xl">
                            <button onClick={() => updateContentField('redirectMode', 'DIRECT')} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${content.redirectMode === 'DIRECT' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500'}`}>Direct (Immédiat)</button>
                            <button onClick={() => updateContentField('redirectMode', 'LANDING_PAGE')} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${content.redirectMode === 'LANDING_PAGE' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500'}`}>Landing Page (Profil)</button>
                          </div>
                          <p className="text-[9px] text-slate-500 italic text-center">
                            {content.redirectMode === 'DIRECT'
                              ? "Le scan redirige instantanément vers l'URL sans afficher de page intermédiaire."
                              : "Affiche une page de présentation stylisée avec un bouton vers votre lien."}
                          </p>
                       </div>

                       {content.redirectMode === 'LANDING_PAGE' && (
                         <div className="space-y-4 animate-in slide-in-from-top-4">
                           <input type="text" placeholder="Titre affiché sur la page" value={content.linkTitle || ''} onChange={e => updateContentField('linkTitle', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" />
                           <textarea placeholder="Description facultative" value={content.linkDescription || ''} onChange={e => updateContentField('linkDescription', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" rows={3} />
                         </div>
                       )}
                    </div>
                  )}

                  {/* --- 10. CUSTOM --- */}
                  {type === 'CUSTOM' && (
                    <div className="space-y-8">
                       <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                         <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500"/> Fiche sur Mesure</h4>
                         <button onClick={() => {
                           const newSection = {
                             id: `sec_${Date.now()}`,
                             title: 'Nouvelle Section',
                             order: (content.customSections?.length || 0) + 1,
                             fields: [],
                             isVisible: true
                           };
                           updateContentField('customSections', [...(content.customSections || []), newSection]);
                         }} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl shadow-lg">+ Nouvelle Section</button>
                       </div>

                       <div className="space-y-6">
                         {(content.customSections || []).sort((a,b) => a.order - b.order).map((section, sIdx) => (
                           <div key={section.id} className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] space-y-4 relative group">
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-4 h-4 text-slate-300 cursor-move" />
                                <input type="text" value={section.title} onChange={e => {
                                  const newSections = [...content.customSections!];
                                  newSections[sIdx].title = e.target.value;
                                  updateContentField('customSections', newSections);
                                }} className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest text-slate-900 flex-1" />
                                <button onClick={() => updateContentField('customSections', content.customSections!.filter(s => s.id !== section.id))} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                              </div>

                              <div className="space-y-3">
                                {section.fields.sort((a,b) => a.order - b.order).map((field, fIdx) => (
                                  <div key={field.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                      {field.type.includes('text') && <FileText className="w-4 h-4" />}
                                      {field.type === 'image' && <ImageIcon className="w-4 h-4" />}
                                      {field.type === 'url' && <Link className="w-4 h-4" />}
                                      {field.type === 'phone' && <Phone className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                      <input type="text" placeholder="Label (Nom du champ)" value={field.label} onChange={e => {
                                        const newSections = [...content.customSections!];
                                        newSections[sIdx].fields[fIdx].label = e.target.value;
                                        updateContentField('customSections', newSections);
                                      }} className="bg-slate-50 rounded-lg px-2 py-1 text-[10px] font-bold" />
                                      <select value={field.type} onChange={e => {
                                        const newSections = [...content.customSections!];
                                        newSections[sIdx].fields[fIdx].type = e.target.value as any;
                                        updateContentField('customSections', newSections);
                                      }} className="bg-slate-50 rounded-lg px-2 py-1 text-[9px] font-black uppercase">
                                        <option value="text_short">Texte Court</option>
                                        <option value="text_long">Texte Long</option>
                                        <option value="number">Nombre</option>
                                        <option value="url">Lien / URL</option>
                                        <option value="phone">Téléphone</option>
                                        <option value="email">E-mail</option>
                                        <option value="image">Image</option>
                                        <option value="pdf">Document PDF</option>
                                        <option value="button">Bouton Action</option>
                                        <option value="separator">Séparateur</option>
                                      </select>
                                    </div>
                                    <button onClick={() => {
                                      const newSections = [...content.customSections!];
                                      newSections[sIdx].fields = newSections[sIdx].fields.filter(f => f.id !== field.id);
                                      updateContentField('customSections', newSections);
                                    }} className="text-rose-400"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                ))}
                                <button onClick={() => {
                                  const newField = {
                                    id: `f_${Date.now()}`,
                                    type: 'text_short' as any,
                                    label: 'Nouveau champ',
                                    value: '',
                                    isRequired: false,
                                    isVisible: true,
                                    isPublic: true,
                                    order: (section.fields?.length || 0) + 1
                                  };
                                  const newSections = [...content.customSections!];
                                  newSections[sIdx].fields.push(newField);
                                  updateContentField('customSections', newSections);
                                }} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-all">+ Ajouter un champ</button>
                              </div>
                           </div>
                         ))}
                         {(content.customSections?.length || 0) === 0 && (
                           <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[40px]">
                             <Sparkles className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Commencez par créer une section personnalisée.</p>
                           </div>
                         )}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeStep === 'logo' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                 <div className="space-y-2"><h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Logo du QR Code</h4><p className="text-xs text-slate-500">Importez le logo de votre entreprise pour l'intégrer au centre du QR Code.</p></div>
                 <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-[40px] bg-slate-50">
                    {styling.logoUrl ? (
                      <div className="relative group"><img src={styling.logoUrl} className="h-32 w-32 object-contain bg-white p-4 rounded-3xl shadow-2xl border border-slate-100" /><button onClick={() => { updateStylingField('logoUrl', ''); updateContentField('logoUrl', ''); }} className="absolute -top-3 -right-3 p-2 bg-rose-600 text-white rounded-full shadow-xl hover:scale-110 transition-all"><Trash2 className="w-4 h-4"/></button></div>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer group"><div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-slate-200 group-hover:text-blue-500 shadow-xl border border-slate-100 transition-all mb-4"><Upload className="w-8 h-8" /></div><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Choisir mon logo</span><input type="file" className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if(file) { const r = new FileReader(); r.onload = ev => { updateStylingField('logoUrl', ev.target?.result as string); updateContentField('logoUrl', ev.target?.result as string); updateStylingField('errorCorrectionLevel', 'H'); }; r.readAsDataURL(file); } }} /></label>
                    )}
                 </div>
              </div>
            )}

            {activeStep === 'style' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3"><label className="block text-[10px] font-black uppercase text-slate-400">Couleur Modules</label><div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200"><input type="color" value={styling.fgColor} onChange={e => updateStylingField('fgColor', e.target.value)} className="w-10 h-10 rounded-lg border-none" /><span className="text-xs font-mono font-bold uppercase">{styling.fgColor}</span></div></div>
                   <div className="space-y-3"><label className="block text-[10px] font-black uppercase text-slate-400">Couleur Yeux</label><div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200"><input type="color" value={styling.eyeColor} onChange={e => updateStylingField('eyeColor', e.target.value)} className="w-10 h-10 rounded-lg border-none" /><span className="text-xs font-mono font-bold uppercase">{styling.eyeColor}</span></div></div>
                </div>
                <div className="space-y-4">
                   <label className="block text-[10px] font-black uppercase text-slate-400">Style des modules</label>
                   <div className="grid grid-cols-2 gap-3">
                     {['square', 'rounded', 'dots', 'classy'].map(s => <button key={s} onClick={() => updateStylingField('moduleStyle', s as any)} className={`py-3 rounded-2xl text-[10px] font-black uppercase border transition-all ${styling.moduleStyle === s ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>{s}</button>)}
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PREVIEW RIGHT */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-slate-950 rounded-[40px] p-8 border border-slate-800 shadow-2xl flex flex-col items-center text-center space-y-8 sticky top-6">
              <div className="space-y-1"><h4 className="text-white font-black text-sm uppercase tracking-[0.3em] opacity-50">QR Code Live</h4><div className="w-12 h-1 bg-blue-600 mx-auto rounded-full" /></div>
              <div className="relative group cursor-pointer" onClick={() => onOpenSimulator?.(getCurrentItem())}>
                <div className="absolute -inset-4 bg-blue-600/20 rounded-[48px] blur-2xl group-hover:bg-blue-600/40 transition-all duration-500" />
                <div className="relative p-6 bg-white rounded-[40px] shadow-2xl border-8 border-slate-900 group-hover:scale-[1.02] transition-transform duration-500">
                   <div className="w-56 h-56 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-100">
                     <span className="text-[10px] font-black uppercase text-slate-300 tracking-tighter">Génération QR...</span>
                   </div>
                   {styling.logoUrl && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white p-2 rounded-xl shadow-xl border border-slate-100 flex items-center justify-center overflow-hidden"><img src={styling.logoUrl} className="max-w-full max-h-full object-contain" /></div>}
                </div>
              </div>
              <div className="w-full space-y-4">
                 <div className="p-5 bg-slate-900/50 rounded-3xl text-left border border-slate-800/50"><span className="text-[8px] font-black uppercase text-slate-500 tracking-widest block mb-1.5">Destination de scan</span><p className="text-xs font-bold text-white truncate uppercase tracking-tight">{title}</p><p className="text-[9px] text-slate-600 font-mono mt-1">ID: {publicId}</p></div>
                 <button onClick={() => onOpenSimulator?.(getCurrentItem())} className="w-full py-4.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-700 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 group"><Eye className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" /> Simuler le scan</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
