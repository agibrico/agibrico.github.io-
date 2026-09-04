import React, { useState, useEffect } from 'react';
import {
  User, Building2, Share2, ShoppingBag, Image as ImageIcon, Calendar, MapPin, Globe, Sparkles, Plus, Trash2, Lock, Check, Palette, Upload, Clock, Shield, Sliders, Layers, ArrowRight, Eye, Save, X, FileCode, Info, BookOpen, Store, Navigation, CheckCircle2, Smartphone, Printer, CalendarDays, Hash, Languages, DollarSign, ShoppingCart, Facebook, Instagram, Truck, Wallet, Package, MapPinned, LocateFixed, Linkedin, Youtube, FileText, Briefcase, Twitter, Send, MessageSquare, Book
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
  const [type, setType] = useState<QRType>(initialItem?.type || 'vcard');
  const [mode, setMode] = useState<QRMode>(initialItem?.mode || 'dynamic');
  const [publicId] = useState<string>(initialItem?.publicId || generateSecurePublicId());
  const [activeStep, setActiveStep] = useState<'content' | 'logo' | 'style' | 'settings'>('content');

  const [content, setContent] = useState<QRContent>(initialItem?.content || {
    firstName: '', lastName: '', fullName: '', company: '', jobTitle: '', industry: '', bio: '',
    photoUrl: '', logoUrl: '', primaryPhone: '', whatsappNumber: '', email: '', websiteUrl: '',
    address: '', city: '', country: '', locationLatitude: undefined, locationLongitude: undefined,
    openingHours: DEFAULT_DAYS, servicesList: [], productsList: [], socialLinks: [], customFields: [],
    privacy: { hideAddress: false }, productSheetType: 'product', menuItems: []
  });

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
    { type: 'vcard', label: 'Contact Pro', desc: 'Carte de visite vCard', icon: User },
    { type: 'business', label: 'Société', desc: 'Profil institutionnel', icon: Building2 },
    { type: 'shop', label: 'Boutique', desc: 'Commerce & Horaires', icon: Store },
    { type: 'product', label: 'Produit/Menu', desc: 'Catalogue & Restaurant', icon: ShoppingBag },
    { type: 'location', label: 'Lieu/GPS', desc: 'Position & Itinéraire', icon: MapPin },
    { type: 'social', label: 'Bio/Profil', desc: 'Multi-liens Linktree', icon: Share2 },
    { type: 'book', label: 'Livre', desc: 'Fiche livre & ISBN', icon: BookOpen },
    { type: 'invitation', label: 'Invitation', desc: 'Événement & RSVP', icon: Calendar },
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {qrTypesList.map(item => (
                    <button key={item.type} onClick={() => setType(item.type as any)} className={`p-3.5 rounded-2xl border text-left transition-all group ${type === item.type ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/10' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <item.icon className={`w-5 h-5 mb-2 group-hover:scale-110 transition-transform ${type === item.type ? 'text-blue-600' : 'text-slate-400'}`} />
                      <p className="text-[10px] font-black uppercase tracking-tighter text-slate-900 leading-tight">{item.label}</p>
                    </button>
                  ))}
                </div>

                {/* FORMULAIRE PRODUIT & MENU */}
                {type === 'product' && (
                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="bg-slate-900 p-5 rounded-2xl space-y-4 shadow-xl">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Type de fiche Produit</label>
                      <div className="flex gap-2 p-1 bg-slate-800 rounded-xl">
                        {['product', 'menu', 'service'].map(st => (
                          <button key={st} onClick={() => updateContentField('productSheetType', st as any)} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${content.productSheetType === st ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>{st}</button>
                        ))}
                      </div>
                    </div>

                    {content.productSheetType === 'product' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Nom du Produit *</label><input type="text" value={content.productName || ''} onChange={e => updateContentField('productName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" placeholder="Ex: iPhone 16 Pro Max" /></div>
                          <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Catégorie</label><input type="text" value={content.productCategory || ''} onChange={e => updateContentField('productCategory', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs" placeholder="Électronique, Mode..." /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Prix Normal</label><input type="text" value={content.productPriceNormal || ''} onChange={e => updateContentField('productPriceNormal', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black" /></div>
                          <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Prix Promo</label><input type="text" value={content.productPricePromo || ''} onChange={e => updateContentField('productPricePromo', e.target.value)} className="w-full bg-slate-50 border border-rose-200 rounded-xl px-4 py-2.5 text-xs font-black text-rose-600" /></div>
                          <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Devise</label><input type="text" value={content.productCurrency || 'FCFA'} onChange={e => updateContentField('productCurrency', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black" /></div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                          {content.productMainImageUrl ? (
                            <div className="relative group"><img src={content.productMainImageUrl} className="h-40 rounded-2xl object-cover shadow-xl" /><button onClick={() => updateContentField('productMainImageUrl', '')} className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button></div>
                          ) : (
                            <label className="flex flex-col items-center cursor-pointer space-y-2"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm"><ImageIcon className="w-6 h-6" /></div><span className="text-[10px] font-black uppercase text-slate-400">Image Principale du Produit</span><input type="file" className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if(file) { const r = new FileReader(); r.onload = ev => updateContentField('productMainImageUrl', ev.target?.result as string); r.readAsDataURL(file); } }} /></label>
                          )}
                        </div>
                        <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Description Détaillée</label><textarea rows={4} value={content.productDescription || ''} onChange={e => updateContentField('productDescription', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs leading-relaxed" placeholder="Avantages, caractéristiques, origine..." /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">WhatsApp Commande</label><div className="relative"><MessageSquare className="absolute left-3 top-3 w-4 h-4 text-emerald-500" /><input type="tel" value={content.productOrderWhatsapp || ''} onChange={e => updateContentField('productOrderWhatsapp', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold" placeholder="+225..." /></div></div>
                          <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Lien d'achat (E-commerce)</label><div className="relative"><Globe className="absolute left-3 top-3 w-4 h-4 text-blue-500" /><input type="url" value={content.productBuyUrl || ''} onChange={e => updateContentField('productBuyUrl', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-blue-600" placeholder="https://..." /></div></div>
                        </div>
                      </div>
                    )}

                    {content.productSheetType === 'menu' && (
                      <div className="space-y-6 animate-in slide-in-from-left duration-300">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4"><h5 className="text-[11px] font-black uppercase text-slate-900 tracking-widest flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-500" /> Articles de votre Carte</h5><button onClick={() => updateContentField('menuItems', [...(content.menuItems || []), { id: `m_${Date.now()}`, category: 'Plats' as any, name: '', description: '', price: '', isAvailable: true }])} className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-full shadow-lg active:scale-95 transition-all">+ Ajouter Plat</button></div>
                        <div className="space-y-4">
                          {(content.menuItems || []).map((item, idx) => (
                            <div key={item.id} className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 shadow-xs">
                              <div className="flex gap-3">
                                <select value={item.category} onChange={e => { const m = [...content.menuItems!]; m[idx].category = e.target.value as any; updateContentField('menuItems', m); }} className="bg-white border-slate-200 rounded-xl px-3 py-1 text-[10px] font-black uppercase shadow-sm">
                                  {['Entrées', 'Plats', 'Desserts', 'Boissons', 'Menus', 'Promotions'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input type="text" value={item.name} onChange={e => { const m = [...content.menuItems!]; m[idx].name = e.target.value; updateContentField('menuItems', m); }} placeholder="Nom du plat" className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500" />
                                <button onClick={() => updateContentField('menuItems', content.menuItems!.filter(i => i.id !== item.id))} className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"><Trash2 className="w-4 h-4"/></button>
                              </div>
                              <div className="flex gap-4">
                                <div className="w-24"><label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Prix</label><input type="text" value={item.price} onChange={e => { const m = [...content.menuItems!]; m[idx].price = e.target.value; updateContentField('menuItems', m); }} placeholder="4 500" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-emerald-600" /></div>
                                <div className="flex-1"><label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Description</label><input type="text" value={item.description || ''} onChange={e => { const m = [...content.menuItems!]; m[idx].description = e.target.value; updateContentField('menuItems', m); }} placeholder="Accompagnement, ingrédients..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs" /></div>
                              </div>
                            </div>
                          ))}
                          {(!content.menuItems || content.menuItems.length === 0) && <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucun article ajouté à votre carte.</p></div>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AUTRES TYPES DE FORMULAIRES (VCARD, BIO, etc.) */}
                {(type === 'vcard' || type === 'business') && (
                   <div className="space-y-4 pt-6 border-t border-slate-100 animate-in slide-in-from-right duration-300">
                    <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center"><User className="w-4 h-4"/></div><h4 className="text-[11px] font-black uppercase tracking-widest">Identification Professionnelle</h4></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Prénom</label><input type="text" value={content.firstName || ''} onChange={e => updateContentField('firstName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Nom</label><input type="text" value={content.lastName || ''} onChange={e => updateContentField('lastName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                    </div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Raison Sociale / Entreprise</label><input type="text" value={content.company || ''} onChange={e => updateContentField('company', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-blue-600" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Téléphone Principal</label><input type="tel" value={content.primaryPhone || ''} onChange={e => updateContentField('primaryPhone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">WhatsApp</label><input type="tel" value={content.whatsappNumber || ''} onChange={e => updateContentField('whatsappNumber', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                    </div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Email Officiel</label><input type="email" value={content.email || ''} onChange={e => updateContentField('email', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold" /></div>
                  </div>
                )}

                {type === 'social' && (
                  <div className="space-y-6 pt-6 border-t border-slate-100 animate-in zoom-in-95 duration-300">
                     <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center"><Share2 className="w-4 h-4"/></div><h4 className="text-[11px] font-black uppercase tracking-widest">Profil Bio & Réseaux</h4></div>
                     <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-100 rounded-full w-32 h-32 mx-auto bg-slate-50">
                        {content.photoUrl ? (
                          <div className="relative w-full h-full group"><img src={content.photoUrl} className="w-full h-full rounded-full object-cover" /><button onClick={() => updateContentField('photoUrl', '')} className="absolute inset-0 flex items-center justify-center bg-rose-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button></div>
                        ) : (
                          <label className="flex flex-col items-center cursor-pointer"><User className="w-8 h-8 text-slate-300" /><input type="file" className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if(file) { const r = new FileReader(); r.onload = ev => updateContentField('photoUrl', ev.target?.result as string); r.readAsDataURL(file); } }} /></label>
                        )}
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Nom affiché *</label><input type="text" value={content.socialDisplayName || content.fullName || ''} onChange={e => updateContentField('socialDisplayName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black" /></div>
                        <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-500">Mini Bio</label><textarea rows={3} value={content.bio || ''} onChange={e => updateContentField('bio', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs" /></div>
                        <div className="flex items-center justify-between"><h5 className="text-[10px] font-black uppercase text-slate-400">Liens Linktree</h5><button onClick={() => updateContentField('socialLinks', [...(content.socialLinks || []), { id: `s_${Date.now()}`, platform: 'website', url: '', label: '', displayOrder: 1 }])} className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-lg">+ Ajouter Lien</button></div>
                        <div className="space-y-3">
                          {(content.socialLinks || []).map((link, idx) => (
                            <div key={link.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-3 shadow-xs">
                              <div className="flex-1 space-y-2">
                                <input type="text" value={link.label || ''} onChange={e => { const s = [...content.socialLinks]; s[idx].label = e.target.value; updateContentField('socialLinks', s); }} placeholder="Titre (ex: Mon Site, Portfolio...)" className="w-full bg-white border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold" />
                                <input type="url" value={link.url} onChange={e => { const s = [...content.socialLinks]; s[idx].url = e.target.value; updateContentField('socialLinks', s); }} placeholder="https://..." className="w-full bg-white border-slate-100 rounded-lg px-3 py-1.5 text-[10px] text-blue-600" />
                              </div>
                              <button onClick={() => updateContentField('socialLinks', content.socialLinks.filter(l => l.id !== link.id))} className="text-rose-400"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          ))}
                        </div>
                     </div>
                  </div>
                )}
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
