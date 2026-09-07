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
  MapPinned,
  UserPlus,
  Map,
  Link,
  ArrowRight,
  CheckCircle2
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
    if (item && item.type === 'WEB_LINK' && item.content.redirectMode === 'DIRECT' && item.content.linkDestinationUrl && !isSimulator) {
      window.location.href = item.content.linkDestinationUrl;
    }
  }, [item, isSimulator]);

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
  // RENDER HELPERS
  // -------------------------------------------------------------------------
  const SectionHeader = ({ title, icon: Icon, colorClass = "text-slate-400" }: { title: string, icon: any, colorClass?: string }) => (
    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-4 border-b border-slate-800/50 pb-2">
      <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
      <span className="text-slate-500">{title}</span>
    </h2>
  );

  const InfoRow = ({ label, value, icon: Icon, href }: { label: string, value?: string | number, icon?: any, href?: string }) => {
    if (!value) return null;
    const content = (
      <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800/50 rounded-2xl hover:bg-slate-800/50 transition-colors">
        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
        <div className="flex-1 min-w-0">
          <span className="text-[8px] font-black uppercase text-slate-500 block leading-none mb-1">{label}</span>
          <span className="text-xs font-bold text-white block truncate">{value}</span>
        </div>
        {href && <ExternalLink className="w-3 h-3 text-slate-600" />}
      </div>
    );
    return href ? <a href={href} target="_blank" rel="noopener noreferrer">{content}</a> : content;
  };

  // -------------------------------------------------------------------------
  // MAIN RENDERING
  // -------------------------------------------------------------------------
  const renderContent = () => {
    switch (item.type) {
      case 'BUSINESS_CARD':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
              <div className="w-32 h-32 rounded-3xl bg-white p-2 mx-auto border-4 border-slate-800 shadow-xl overflow-hidden">
                {registeredLogo ? <img src={registeredLogo} className="w-full h-full object-contain" /> : <span className="text-slate-950 text-4xl font-black">{getCompanyInitials(content.company, fullName)}</span>}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{fullName}</h1>
                <p className="text-xs font-black text-blue-500 uppercase tracking-[0.3em]">{content.jobTitle}</p>
                {content.company && <p className="text-sm font-bold text-slate-400">{content.company}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={handleDownloadContact} className="col-span-2 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95"><UserPlus className="w-4 h-4" /> {savedContact ? 'Contact Enregistré' : 'Ajouter aux contacts'}</button>
                {content.primaryPhone && <a href={`tel:${content.primaryPhone}`} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-2xl text-slate-200 hover:bg-slate-700 transition-colors"><Phone className="w-5 h-5 text-emerald-400" /><span className="text-[8px] font-black uppercase">Appel</span></a>}
                {content.whatsappNumber && <a href={`https://wa.me/${content.whatsappNumber.replace(/[^\d]/g,'')}`} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-2xl text-slate-200 hover:bg-slate-700 transition-colors"><MessageSquare className="w-5 h-5 text-emerald-400" /><span className="text-[8px] font-black uppercase">WhatsApp</span></a>}
              </div>
            </div>

            {(content.email || content.websiteUrl || content.address) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-3">
                <SectionHeader title="Informations de contact" icon={Info} />
                <InfoRow label="Email Professionnel" value={content.email} icon={Mail} href={`mailto:${content.email}`} />
                <InfoRow label="Site Web" value={content.websiteUrl} icon={Globe} href={content.websiteUrl} />
                <InfoRow label="Adresse" value={content.address} icon={MapPin} />
              </div>
            )}

            {content.availabilityHours && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6">
                <SectionHeader title="Disponibilité" icon={Clock} />
                <p className="text-xs font-bold text-slate-300 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/30 italic">« {content.availabilityHours} »</p>
              </div>
            )}
          </div>
        );

      case 'BOOK':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center space-y-6 shadow-2xl">
              <div className="mx-auto w-44 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-800">
                {content.photoUrl ? <img src={content.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-indigo-500"><BookOpen className="w-12 h-12 mb-3" /><span className="text-[10px] font-black uppercase tracking-widest">Pas de couverture</span></div>}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-white uppercase">{content.bookTitle || 'Sans Titre'}</h1>
                <p className="text-sm font-bold text-slate-400">Par <span className="text-indigo-400 uppercase">{content.bookAuthor || 'Auteur Inconnu'}</span></p>
                {content.bookPrice && <div className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-black mt-2">{content.bookPrice} {content.bookCurrency || 'FCFA'}</div>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {content.bookBuyUrl && <a href={content.bookBuyUrl} className="col-span-2 py-4 bg-indigo-600 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest"><ShoppingCart className="w-4 h-4" /> Acheter le livre</a>}
                {content.primaryPhone && <a href={`tel:${content.primaryPhone}`} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-2xl text-slate-200"><Phone className="w-5 h-5 text-emerald-400" /><span className="text-[8px] font-black uppercase">Contact</span></a>}
                {content.whatsappNumber && <a href={`https://wa.me/${content.whatsappNumber.replace(/[^\d]/g,'')}`} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-2xl text-slate-200"><MessageSquare className="w-5 h-5 text-emerald-400" /><span className="text-[8px] font-black uppercase">WhatsApp</span></a>}
              </div>
            </div>
            {content.bookSummary && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-3">
                <SectionHeader title="Résumé de l'œuvre" icon={FileText} />
                <p className="text-xs text-slate-300 leading-relaxed font-medium whitespace-pre-line">{content.bookSummary}</p>
              </div>
            )}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 grid grid-cols-2 gap-3">
              <InfoRow label="ISBN" value={content.bookIsbn13} />
              <InfoRow label="Éditeur" value={content.bookPublisher} />
              <InfoRow label="Année" value={content.bookYear} />
              <InfoRow label="Pages" value={content.bookPages} />
            </div>
          </div>
        );

      case 'EVENT':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-600" />
              <div className="space-y-2 pt-2">
                <span className="px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest rounded-full">Événement Spécial</span>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight pt-2">{content.eventTitle || 'Événement'}</h1>
                <p className="text-sm font-bold text-slate-400">{content.eventHost && `Organisé par ${content.eventHost}`}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 rounded-[32px] border border-slate-800 shadow-inner">
                <div className="text-left space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase block">Quand</span>
                  <p className="text-xs font-black text-white">{content.eventStartDate}</p>
                  <p className="text-[10px] font-bold text-rose-500">{content.eventStartTime}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase block">Où</span>
                  <p className="text-xs font-black text-white truncate">{content.eventLocationName}</p>
                  <p className="text-[9px] text-slate-400 font-bold truncate">{content.eventAddress}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleAddToCalendar} className="col-span-2 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95"><Calendar className="w-4 h-4" /> Ajouter au Calendrier</button>
                {content.eventBookingUrl && <a href={content.eventBookingUrl} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-2xl text-white font-bold text-[10px]"><ShoppingCart className="w-5 h-5" /><span>Réserver</span></a>}
                <button onClick={() => { if(content.whatsappNumber || content.primaryPhone) window.open(`https://wa.me/${(content.whatsappNumber || content.primaryPhone!).replace(/[^\d]/g,'')}?text=Confirmation Presence`, '_blank')}} className="flex flex-col items-center gap-2 p-4 bg-emerald-600 rounded-2xl text-white font-bold text-[10px]"><CheckCircle2 className="w-5 h-5" /><span>Confirmer RSVP</span></button>
              </div>
            </div>
            {content.eventDescription && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6">
                <SectionHeader title="À propos de l'événement" icon={Info} colorClass="text-rose-500" />
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{content.eventDescription}</p>
              </div>
            )}
          </div>
        );

      case 'SHOP':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
               <div className="w-24 h-24 rounded-3xl bg-white p-2 mx-auto shadow-xl flex items-center justify-center overflow-hidden">
                 {registeredLogo ? <img src={registeredLogo} className="w-full h-full object-contain" /> : <Store className="w-12 h-12 text-emerald-600" />}
               </div>
               <div className="space-y-2">
                 <h1 className="text-2xl font-black text-white uppercase">{content.commercialName || content.company || 'Boutique'}</h1>
                 {content.shopIndustry && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase rounded-full">{content.shopIndustry}</span>}
               </div>
               <div className="grid grid-cols-4 gap-3">
                 <a href={`tel:${content.primaryPhone}`} className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl text-slate-200"><Phone className="w-5 h-5 text-emerald-400" /><span className="text-[7px] font-black uppercase">Appel</span></a>
                 <a href={`https://wa.me/${(content.whatsappNumber || content.primaryPhone || '').replace(/[^\d]/g,'')}`} className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl text-slate-200"><MessageSquare className="w-5 h-5 text-emerald-400" /><span className="text-[7px] font-black uppercase">WhatsApp</span></a>
                 <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.address || '')}`} className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl text-slate-200"><Navigation className="w-5 h-5 text-blue-400" /><span className="text-[7px] font-black uppercase">Y aller</span></a>
                 <a href={content.websiteUrl} className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl text-slate-200"><Globe className="w-5 h-5 text-indigo-400" /><span className="text-[7px] font-black uppercase">Site</span></a>
               </div>
            </div>

            {content.openingHours && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6">
                <SectionHeader title="Horaires d'ouverture" icon={Clock} colorClass="text-emerald-500" />
                <div className="space-y-2">
                  {content.openingHours.map(d => (
                    <div key={d.day} className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500">{d.day}</span>
                      <span className={d.isOpen ? "text-white" : "text-rose-500"}>{d.isOpen ? `${d.openTime} - ${d.closeTime}` : 'Fermé'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'LOCATION':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-cyan-500/10 rounded-full mx-auto flex items-center justify-center border border-cyan-500/20 shadow-inner">
                <MapPin className="w-10 h-10 text-cyan-500" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-white uppercase">{content.locationPlaceName || 'Localisation'}</h1>
                <p className="text-sm font-bold text-slate-400 leading-tight">{content.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a href={`https://www.google.com/maps/search/?api=1&query=${content.latitude || content.address},${content.longitude || ''}`} className="py-4 bg-blue-600 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest"><Map className="w-4 h-4" /> Google Maps</a>
                <a href={`https://waze.com/ul?q=${encodeURIComponent(content.address || '')}&navigate=yes`} className="py-4 bg-cyan-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest"><Navigation className="w-4 h-4" /> Waze</a>
              </div>
            </div>
            {(content.latitude && content.longitude) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 grid grid-cols-2 gap-3 shadow-inner">
                <InfoRow label="Latitude" value={content.latitude} icon={LocateFixed} />
                <InfoRow label="Longitude" value={content.longitude} icon={LocateFixed} />
              </div>
            )}
          </div>
        );

      case 'COMPANY':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-blue-700" />
               <div className="w-28 h-28 rounded-3xl bg-white p-2 mx-auto border-4 border-slate-800 shadow-xl flex items-center justify-center overflow-hidden">
                 {registeredLogo ? <img src={registeredLogo} className="w-full h-full object-contain" /> : <span className="text-slate-950 text-3xl font-black">{getCompanyInitials(content.company, fullName)}</span>}
               </div>
               <div className="space-y-2">
                 <h1 className="text-2xl font-black text-white uppercase tracking-tight">{content.company || fullName}</h1>
                 {content.companyLegalForm && <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{content.companyLegalForm}</p>}
                 {content.slogan && <p className="text-xs font-bold text-slate-400 italic mt-2">« {content.slogan} »</p>}
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <a href={`tel:${content.primaryPhone}`} className="py-3 bg-slate-800 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><Phone className="w-4 h-4 text-emerald-400" /> Appeler</a>
                 <a href={content.websiteUrl} className="py-3 bg-slate-800 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><Globe className="w-4 h-4 text-indigo-400" /> Visiter</a>
               </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4 shadow-xl">
              <SectionHeader title="Profil Institutionnel" icon={Building2} />
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="RCCM" value={content.companyRccm} />
                <InfoRow label="ID Fiscal" value={content.companyTaxId} />
                <InfoRow label="Dirigeant" value={content.companyManagerName} />
                <InfoRow label="Capital" value={content.companyCapital} />
              </div>
              {content.companyMission && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Notre Mission</span>
                  <p className="text-xs font-bold text-slate-300 leading-relaxed">{content.companyMission}</p>
                </div>
              )}
            </div>

            {(content.companyCatalogueUrl || content.companyPortfolioUrl) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-3">
                <SectionHeader title="Documents & Portfolio" icon={FileText} />
                <InfoRow label="Catalogue PDF" value="Consulter le catalogue" icon={FileCheck2} href={content.companyCatalogueUrl} />
                <InfoRow label="Portfolio / Projets" value="Voir les réalisations" icon={Layers} href={content.companyPortfolioUrl} />
              </div>
            )}
          </div>
        );

      case 'SOCIAL':
        return (
          <div className="space-y-8 pb-10">
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className="w-36 h-36 rounded-full overflow-hidden border-8 border-slate-900 shadow-2xl bg-slate-800 relative">
                {content.photoAvatarUrl ? <img src={content.photoAvatarUrl} className="w-full h-full object-cover" /> : <User className="w-16 h-16 mt-10 text-slate-700 mx-auto" />}
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-white tracking-tight">{content.socialDisplayName || fullName}</h1>
                <p className="text-indigo-500 font-black text-xs uppercase tracking-[0.2em]">{content.socialProfession || content.jobTitle}</p>
              </div>
              {content.bio && <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[280px]">{content.bio}</p>}
            </div>

            <div className="space-y-3">
              {(content.socialLinks || []).map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-white text-slate-950 rounded-[28px] font-black text-sm shadow-xl hover:scale-[1.02] transition-transform group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Link className="w-5 h-5" /></div>
                    <span className="uppercase tracking-tight">{link.label || 'Mon Lien'}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        );

      case 'PRODUCT':
        const sheetType = content.productSheetType || 'PRODUCT';
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative">
              {content.productMainImageUrl && (
                <div className="w-full h-72 relative">
                  <img src={content.productMainImageUrl} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  {content.productPricePromo && <div className="absolute top-6 right-6 px-4 py-1.5 bg-rose-600 text-white text-[10px] font-black uppercase rounded-full shadow-2xl animate-pulse">Offre Limitée</div>}
                </div>
              )}
              <div className="p-8 text-center space-y-4">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none">{content.productName || item.title}</h1>
                {content.productBrand && <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{content.productBrand}</p>}

                {sheetType === 'PRODUCT' && (content.productPriceNormal || content.productPricePromo) && (
                  <div className="py-2">
                    <span className="text-4xl font-black text-emerald-400 tracking-tighter">{content.productPricePromo || content.productPriceNormal} <span className="text-sm font-bold opacity-70 ml-1">{content.productCurrency || 'FCFA'}</span></span>
                    {content.productPricePromo && <p className="text-xs text-slate-500 line-through font-bold mt-1">{content.productPriceNormal} {content.productCurrency}</p>}
                  </div>
                )}
                {content.productDescriptionShort && <p className="text-xs font-medium text-slate-400 italic">« {content.productDescriptionShort} »</p>}

                <div className="grid grid-cols-2 gap-3 pt-4">
                  {(content.whatsappNumber || content.primaryPhone) && <a href={`https://wa.me/${(content.whatsappNumber || content.primaryPhone!).replace(/[^\d]/g,'')}`} className="py-4 bg-emerald-600 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest"><MessageSquare className="w-4 h-4" /> Commander</a>}
                  {content.productBuyUrl && <a href={content.productBuyUrl} className="py-4 bg-blue-600 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest"><ShoppingCart className="w-4 h-4" /> Acheter</a>}
                </div>
              </div>
            </div>

            {sheetType === 'MENU' && content.menuItems && (
              <div className="space-y-8 pt-4">
                {['Entrées', 'Plats', 'Desserts', 'Boissons'].map(cat => {
                  const items = content.menuItems?.filter(i => i.category === cat);
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-4">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-3"><span className="w-8 h-px bg-emerald-500/30" />{cat}</h2>
                      <div className="space-y-3">
                        {items.map(i => (
                          <div key={i.id} className="flex justify-between items-start p-5 bg-slate-900 border border-slate-800 rounded-[28px] shadow-lg">
                            <div className="flex-1 space-y-1">
                              <h3 className="text-xs font-black text-white uppercase tracking-tight">{i.name}</h3>
                              {i.description && <p className="text-[10px] text-slate-500 font-medium leading-tight">{i.description}</p>}
                            </div>
                            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">{i.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'WEB_LINK':
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-24 h-24 bg-blue-600/10 rounded-[32px] flex items-center justify-center border border-blue-600/20 animate-pulse">
              <Globe className="w-10 h-10 text-blue-600" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none">{content.linkTitle || 'Lien Web'}</h1>
              {content.linkDescription && <p className="text-xs font-medium text-slate-400 max-w-xs">{content.linkDescription}</p>}
            </div>
            <a href={content.linkDestinationUrl} className="group relative">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
               <button className="relative px-10 py-5 bg-slate-950 text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] flex items-center gap-4 transition-all active:scale-95">Accéder au site <ArrowRight className="w-5 h-5 text-blue-500" /></button>
            </a>
          </div>
        );

      case 'CUSTOM':
        return (
          <div className="space-y-8 pb-10">
            {(content.customSections || []).map(section => (
              <div key={section.id} className="bg-slate-900/50 border border-slate-800/50 rounded-[40px] p-8 space-y-6 shadow-2xl">
                <SectionHeader title={section.title} icon={Sparkles} colorClass="text-amber-500" />
                <div className="grid grid-cols-1 gap-4">
                  {section.fields.map(field => (
                    <div key={field.id} className="p-5 bg-slate-950/50 border border-slate-800 rounded-[28px] space-y-1 hover:border-slate-700 transition-colors">
                      <span className="text-[9px] font-black uppercase text-slate-500 block tracking-widest">{field.label}</span>
                      {field.type === 'url' ? (
                        <a href={field.value} className="text-xs font-black text-blue-500 hover:underline break-all uppercase tracking-tight flex items-center gap-2">{field.value} <ExternalLink className="w-3 h-3" /></a>
                      ) : field.type === 'phone' ? (
                        <a href={`tel:${field.value}`} className="text-xs font-black text-emerald-500 hover:underline flex items-center gap-2">{field.value} <Phone className="w-3 h-3" /></a>
                      ) : field.type === 'text_long' ? (
                        <p className="text-xs font-medium text-slate-300 leading-relaxed whitespace-pre-line">{field.value}</p>
                      ) : (
                        <p className="text-xs font-black text-white uppercase tracking-tight">{field.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {(!content.customSections || content.customSections.length === 0) && (
              <div className="py-20 text-center space-y-4 opacity-50">
                <Sparkles className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aucun contenu personnalisé à afficher.</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-20">
            <Info className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type de fiche non reconnu.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md mx-auto px-6 pt-10 pb-4 flex-1 relative z-10">
        {renderContent()}
      </div>

      <footer className="py-12 text-center relative z-10">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-transparent rounded-full opacity-50" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Smart QR Intelligent</p>
          <div className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
             <p className="text-[8px] font-bold text-slate-500 uppercase">Fiche Officielle Certifiée • ID: {item.publicId}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
