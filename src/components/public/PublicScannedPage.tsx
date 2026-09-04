import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  MessageSquare, 
  Download, 
  Share2, 
  Building2, 
  Briefcase, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldAlert, 
  Lock,
  Navigation,
  FileCheck2,
  Layers,
  Sparkles,
  Award,
  RefreshCw,
  BookOpen,
  Clock,
  User,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Send,
  Youtube,
  Package,
  Info,
  ShoppingCart,
  Calendar,
  MapPinned
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeItem, QRContent } from '../../types/qr';
import { downloadVCard } from '../../utils/vcard';
import { recordScanEvent, fetchQRCodeByPublicId, getClientById, getStoredClients, decodeCardPayload } from '../../utils/storage';
import { getCompanyDefaultLogo } from '../../utils/defaultLogos';

interface PublicScannedPageProps {
  publicId?: string;
  qrItem?: QRCodeItem;
  isSimulator?: boolean;
  onCloseSimulator?: () => void;
}

export const PublicScannedPage: React.FC<PublicScannedPageProps> = ({
  publicId,
  qrItem: propQrItem,
  isSimulator = false,
  onCloseSimulator
}) => {
  const [item, setItem] = useState<QRCodeItem | null>(propQrItem || null);
  const [loading, setLoading] = useState<boolean>(!propQrItem);
  const [error, setError] = useState<string | null>(null);
  const [savedContact, setSavedContact] = useState<boolean>(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  useEffect(() => {
    if (propQrItem) {
      setItem(propQrItem);
      setLoading(false);
      return;
    }

    if (typeof window !== 'undefined') {
      const fullUrl = window.location.href;
      const matchPayload = fullUrl.match(/[?&](?:d|data)=([a-zA-Z0-9%_-]+)/);
      if (matchPayload && matchPayload[1]) {
        const decoded = decodeCardPayload(matchPayload[1]);
        if (decoded) {
          setItem(decoded);
          setLoading(false);
          if (!isSimulator) recordScanEvent(decoded.publicId || publicId || 'direct_payload');
          return;
        }
      }
    }

    if (publicId) {
      setLoading(true);
      fetchQRCodeByPublicId(publicId).then(found => {
        if (found) {
          setItem(found);
          if (!isSimulator) recordScanEvent(publicId);
        } else {
          setError("Cette fiche est introuvable.");
        }
        setLoading(false);
      }).catch(() => {
        setError("Erreur de connexion.");
        setLoading(false);
      });
    }
  }, [publicId, propQrItem, isSimulator]);

  const handleDownloadContact = () => {
    if (!item) return;
    downloadVCard(item.content);
    setSavedContact(true);
    try { confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } }); } catch (e) {}
    setTimeout(() => setSavedContact(false), 4000);
  };

  const handleCopy = (text: string, type: 'phone' | 'email') => {
    navigator.clipboard?.writeText(text);
    if (type === 'phone') {
      setCopiedPhone(text);
      setTimeout(() => setCopiedPhone(null), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleAddToCalendar = () => {
    if (!item) return;
    const { invitationTitle, invitationDate, invitationTime, invitationLocationName, invitationAddress } = item.content;
    const calTitle = invitationTitle || item.title || 'Événement';
    const startDateStr = invitationDate ? invitationDate.replace(/-/g, '') : '';
    const startTimeStr = invitationTime ? invitationTime.replace(/:/g, '') : '0000';
    const icsContent = ['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',`SUMMARY:${calTitle}`,`DTSTART:${startDateStr}T${startTimeStr}00`,`LOCATION:${invitationLocationName || ''} ${invitationAddress || ''}`,'END:VEVENT','END:VCALENDAR'].join('\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.body.appendChild(document.createElement('a'));
    link.href = url;
    link.download = `${calTitle.replace(/\s+/g, '_')}.ics`;
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error || !item) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6 text-center"><div className="space-y-4"><ShieldAlert className="w-16 h-16 mx-auto text-amber-500"/><h2 className="text-xl font-bold">{error || "Fiche introuvable"}</h2><button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-800 rounded-xl border border-slate-700">Réessayer</button></div></div>;
  if (item.status === 'inactive' || item.status === 'archived') return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6 text-center"><div className="space-y-4"><Lock className="w-16 h-16 mx-auto text-amber-500"/><h2 className="text-xl font-bold">Fiche Temporairement Suspendue</h2></div></div>;

  const linkedClient = item.clientId ? getClientById(item.clientId) : null;
  const content: QRContent = linkedClient ? { ...item.content, ...linkedClient } : item.content;
  const { styling } = item;
  const fullName = content.fullName || `${content.firstName || ''} ${content.lastName || ''}`.trim() || 'Fiche Professionnelle';

  const registeredLogo = (content.logoUrl && !content.logoUrl.includes('unsplash.com')) ? content.logoUrl : (styling?.logoUrl && !styling.logoUrl.includes('unsplash.com')) ? styling.logoUrl : getCompanyDefaultLogo(content.company || content.commercialName || fullName);

  const getCompanyInitials = (comp?: string, name?: string) => {
    const src = (comp && comp.trim()) ? comp : name;
    if (!src) return 'QR';
    const words = src.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return src.slice(0, 2).toUpperCase();
  };

  // -------------------------------------------------------------------------
  // TYPE 1: LIVRE / BOOK
  // -------------------------------------------------------------------------
  if (item.type === 'book') {
    const bookTitle = content.bookTitle || item.title || 'Livre';
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased">
        <div className="w-full max-w-md mx-auto px-4 pt-6 pb-2 flex-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto w-40 h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-slate-800">
              {content.bookCoverUrl ? <img src={content.bookCoverUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-indigo-400"><BookOpen className="w-10 h-10 mb-2" /><p className="text-[10px] font-bold uppercase">Couverture</p></div>}
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-black text-white">{bookTitle}</h1>
              <p className="text-sm font-semibold text-slate-300 pt-1">Par <span className="text-white font-bold">{content.bookAuthor || fullName}</span></p>
              {content.bookCoAuthor && <p className="text-xs text-slate-400 italic">Co-auteur(s) : {content.bookCoAuthor}</p>}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {content.bookPrice && <div className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">Prix : {content.bookPrice} {content.bookCurrency || 'FCFA'}</div>}
              {content.bookAvailability && <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${content.bookAvailability === 'available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>{content.bookAvailability === 'available' ? 'Disponible' : 'Épuisé'}</div>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {content.primaryPhone && <a href={`tel:${content.primaryPhone}`} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-800 text-slate-200"><Phone className="w-4 h-4 text-emerald-400" /><span className="text-[10px]">Appeler</span></a>}
              {content.whatsappNumber && <a href={`https://wa.me/${content.whatsappNumber.replace(/[^\d]/g,'')}`} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-800 text-slate-200"><MessageSquare className="w-4 h-4 text-emerald-400" /><span className="text-[10px]">WhatsApp</span></a>}
              {content.bookBuyUrl && <a href={content.bookBuyUrl} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-indigo-600 text-white"><ShoppingCart className="w-4 h-4" /><span className="text-[10px]">Acheter</span></a>}
            </div>
          </div>
          {content.bookSummary && <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3"><h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Résumé</h2><p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{content.bookSummary}</p></div>}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // TYPE 2: INVITATION
  // -------------------------------------------------------------------------
  if (item.type === 'invitation') {
    const invTitle = content.invitationTitle || item.title || 'Invitation';
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased">
        <div className="w-full max-w-md mx-auto px-4 pt-6 pb-2 flex-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            {content.invitationImageUrl && <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-700 shadow-lg"><img src={content.invitationImageUrl} className="w-full h-full object-cover" /></div>}
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300">{content.invitationEventType || 'Événement'}</span>
              <h1 className="text-xl font-black text-white pt-2">{invTitle}</h1>
              {content.invitationHost && <p className="text-xs text-slate-300">Par <span className="font-bold text-white">{content.invitationHost}</span></p>}
            </div>
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 text-left">
              <div><span className="text-[10px] font-medium text-slate-400 block">DÉBUT</span><span className="text-xs font-bold text-white">{content.invitationDate}</span><span className="text-[10px] font-bold text-amber-400 block">{content.invitationTime}</span></div>
              {content.invitationEndDate && <div><span className="text-[10px] font-medium text-slate-400 block">FIN</span><span className="text-xs font-bold text-white">{content.invitationEndDate}</span><span className="text-[10px] font-bold text-slate-400 block">{content.invitationEndTime}</span></div>}
            </div>
            <div className="p-3 bg-slate-800/60 rounded-2xl text-left space-y-2">
              <span className="text-[10px] font-medium text-slate-400 block uppercase">Lieu & Adresse</span>
              <p className="text-xs font-bold text-white">{content.invitationLocationName}</p>
              {content.invitationAddress && <p className="text-[11px] text-slate-300">{content.invitationAddress}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { if(content.invitationWhatsapp) window.open(`https://wa.me/${content.invitationWhatsapp.replace(/[^\d]/g,'')}?text=Confirmation Presence`, '_blank')}} className="flex flex-col items-center gap-1.5 p-3 bg-emerald-600 rounded-2xl text-white font-bold text-[10px]"><Check className="w-5 h-5" /><span>Confirmer présence</span></button>
              <button onClick={handleAddToCalendar} className="flex flex-col items-center gap-1.5 p-3 bg-indigo-600 rounded-2xl text-white font-bold text-[10px]"><Calendar className="w-5 h-5" /><span>M'ajouter au calendrier</span></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // TYPE 3: PRODUIT / MENU / SERVICE
  // -------------------------------------------------------------------------
  if (item.type === 'product') {
    const sheetType = content.productSheetType || 'product';
    const mainTitle = content.productName || item.title || (sheetType === 'menu' ? 'Menu / Carte' : 'Produit');

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased selection:bg-emerald-600 selection:text-white">
        <div className="w-full max-w-md mx-auto px-4 pt-6 pb-2 flex-1 space-y-6">

          {/* Header Image & Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {content.productMainImageUrl && (
              <div className="w-full h-64 relative">
                <img src={content.productMainImageUrl} className="w-full h-full object-cover" />
                {content.productPricePromo && <div className="absolute top-4 right-4 px-3 py-1 bg-rose-600 text-white text-[10px] font-black uppercase rounded-full shadow-lg animate-pulse">Promo</div>}
              </div>
            )}
            <div className="p-6 text-center space-y-3">
              <h1 className="text-2xl font-black text-white uppercase">{mainTitle}</h1>
              {content.productCategory && <span className="inline-block px-3 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase rounded-full">{content.productCategory}</span>}

              {sheetType === 'product' && (content.productPriceNormal || content.productPricePromo) && (
                <div className="py-2">
                  <span className="text-3xl font-black text-emerald-400">{content.productPricePromo || content.productPriceNormal} {content.productCurrency || 'FCFA'}</span>
                  {content.productPricePromo && <p className="text-sm text-slate-500 line-through opacity-50">{content.productPriceNormal} {content.productCurrency}</p>}
                </div>
              )}
              {content.productDescription && <p className="text-xs text-slate-400 italic">« {content.productDescription} »</p>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            {(content.productOrderPhone || content.primaryPhone) && <a href={`tel:${content.productOrderPhone || content.primaryPhone}`} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200"><Phone className="w-5 h-5 text-emerald-400" /><span className="text-[8px] font-black uppercase">Appeler</span></a>}
            {(content.productOrderWhatsapp || content.whatsappNumber) && <a href={`https://wa.me/${(content.productOrderWhatsapp || content.whatsappNumber!).replace(/[^\d]/g,'')}`} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200"><MessageSquare className="w-5 h-5 text-emerald-400" /><span className="text-[8px] font-black uppercase">WhatsApp</span></a>}
            {(content.locationLatitude && content.locationLongitude) && <a href={`https://www.google.com/maps/search/?api=1&query=${content.locationLatitude},${content.locationLongitude}`} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200"><Navigation className="w-5 h-5 text-blue-400" /><span className="text-[8px] font-black uppercase">Itinéraire</span></a>}
            {sheetType === 'menu' ? (
              <button onClick={() => document.getElementById('menu-list')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-600 text-white"><BookOpen className="w-5 h-5" /><span className="text-[8px] font-black uppercase">Carte</span></button>
            ) : (content.productBuyUrl && <a href={content.productBuyUrl} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-600 text-white"><ShoppingCart className="w-5 h-5" /><span className="text-[8px] font-black uppercase">Acheter</span></a>)}
          </div>

          {/* Menu Items */}
          {sheetType === 'menu' && content.menuItems && content.menuItems.length > 0 && (
            <div id="menu-list" className="space-y-6 pt-4">
              {['Entrées', 'Plats', 'Desserts', 'Boissons', 'Menus', 'Promotions'].map(cat => {
                const items = content.menuItems?.filter(i => i.category === cat);
                if (!items || items.length === 0) return null;
                return (
                  <div key={cat} className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-widest text-emerald-500 border-l-4 border-emerald-500 pl-3">{cat}</h2>
                    <div className="space-y-3">
                      {items.map(i => (
                        <div key={i.id} className={`flex gap-4 p-3 bg-slate-900 rounded-3xl border border-slate-800 ${i.isAvailable ? '' : 'opacity-40'}`}>
                          {i.photoUrl && <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800"><img src={i.photoUrl} className="w-full h-full object-cover" /></div>}
                          <div className="flex-1 py-1"><div className="flex justify-between items-start gap-2"><h3 className="text-xs font-bold text-white uppercase">{i.name}</h3><span className="text-xs font-black text-emerald-400 whitespace-nowrap">{i.price}</span></div>{i.description && <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{i.description}</p>}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {content.otherInformation && <div className="p-5 bg-slate-900/30 border border-slate-800/50 rounded-3xl text-left"><h2 className="text-[10px] font-black uppercase text-slate-500 mb-2">Notes & Précisions</h2><p className="text-xs text-slate-400 whitespace-pre-line">{content.otherInformation}</p></div>}
        </div>
        <footer className="py-10 text-center opacity-40 text-[9px] uppercase tracking-widest">Fiche Numérique Officielle • AGB Studio</footer>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // TYPE 4: BIO & RÉSEAUX (LINKTREE STYLE)
  // -------------------------------------------------------------------------
  if (item.type === 'social') {
    const displayName = content.socialDisplayName || content.fullName || item.title || 'Mon Profil';
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased">
        <div className="w-full max-w-md mx-auto px-4 pt-8 pb-4 flex-1 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-600/30 shadow-2xl bg-slate-800">
              {content.photoUrl ? <img src={content.photoUrl} className="w-full h-full object-cover" /> : <User className="w-16 h-16 mt-8 text-slate-600" />}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white">{displayName}</h1>
              {content.socialNickname && <p className="text-indigo-400 font-bold text-sm">{content.socialNickname}</p>}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-1">{content.socialProfession || content.jobTitle}</p>
            </div>
            {content.bio && <p className="text-xs text-slate-300 leading-relaxed max-w-xs">{content.bio}</p>}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {content.socialFacebookUrl && <a href={content.socialFacebookUrl} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-blue-600"><Facebook className="w-6 h-6" /></a>}
            {content.socialInstagramUrl && <a href={content.socialInstagramUrl} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-rose-500"><Instagram className="w-6 h-6" /></a>}
            {content.socialTikTokUrl && <a href={content.socialTikTokUrl} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-white"><span className="text-lg font-black">Tik</span></a>}
            {content.socialYouTubeUrl && <a href={content.socialYouTubeUrl} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-red-600"><Youtube className="w-6 h-6" /></a>}
            {content.socialLinkedInUrl && <a href={content.socialLinkedInUrl} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-blue-700"><Linkedin className="w-6 h-6" /></a>}
          </div>

          <div className="space-y-3">
            {(content.socialLinks || []).map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-white text-slate-900 rounded-2xl font-black text-sm shadow-xl">
                <span>{link.label || 'Lien personnalisé'}</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
        <footer className="py-8 text-center opacity-40 text-[9px] uppercase tracking-widest">Page de Profil • AGB Studio</footer>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // TYPE 5: LOCALISATION & GPS
  // -------------------------------------------------------------------------
  if (item.type === 'location') {
    const locName = content.locationPlaceName || item.title || 'Localisation';
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased">
        <div className="w-full max-w-md mx-auto px-4 pt-10 pb-4 flex-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-6">
            {content.locationPhotoUrl ? <img src={content.locationPhotoUrl} className="w-full h-48 rounded-2xl object-cover border border-slate-700" /> : <div className="w-20 h-20 rounded-full bg-blue-500/10 mx-auto flex items-center justify-center"><MapPin className="w-10 h-10 text-blue-500" /></div>}
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white">{locName}</h1>
              {content.locationAddress && <p className="text-sm text-slate-300">{content.locationAddress}</p>}
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{[content.locationCity, content.locationCountry].filter(Boolean).join(', ')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href={`https://www.google.com/maps/search/?api=1&query=${content.locationLatitude},${content.locationLongitude}`} className="flex flex-col items-center gap-1.5 p-4 bg-blue-600 rounded-2xl text-white font-bold text-xs"><Globe className="w-5 h-5" /><span>Voir carte</span></a>
              <a href={`https://waze.com/ul?ll=${content.locationLatitude},${content.locationLongitude}&navigate=yes`} className="flex flex-col items-center gap-1.5 p-4 bg-cyan-600 rounded-2xl text-white font-bold text-xs"><Navigation className="w-5 h-5" /><span>Itinéraire</span></a>
              {content.locationPhone && <a href={`tel:${content.locationPhone}`} className="flex flex-col items-center gap-1.5 p-4 bg-slate-800 rounded-2xl text-slate-200 border border-slate-700 font-bold text-xs"><Phone className="w-5 h-5 text-emerald-400" /><span>Appeler</span></a>}
              {content.locationWhatsapp && <a href={`https://wa.me/${content.locationWhatsapp.replace(/[^\d]/g,'')}`} className="flex flex-col items-center gap-1.5 p-4 bg-slate-800 rounded-2xl text-slate-200 border border-slate-700 font-bold text-xs"><MessageSquare className="w-5 h-5 text-emerald-400" /><span>WhatsApp</span></a>}
            </div>
          </div>
        </div>
        <footer className="py-8 text-center opacity-40 text-[9px] uppercase tracking-widest">Localisation Certifiée • AGB Studio</footer>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // TYPE 6: ENTREPRISE & SOCIÉTÉ (STRICT vCard)
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased">
      <div className="w-full max-w-md mx-auto px-4 pt-10 pb-4 flex-1 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
          <div className="w-24 h-24 rounded-2xl bg-white p-2 mx-auto border border-slate-800 flex items-center justify-center overflow-hidden">
            {registeredLogo ? <img src={registeredLogo} className="w-full h-full object-contain" /> : <span className="text-slate-900 text-3xl font-black">{getCompanyInitials(content.company, fullName)}</span>}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white leading-tight uppercase">{fullName}</h1>
            {content.jobTitle && <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">{content.jobTitle}</p>}
            {content.company && <p className="text-xs text-slate-400">{content.company}</p>}
          </div>
          <button onClick={handleDownloadContact} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl shadow-xl transition-all active:scale-95">{savedContact ? 'Enregistré !' : 'ENREGISTRER LE CONTACT'}</button>
          <div className="grid grid-cols-4 gap-2">
            {content.primaryPhone && <a href={`tel:${content.primaryPhone}`} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700"><Phone className="w-5 h-5 text-emerald-400" /><span className="text-[8px] font-black uppercase">Appel</span></a>}
            {content.whatsappNumber && <a href={`https://wa.me/${content.whatsappNumber.replace(/[^\d]/g,'')}`} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700"><MessageSquare className="w-5 h-5 text-emerald-400" /><span className="text-[8px] font-black uppercase">WhatsApp</span></a>}
            {content.email && <a href={`mailto:${content.email}`} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700"><Mail className="w-5 h-5 text-blue-400" /><span className="text-[8px] font-black uppercase">E-mail</span></a>}
            {content.websiteUrl && <a href={content.websiteUrl} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700"><Globe className="w-5 h-5 text-indigo-400" /><span className="text-[8px] font-black uppercase">Site</span></a>}
          </div>
        </div>
        {/* Full Details Block */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          {content.primaryPhone && <div className="flex items-center gap-3 border-b border-slate-800 pb-3"><Phone className="w-4 h-4 text-emerald-400" /><div><span className="text-[9px] text-slate-500 uppercase block">Téléphone</span><p className="text-xs font-bold text-white">{content.primaryPhone}</p></div></div>}
          {content.email && <div className="flex items-center gap-3 border-b border-slate-800 pb-3"><Mail className="w-4 h-4 text-blue-400" /><div><span className="text-[9px] text-slate-500 uppercase block">E-mail</span><p className="text-xs font-bold text-white truncate">{content.email}</p></div></div>}
          {content.address && <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-amber-500" /><div><span className="text-[9px] text-slate-500 uppercase block">Adresse</span><p className="text-xs font-bold text-white leading-tight">{content.address}</p></div></div>}
        </div>
      </div>
      <footer className="py-8 text-center opacity-40 text-[9px] uppercase tracking-widest font-black">Fiche Certifiée Directe • AGB Studio</footer>
    </div>
  );
};
