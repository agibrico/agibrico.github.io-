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
  CheckCircle2,
  FileText,
  Store,
  LocateFixed,
  Headphones,
  Video,
  List,
  Truck,
  Activity,
  Landmark,
  Smartphone,
  BadgeCheck,
  Pin,
  AtSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeItem, QRContent } from '../../types/qr';
import { downloadVCard } from '../../utils/vcard';
import { recordScanEvent, fetchQRCodeByPublicId, getClientById, getStoredClients, decodeCardPayload } from '../../utils/storage';

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

  // --- COMPATIBILITY LAYER FOR OLD FLUTTER TYPES ---
  const normalizeItem = (rawItem: any): QRCodeItem => {
    if (!rawItem) return {} as QRCodeItem;
    const typeMap: Record<string, string> = {
      'vcard': 'BUSINESS_CARD',
      'business': 'BUSINESS_CARD',
      'social': 'SOCIAL',
      'shop': 'SHOP',
      'event': 'EVENT',
      'location': 'LOCATION',
      'book': 'BOOK',
      'product': 'PRODUCT',
      'url': 'WEB_LINK'
    };

    return {
      ...rawItem,
      type: typeMap[rawItem.type] || rawItem.type
    };
  };

  useEffect(() => {
    if (item && item.type === 'WEB_LINK' && item.content.redirectMode === 'DIRECT' && item.content.linkDestinationUrl && !isSimulator) {
      window.location.href = item.content.linkDestinationUrl;
    }
  }, [item, isSimulator]);

  useEffect(() => {
    if (propQrItem) {
      setItem(normalizeItem(propQrItem));
      setLoading(false);
      return;
    }

    if (typeof window !== 'undefined') {
      const fullUrl = window.location.href;
      const matchPayload = fullUrl.match(/[?&](?:d|data)=([a-zA-Z0-9%_-]+)/);
      if (matchPayload && matchPayload[1]) {
        const decoded = decodeCardPayload(matchPayload[1]);
        if (decoded) {
          const normalized = normalizeItem(decoded);
          setItem(normalized);
          setLoading(false);
          if (!isSimulator) recordScanEvent(normalized.publicId || publicId || 'direct_payload');
          return;
        }
      }
    }

    if (publicId) {
      setLoading(true);
      fetchQRCodeByPublicId(publicId).then(found => {
        if (found) {
          setItem(normalizeItem(found));
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
    const {
      eventTitle, eventStartDate, eventStartTime, eventEndDate, eventEndTime,
      eventLocationName, eventAddress, eventDescription,
      invitationTitle, invitationDate, invitationTime, invitationLocationName, invitationAddress
    } = item.content;

    const calTitle = eventTitle || invitationTitle || item.title || 'Événement';
    const startDate = eventStartDate || invitationDate;
    const startTime = eventStartTime || invitationTime;
    const endDate = eventEndDate || startDate;
    const endTime = eventEndTime || startTime;

    const startDateStr = startDate ? startDate.replace(/-/g, '') : '';
    const startTimeStr = startTime ? startTime.replace(/:/g, '') : '0000';
    const endDateStr = endDate ? endDate.replace(/-/g, '') : startDateStr;
    const endTimeStr = endTime ? endTime.replace(/:/g, '') : startTimeStr;

    const location = `${eventLocationName || invitationLocationName || ''} ${eventAddress || invitationAddress || ''}`.trim();
    const description = eventDescription || '';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${calTitle}`,
      `DTSTART:${startDateStr}T${startTimeStr}00`,
      `DTEND:${endDateStr}T${endTimeStr}00`,
      `LOCATION:${location}`,
      `DESCRIPTION:${description}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

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
  const fullName = content.fullName || `${content.firstName || ''} ${content.middleName ? content.middleName + ' ' : ''}${content.lastName || ''}`.trim() || item.publicId;

  const registeredLogo = (content.logoUrl && !content.logoUrl.includes('unsplash.com')) ? content.logoUrl : (styling?.logoUrl && !styling.logoUrl.includes('unsplash.com')) ? styling.logoUrl : null;

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

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-500" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-rose-500" />;
      case 'linkedin': return <Linkedin className="w-5 h-5 text-blue-700" />;
      case 'twitter':
      case 'x': return <Twitter className="w-5 h-5 text-slate-200" />;
      case 'youtube': return <Youtube className="w-5 h-5 text-red-600" />;
      case 'tiktok': return <Activity className="w-5 h-5 text-cyan-400" />;
      case 'telegram': return <Send className="w-5 h-5 text-sky-500" />;
      case 'whatsapp': return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      case 'snapchat': return <Sparkles className="w-5 h-5 text-yellow-500" />;
      case 'pinterest': return <Pin className="w-5 h-5 text-rose-700" />;
      case 'twitch': return <Video className="w-5 h-5 text-purple-600" />;
      case 'discord': return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'threads': return <AtSign className="w-5 h-5 text-slate-200" />;
      case 'whatsapp_channel': return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      default: return <Globe className="w-5 h-5 text-slate-400" />;
    }
  };

  // -------------------------------------------------------------------------
  // MAIN RENDERING
  // -------------------------------------------------------------------------
  const renderContent = () => {
    switch (item.type) {
      case 'BUSINESS_CARD':
        const displayPhoto = content.photoUrl || registeredLogo;
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
              {displayPhoto && (
                <div className="w-32 h-32 rounded-3xl bg-white p-2 mx-auto border-4 border-slate-800 shadow-xl overflow-hidden">
                  <img src={displayPhoto} className="w-full h-full object-cover rounded-2xl" alt={fullName} />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  {content.civility && <span className="text-xs font-bold text-slate-500">{content.civility}</span>}
                  <h1 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{content.fullName || fullName}</h1>
                </div>
                {content.jobTitle && <p className="text-xs font-black text-blue-500 uppercase tracking-[0.3em]">{content.jobTitle}</p>}
                {content.profession && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{content.profession}</p>}
                {content.company && (
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-sm font-bold text-slate-300">{content.company}</p>
                    {content.department && <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{content.department}</p>}
                  </div>
                )}
                {content.slogan && <p className="text-[10px] font-bold text-slate-500 italic mt-2">« {content.slogan} »</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={handleDownloadContact} className="col-span-2 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95"><UserPlus className="w-4 h-4" /> {savedContact ? 'Fiche Enregistrée' : 'Ajouter aux contacts'}</button>
                {content.primaryPhone && <a href={`tel:${content.primaryPhone}`} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-2xl text-slate-200 hover:bg-slate-700 transition-colors"><Phone className="w-5 h-5 text-emerald-400" /><span className="text-[8px] font-black uppercase">Appel</span></a>}
                {content.whatsappNumber && <a href={`https://wa.me/${content.whatsappNumber.replace(/[^\d]/g,'')}`} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-2xl text-slate-200 hover:bg-slate-700 transition-colors"><MessageSquare className="w-5 h-5 text-emerald-400" /><span className="text-[8px] font-black uppercase">WhatsApp</span></a>}
              </div>
            </div>

            {/* CONTACT & ADDRESS */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
              <SectionHeader title="Coordonnées & Localisation" icon={Info} />
              <div className="space-y-3">
                <InfoRow label="Email Personnel" value={content.email} icon={Mail} href={`mailto:${content.email}`} />
                <InfoRow label="Email Travail" value={content.workEmail} icon={Mail} href={`mailto:${content.workEmail}`} />
                <InfoRow label="Tél. Travail" value={content.workPhone} icon={Phone} href={`tel:${content.workPhone}`} />
                <InfoRow label="Site Web" value={content.websiteUrl} icon={Globe} href={content.websiteUrl} />
                <InfoRow label="Adresse" value={content.address} icon={MapPin} />
                {(content.city || content.commune || content.region) && (
                  <InfoRow
                    label="Zone"
                    value={[content.commune, content.city, content.region, content.country].filter(Boolean).join(', ')}
                    icon={Navigation}
                  />
                )}
                {content.postalCode && <InfoRow label="Code Postal" value={content.postalCode} icon={Hash} />}
              </div>

              {((content.latitude && content.longitude) || content.address) && (
                <a
                  href={content.latitude && content.longitude
                    ? `https://www.google.com/maps/search/?api=1&query=${content.latitude},${content.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.address || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
                >
                  <Map className="w-4 h-4 text-rose-500" /> Itinéraire GPS
                </a>
              )}
            </div>

            {/* SOCIAL NETWORKS */}
            {content.socialLinks && content.socialLinks.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Réseaux Sociaux" icon={Share2} />
                <div className="grid grid-cols-4 gap-3">
                  {content.socialLinks.map(link => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 group"
                    >
                      {getSocialIcon(link.platform)}
                      <span className="text-[7px] font-black uppercase text-slate-500 group-hover:text-slate-200 truncate w-full text-center">
                        {link.platform}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ADDITIONAL INFO */}
            {(content.bio || content.servicesOffered || content.languagesSpoken || content.availabilityHours) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
                {content.bio && (
                  <div className="space-y-2">
                    <SectionHeader title="Bio" icon={User} />
                    <p className="text-xs font-medium text-slate-400 leading-relaxed italic">« {content.bio} »</p>
                  </div>
                )}
                {content.servicesOffered && content.servicesOffered.length > 0 && (
                  <div className="space-y-3">
                    <SectionHeader title="Services" icon={Briefcase} />
                    <div className="flex flex-wrap gap-2">
                      {content.servicesOffered.map(s => <span key={s} className="px-3 py-1 bg-slate-800 text-slate-300 text-[9px] font-black uppercase rounded-lg border border-slate-700">{s}</span>)}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {content.languagesSpoken && content.languagesSpoken.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Langues</span>
                      <p className="text-[10px] font-bold text-slate-300">{content.languagesSpoken.join(', ')}</p>
                    </div>
                  )}
                  {content.availabilityHours && (
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Disponibilité</span>
                      <p className="text-[10px] font-bold text-slate-300">{content.availabilityHours}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LINKS & DOCUMENTS */}
            {(content.catalogUrl || content.brochurePdfUrl || content.portfolioUrl || content.bookingLink || content.paymentLink || content.publicNotes) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Liens & Documents" icon={Link} />
                <div className="grid grid-cols-2 gap-3">
                  {content.catalogUrl && <a href={content.catalogUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center"><span className="text-[9px] font-black uppercase text-slate-200">Catalogue</span></a>}
                  {content.brochurePdfUrl && <a href={content.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center"><span className="text-[9px] font-black uppercase text-slate-200">Brochure PDF</span></a>}
                  {content.portfolioUrl && <a href={content.portfolioUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center"><span className="text-[9px] font-black uppercase text-slate-200">Portfolio</span></a>}
                  {content.bookingLink && <a href={content.bookingLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-600/20 rounded-xl border border-blue-600/30 text-center"><span className="text-[9px] font-black uppercase text-blue-400">Réservation</span></a>}
                  {content.paymentLink && <a href={content.paymentLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-emerald-600/20 rounded-xl border border-emerald-600/30 text-center"><span className="text-[9px] font-black uppercase text-emerald-400">Paiement</span></a>}
                </div>
                {content.publicNotes && (
                  <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 block">Notes</span>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{content.publicNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'BOOK':
        return (
          <div className="space-y-6 pb-20">
            {/* --- HERO / COVER --- */}
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />

              <div className="mx-auto w-48 h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-800 relative group">
                {content.photoUrl ? (
                  <img src={content.photoUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={content.bookTitle} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-indigo-500/30">
                    <BookOpen className="w-16 h-16 mb-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Couverture</span>
                  </div>
                )}
                {content.bookMediumType === 'audio' && <div className="absolute top-3 right-3 p-2 bg-indigo-600 text-white rounded-full shadow-lg"><Headphones className="w-5 h-5" /></div>}
                {content.bookMediumType === 'digital' && <div className="absolute top-3 right-3 p-2 bg-blue-600 text-white rounded-full shadow-lg"><Smartphone className="w-5 h-5" /></div>}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  {content.bookGenre && <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest rounded-full">{content.bookGenre}</span>}
                  <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none pt-2">{content.bookTitle || item.title}</h1>
                  {content.bookSubtitle && <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{content.bookSubtitle}</p>}
                </div>

                <div className="space-y-1">
                  {content.bookAuthor && <p className="text-base font-bold text-slate-300">Par <span className="text-indigo-400 uppercase font-black">{content.bookAuthor}</span></p>}
                  {content.bookCoAuthor && <p className="text-[10px] font-bold text-slate-500">Avec {content.bookCoAuthor}</p>}
                </div>

                {(content.bookPrice || content.bookPromoPrice) && (
                  <div className="flex flex-col items-center gap-1 pt-2">
                    <span className="text-3xl font-black text-emerald-400 tracking-tighter">
                      {content.bookPromoPrice || content.bookPrice}
                      <span className="text-sm font-bold opacity-60 ml-1">{content.bookCurrency || 'FCFA'}</span>
                    </span>
                    {content.bookPromoPrice && <span className="text-xs text-slate-500 line-through font-bold">{content.bookPrice} {content.bookCurrency}</span>}
                    {content.bookStockStatus && <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1">{content.bookStockStatus}</span>}
                  </div>
                )}
              </div>

              {/* ACTIONS QUICK ACCESS */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                {(content.bookBuyUrl || content.bookOnlineStoreUrl) && (
                  <a href={content.bookBuyUrl || content.bookOnlineStoreUrl} className="col-span-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95">
                    <ShoppingCart className="w-4 h-4" /> Acheter en ligne
                  </a>
                )}

                {content.bookOrderWhatsapp && (
                  <a href={`https://wa.me/${content.bookOrderWhatsapp.replace(/[^\d]/g,'')}?text=Bonjour, je souhaite commander le livre : ${content.bookTitle}`} className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
                    <MessageSquare className="w-4 h-4" /> Commander
                  </a>
                )}

                {content.bookOrderPhone && (
                  <a href={`tel:${content.bookOrderPhone}`} className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 border border-slate-700">
                    <Phone className="w-4 h-4 text-emerald-400" /> Appeler
                  </a>
                )}

                {content.bookExerptUrl && (
                  <a href={content.bookExerptUrl} className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 border border-slate-700">
                    <BookOpen className="w-4 h-4 text-indigo-400" /> Lire Extrait
                  </a>
                )}

                {(content.bookDownloadUrl || content.bookPresentationPdfUrl) && (
                  <a href={content.bookDownloadUrl || content.bookPresentationPdfUrl} download className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 border border-slate-700">
                    <Download className="w-4 h-4 text-blue-400" /> Télécharger
                  </a>
                )}
              </div>
            </div>

            {/* --- PRESENTATION SECTIONS --- */}
            {(content.bookSummary || content.bookSynopsis || content.bookTableOfContents) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-8">
                {content.bookSummary && (
                  <div className="space-y-3">
                    <SectionHeader title="Résumé de l'ouvrage" icon={Info} colorClass="text-indigo-500" />
                    <p className="text-xs text-slate-300 leading-relaxed font-medium italic">« {content.bookSummary} »</p>
                  </div>
                )}

                {content.bookSynopsis && (
                  <div className="space-y-3">
                    <SectionHeader title="Synopsis & Détails" icon={FileText} colorClass="text-slate-400" />
                    <p className="text-xs text-slate-400 leading-relaxed font-medium whitespace-pre-line">{content.bookSynopsis}</p>
                  </div>
                )}

                {content.bookTableOfContents && (
                  <div className="space-y-3">
                    <SectionHeader title="Sommaire" icon={List} colorClass="text-slate-500" />
                    <p className="text-[10px] text-slate-500 font-bold whitespace-pre-line leading-relaxed">{content.bookTableOfContents}</p>
                  </div>
                )}
              </div>
            )}

            {/* --- AUTHOR BIO --- */}
            {content.bookAuthorBio && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="À propos de l'auteur" icon={User} colorClass="text-blue-500" />
                <div className="flex gap-4 items-start">
                   <div className="flex-1 space-y-3">
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">{content.bookAuthorBio}</p>
                      {content.bookAuthorWebsite && (
                        <a href={content.bookAuthorWebsite} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 rounded-xl text-[10px] font-black uppercase border border-blue-600/20">
                          <Globe className="w-3 h-3" /> Voir le site de l'auteur
                        </a>
                      )}
                   </div>
                </div>
              </div>
            )}

            {/* --- SPECIFICATIONS / EDITION --- */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
              <SectionHeader title="Fiche Technique" icon={Activity} colorClass="text-emerald-500" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <InfoRow label="ISBN-13" value={content.bookIsbn13} />
                  <InfoRow label="Éditeur" value={content.bookPublisher} />
                  <InfoRow label="Année" value={content.bookYear} />
                  <InfoRow label="Langue" value={content.bookLanguage} />
                </div>
                <div className="space-y-4">
                  <InfoRow label="Format" value={content.bookFormat} />
                  <InfoRow label="Pages" value={content.bookPages} />
                  <InfoRow label="Poids" value={content.bookWeight} />
                  <InfoRow label="Dimensions" value={content.bookDimensions} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                 <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-2xl">
                    <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Mots-clés & Thèmes</span>
                    <div className="flex flex-wrap gap-2">
                      {[...(content.bookKeywords || []), ...(content.bookThemes || [])].filter(Boolean).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-800 text-[8px] font-bold text-slate-400 uppercase rounded-md border border-slate-700">#{tag}</span>
                      ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* --- MEDIA SECTION --- */}
            {(content.bookTrailerUrl || content.bookPresentationVideoUrl || content.bookInterviewUrl || content.bookGallery) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
                <SectionHeader title="Médias & Interviews" icon={Video} colorClass="text-purple-500" />

                <div className="space-y-4">
                  {content.bookTrailerUrl && (
                    <a href={content.bookTrailerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-purple-500/50 transition-colors group">
                      <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center group-hover:bg-purple-600/20 transition-colors">
                        <Video className="w-6 h-6 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-black uppercase text-white block">Trailer Officiel</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Voir sur YouTube / Vimeo</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-700" />
                    </a>
                  )}

                  {content.bookPresentationVideoUrl && (
                    <a href={content.bookPresentationVideoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-colors group">
                      <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                        <Video className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-black uppercase text-white block">Présentation de l'ouvrage</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Regarder la vidéo</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-700" />
                    </a>
                  )}

                  {content.bookInterviewUrl && (
                    <a href={content.bookInterviewUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-colors group">
                      <div className="w-12 h-12 bg-emerald-600/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-600/20 transition-colors">
                        <Headphones className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-black uppercase text-white block">Interview Auteur</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Écouter ou Regarder</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-700" />
                    </a>
                  )}
                </div>

                {content.bookGallery && content.bookGallery.length > 0 && (
                  <div className="pt-4 space-y-3">
                    <span className="text-[8px] font-black uppercase text-slate-600 block tracking-widest">Galerie d'images</span>
                    <div className="grid grid-cols-3 gap-2">
                      {content.bookGallery.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                          <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- CONTACT / SALES SUPPORT --- */}
            {(content.bookOrderEmail || content.bookSalePoints) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Support & Vente" icon={ShoppingCart} colorClass="text-emerald-500" />
                <div className="space-y-3">
                   {content.bookOrderEmail && <InfoRow label="Email de commande" value={content.bookOrderEmail} icon={Mail} href={`mailto:${content.bookOrderEmail}`} />}
                   {content.bookSalePoints && (
                     <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                        <span className="text-[8px] font-black uppercase text-slate-500 block mb-1">Points de vente physiques</span>
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed">{content.bookSalePoints}</p>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        );

      case 'EVENT':
        return (
          <div className="space-y-6 pb-20">
            {/* HERO / POSTER */}
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative group">
              {content.eventPosterUrl ? (
                <div className="w-full h-80 relative">
                  <img src={content.eventPosterUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={content.eventTitle} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-rose-600 to-indigo-600 flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-white/20" />
                </div>
              )}

              <div className="p-8 text-center space-y-4 relative -mt-20">
                <div className="space-y-2">
                  {content.eventTheme && <span className="px-3 py-1 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">{content.eventTheme}</span>}
                  <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none pt-2">{content.eventTitle || item.title}</h1>
                  {content.eventSubtitle && <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{content.eventSubtitle}</p>}
                  {content.eventSlogan && <p className="text-[10px] font-bold text-rose-400 italic">« {content.eventSlogan} »</p>}
                </div>

                <div className="flex flex-col items-center gap-1 text-slate-300">
                  <p className="text-sm font-bold">{content.eventHost && `Par ${content.eventHost}`}</p>
                  {content.eventCoHost && <p className="text-[10px] font-medium opacity-60">En collaboration avec {content.eventCoHost}</p>}
                </div>

                {/* QUICK DATE/PLACE TILE */}
                <div className="grid grid-cols-2 gap-3 p-5 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 shadow-2xl text-left">
                  <div className="space-y-1 border-r border-white/10 pr-3">
                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block">Quand</span>
                    <p className="text-xs font-black text-white">{content.eventStartDate}</p>
                    <p className="text-[10px] font-bold text-slate-400">{content.eventStartTime} {content.eventTimezone ? `(${content.eventTimezone})` : ''}</p>
                  </div>
                  <div className="space-y-1 pl-3">
                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block">Où</span>
                    <p className="text-xs font-black text-white truncate">{content.eventLocationName}</p>
                    <p className="text-[9px] font-bold text-slate-400 truncate">{content.eventCity}, {content.eventCountry}</p>
                  </div>
                </div>

                {/* MAIN ACTIONS */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button onClick={handleAddToCalendar} className="col-span-2 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95"><Calendar className="w-4 h-4" /> Ajouter au Calendrier</button>

                  {(content.eventTicketUrl || content.eventBookingUrl) && (
                    <a href={content.eventTicketUrl || content.eventBookingUrl} target="_blank" rel="noopener noreferrer" className="col-span-2 py-4 bg-white text-slate-950 font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95">
                      <ShoppingCart className="w-4 h-4" /> Réserver mon ticket
                    </a>
                  )}

                  {content.eventRsvpEnabled && (
                    <button
                      onClick={() => {
                        const message = `Bonjour, je confirme ma présence pour l'événement : ${content.eventTitle}. Nom de l'invité : ${fullName}`;
                        const whatsapp = content.eventWhatsApp || content.whatsappNumber || content.eventPhone || content.primaryPhone;
                        if (whatsapp) window.open(`https://wa.me/${whatsapp.replace(/[^\d]/g,'')}?text=${encodeURIComponent(message)}`, '_blank');
                        else if (content.eventEmail) window.location.href = `mailto:${content.eventEmail}?subject=Confirmation RSVP - ${content.eventTitle}&body=${encodeURIComponent(message)}`;
                      }}
                      className="col-span-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirmer ma présence (RSVP)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* DETAILS & DESCRIPTION */}
            {(content.eventDescription || content.eventPerformers || content.eventSpecialGuests) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
                <SectionHeader title="À Propos de l'Événement" icon={Info} colorClass="text-rose-500" />
                {content.eventDescription && <p className="text-xs text-slate-300 leading-relaxed font-medium whitespace-pre-line">{content.eventDescription}</p>}

                {content.eventSpecialGuests && content.eventSpecialGuests.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Invités Spéciaux</span>
                    <div className="flex flex-wrap gap-2">
                      {content.eventSpecialGuests.map(g => <span key={g} className="px-2 py-1 bg-slate-800 text-[9px] font-bold text-slate-300 rounded-lg border border-slate-700">{g}</span>)}
                    </div>
                  </div>
                )}

                {content.eventPerformers && content.eventPerformers.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sur Scène</span>
                    <div className="flex flex-wrap gap-2">
                      {content.eventPerformers.map(p => <span key={p} className="px-3 py-1 bg-rose-600/10 text-rose-400 text-[10px] font-black uppercase rounded-lg border border-rose-600/20">{p}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROTOCOLE & HONNEUR */}
            {(content.eventGuestOfHonor || content.eventSponsor || content.eventGodmother) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Comité d'Honneur" icon={Award} colorClass="text-amber-500" />
                {content.eventGuestOfHonor && <InfoRow label="Invité d'Honneur" value={content.eventGuestOfHonor} icon={Star} />}
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Parrain" value={content.eventSponsor} />
                  <InfoRow label="Marraine" value={content.eventGodmother} />
                </div>
              </div>
            )}

            {/* PROGRAM & ACTIVITIES */}
            {(content.eventProgram || content.eventActivities || content.eventSpeakers) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
                <SectionHeader title="Programme & Déroulement" icon={List} colorClass="text-indigo-500" />
                {content.eventProgram && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{content.eventProgram}</p>
                  </div>
                )}
                {content.eventActivities && (
                   <div className="space-y-2">
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Au Programme</span>
                     <div className="space-y-2">
                        {content.eventActivities.split('.').filter(Boolean).map((act, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-xl">
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                            <span className="text-[10px] font-bold text-slate-300">{act.trim()}</span>
                          </div>
                        ))}
                     </div>
                   </div>
                )}
                {content.eventProgramPdfUrl && (
                  <a href={content.eventProgramPdfUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-indigo-600/10 text-indigo-400 text-[10px] font-black uppercase rounded-xl border border-indigo-600/20 flex items-center justify-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Télécharger le programme (PDF)
                  </a>
                )}
              </div>
            )}

            {/* LOCATION & ACCESS */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
              <SectionHeader title="Accès au Lieu" icon={MapPin} colorClass="text-rose-500" />
              <div className="space-y-3">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <h3 className="text-sm font-black text-white uppercase">{content.eventLocationName}</h3>
                  <p className="text-xs text-slate-400">{content.eventAddress}</p>
                  <p className="text-[10px] font-bold text-slate-500">{content.eventCommune}, {content.eventCity}</p>
                </div>
                {content.eventLandmark && <InfoRow label="Repère" value={content.eventLandmark} icon={LocateFixed} />}
                {content.eventAccessInstructions && (
                  <div className="p-4 bg-slate-800/20 rounded-2xl border border-slate-700/50">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Instructions d'accès</span>
                    <p className="text-[10px] text-slate-400 font-medium italic">{content.eventAccessInstructions}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${content.eventLatitude && content.eventLongitude ? `${content.eventLatitude},${content.eventLongitude}` : encodeURIComponent(`${content.eventLocationName} ${content.eventAddress}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 bg-slate-800 rounded-xl text-white font-black text-[10px] uppercase flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-400" /> Google Maps
                </a>
                <a
                  href={`https://waze.com/ul?q=${encodeURIComponent(`${content.eventLocationName} ${content.eventAddress}`)}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 bg-slate-800 rounded-xl text-white font-black text-[10px] uppercase flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Map className="w-3.5 h-3.5 text-cyan-400" /> Waze
                </a>
              </div>
            </div>

            {/* GUEST SPECIFIC (PERSONALIZED) */}
            {(content.eventInvitationNumber || content.eventTable || content.eventSeat || content.eventZone) && (
              <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 rounded-[32px] p-6 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><User className="w-20 h-20" /></div>
                <SectionHeader title="Votre Invitation" icon={User} colorClass="text-indigo-400" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-indigo-500/10">
                    <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">N° Invitation</span>
                    <span className="text-sm font-black text-indigo-400">{content.eventInvitationNumber || '#---'}</span>
                  </div>
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-indigo-500/10">
                    <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Catégorie</span>
                    <span className="text-sm font-black text-white">{content.eventGuestCategory || 'STANDARD'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950/30 rounded-xl text-center">
                    <span className="text-[7px] font-black text-slate-600 uppercase block">Table</span>
                    <span className="text-xs font-black text-white">{content.eventTable || '--'}</span>
                  </div>
                  <div className="p-3 bg-slate-950/30 rounded-xl text-center">
                    <span className="text-[7px] font-black text-slate-600 uppercase block">Siège</span>
                    <span className="text-xs font-black text-white">{content.eventSeat || '--'}</span>
                  </div>
                  <div className="p-3 bg-slate-950/30 rounded-xl text-center">
                    <span className="text-[7px] font-black text-slate-600 uppercase block">Zone</span>
                    <span className="text-xs font-black text-white">{content.eventZone || '--'}</span>
                  </div>
                </div>
                {content.eventGuestInstructions && (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                    <span className="text-[8px] font-black text-amber-500 uppercase block mb-1">À noter</span>
                    <p className="text-[10px] font-bold text-slate-400">{content.eventGuestInstructions}</p>
                  </div>
                )}
              </div>
            )}

            {/* TICKETING & RSVP INFO */}
            {(content.eventIsPaid || content.eventRsvpDeadline || content.eventMaxCapacity) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Infos Pratiques" icon={CreditCard} colorClass="text-emerald-500" />
                <div className="grid grid-cols-2 gap-4">
                  {content.eventTicketPrice && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                      <span className="text-[8px] font-black text-emerald-500 uppercase block mb-1">Accès</span>
                      <span className="text-xs font-black text-white">{content.eventTicketPrice}</span>
                    </div>
                  )}
                  {content.eventRsvpDeadline && (
                    <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                      <span className="text-[8px] font-black text-rose-500 uppercase block mb-1">RSVP Avant le</span>
                      <span className="text-xs font-black text-white">{content.eventRsvpDeadline}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <InfoRow label="WhatsApp" value={content.eventWhatsApp || content.whatsappNumber} icon={MessageSquare} href={`https://wa.me/${(content.eventWhatsApp || content.whatsappNumber || '').replace(/[^\d]/g,'')}`} />
                  <InfoRow label="Appeler" value={content.eventPhone || content.primaryPhone} icon={Phone} href={`tel:${content.eventPhone || content.primaryPhone}`} />
                  <InfoRow label="Email" value={content.eventEmail || content.email} icon={Mail} href={`mailto:${content.eventEmail || content.email}`} />
                </div>
              </div>
            )}

            {/* SHARE ACTION */}
            <div className="pt-4">
               <button
                 onClick={() => {
                   if (navigator.share) {
                     navigator.share({ title: content.eventTitle, text: content.eventDescription, url: window.location.href });
                   } else {
                     navigator.clipboard.writeText(window.location.href);
                     alert("Lien copié !");
                   }
                 }}
                 className="w-full py-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                >
                 <Share2 className="w-4 h-4" /> Partager l'invitation
               </button>
            </div>
          </div>
        );

      case 'SHOP':
        const shopDisplayName = content.shopName || content.shopCommercialName || content.commercialName || content.company || 'Boutique';
        return (
          <div className="space-y-6 pb-20">
            {/* HERO / COVER */}
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative group">
              {content.shopCoverUrl ? (
                <div className="w-full h-56 relative">
                  <img src={content.shopCoverUrl} className="w-full h-full object-cover" alt={shopDisplayName} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-emerald-600 to-teal-700" />
              )}

              <div className="p-8 text-center space-y-4 relative -mt-16">
                <div className="w-24 h-24 rounded-3xl bg-white p-2 mx-auto shadow-2xl border-4 border-slate-800 flex items-center justify-center overflow-hidden">
                  {registeredLogo ? <img src={registeredLogo} className="w-full h-full object-contain" alt="Logo" /> : <Store className="w-10 h-10 text-slate-200" />}
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{shopDisplayName}</h1>
                  {content.shopType && <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">{content.shopType}</p>}
                  {content.shopIndustry && <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{content.shopIndustry}</p>}
                  {content.slogan && <p className="text-[10px] font-bold text-slate-400 italic mt-1">« {content.slogan} »</p>}
                </div>

                {/* QUICK ACTIONS */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <a href={`https://wa.me/${(content.whatsappNumber || content.primaryPhone || '').replace(/[^\d]/g,'')}?text=Bonjour, je vous contacte depuis votre fiche QR.`} className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>
                  <a href={`tel:${content.primaryPhone}`} className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 border border-slate-700">
                    <Phone className="w-4 h-4 text-emerald-400" /> Appeler
                  </a>
                  <a href={content.shopCatalogUrl || content.catalogUrl} className="col-span-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95">
                    <ShoppingCart className="w-4 h-4" /> Voir le Catalogue
                  </a>
                </div>
              </div>
            </div>

            {/* DESCRIPTION & ACTIVITY */}
            {(content.shopDescription || content.shopProducts || content.shopPromotions || content.shopNewArrivals) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
                <SectionHeader title="À Propos" icon={Info} colorClass="text-emerald-500" />
                {content.shopDescription && <p className="text-xs text-slate-300 leading-relaxed font-medium whitespace-pre-line">{content.shopDescription}</p>}

                {content.shopProducts && (
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Nos Produits</span>
                    <p className="text-xs text-slate-400 font-bold">{content.shopProducts}</p>
                  </div>
                )}

                {content.shopPromotions && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-1">
                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block">Promotions</span>
                    <p className="text-xs font-black text-white italic">{content.shopPromotions}</p>
                  </div>
                )}

                {content.shopNewArrivals && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-1">
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest block">Nouveautés</span>
                    <p className="text-xs font-black text-white italic">{content.shopNewArrivals}</p>
                  </div>
                )}
              </div>
            )}

            {/* ADRESSE & ITINÉRAIRE */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
              <SectionHeader title="Où nous trouver" icon={MapPin} colorClass="text-rose-500" />
              <div className="space-y-3">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <p className="text-xs font-black text-white uppercase">{content.address}</p>
                  <p className="text-[10px] font-bold text-slate-500">{content.neighborhood}, {content.commune}</p>
                  <p className="text-[10px] font-bold text-slate-500">{content.city}, {content.country}</p>
                </div>
                {content.landmark && <InfoRow label="Repère" value={content.landmark} icon={LocateFixed} />}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${content.latitude && content.longitude ? `${content.latitude},${content.longitude}` : encodeURIComponent(`${shopDisplayName} ${content.address || ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 border border-slate-700"
                >
                  <Navigation className="w-4 h-4 text-rose-500" /> Itinéraire GPS
                </a>
              </div>
            </div>

            {/* HORAIRES */}
            {content.openingHours && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6">
                <SectionHeader title="Horaires d'Ouverture" icon={Clock} colorClass="text-slate-400" />
                <div className="space-y-2">
                  {content.openingHours.map(d => (
                    <div key={d.day} className="flex justify-between items-center text-[10px] font-black uppercase">
                      <span className="text-slate-500">{d.day}</span>
                      <span className={d.isOpen ? "text-white" : "text-rose-500/70"}>{d.isOpen ? `${d.openTime} - ${d.closeTime}` : 'Fermé'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LIVRAISON & PAIEMENTS */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
              <SectionHeader title="Services Logistiques" icon={Truck} colorClass="text-blue-500" />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center text-center gap-2">
                   <Truck className={`w-6 h-6 ${content.shopDeliveryAvailable ? 'text-emerald-500' : 'text-slate-700'}`} />
                   <span className="text-[9px] font-black uppercase text-white">Livraison</span>
                   <span className="text-[8px] font-bold text-slate-500 uppercase">{content.shopDeliveryAvailable ? 'Disponible' : 'Non disp.'}</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center text-center gap-2">
                   <Package className={`w-6 h-6 ${content.shopInStorePickup ? 'text-blue-500' : 'text-slate-700'}`} />
                   <span className="text-[9px] font-black uppercase text-white">Retrait</span>
                   <span className="text-[8px] font-bold text-slate-500 uppercase">{content.shopInStorePickup ? 'En Magasin' : 'Non disp.'}</span>
                </div>
              </div>

              {content.shopPaymentMethods && content.shopPaymentMethods.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[8px] font-black uppercase text-slate-600 block tracking-widest text-center">Modes de Paiement Acceptés</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {content.shopPaymentMethods.map(p => <span key={p} className="px-3 py-1 bg-slate-800 text-[9px] font-black text-slate-300 uppercase rounded-lg border border-slate-700">{p}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* DOCUMENTS */}
            {(content.shopPriceListUrl || content.shopMenuUrl || content.shopBrochureUrl) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Documents & Catalogues" icon={FileText} />
                <div className="grid grid-cols-1 gap-3">
                  {content.shopPriceListUrl && <a href={content.shopPriceListUrl} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between group hover:border-emerald-500/50 transition-colors"><span className="text-[10px] font-black uppercase text-white">Liste de Prix</span><Download className="w-4 h-4 text-emerald-500" /></a>}
                  {content.shopMenuUrl && <a href={content.shopMenuUrl} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between group hover:border-amber-500/50 transition-colors"><span className="text-[10px] font-black uppercase text-white">Consulter le Menu</span><BookOpen className="w-4 h-4 text-amber-500" /></a>}
                  {content.shopBrochureUrl && <a href={content.shopBrochureUrl} className="p-4 bg-slate-800 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-blue-500/50 transition-colors"><span className="text-[10px] font-black uppercase text-white">Brochure PDF</span><Download className="w-4 h-4 text-blue-500" /></a>}
                </div>
              </div>
            )}

            {/* RÉSEAUX SOCIAUX */}
            {content.socialLinks && content.socialLinks.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Suivez-nous" icon={Share2} />
                <div className="grid grid-cols-4 gap-3">
                  {content.socialLinks.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 group">
                      {getSocialIcon(link.platform)}
                      <span className="text-[7px] font-black uppercase text-slate-500 group-hover:text-slate-200 truncate w-full text-center">{link.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="pt-4 grid grid-cols-1 gap-3">
               <button
                 onClick={() => {
                   if (navigator.share) {
                     navigator.share({ title: shopDisplayName, text: content.shopDescription, url: window.location.href });
                   } else {
                     navigator.clipboard.writeText(window.location.href);
                     alert("Lien copié !");
                   }
                 }}
                 className="w-full py-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                >
                 <Share2 className="w-4 h-4" /> Partager la Boutique
               </button>
            </div>
          </div>
        );

      case 'LOCATION':
        const mapUrl = content.googleMapsUrl || content.locationLink || (content.latitude && content.longitude ? `https://www.google.com/maps/search/?api=1&query=${content.latitude},${content.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.address || '')}`);
        const itineraryUrl = content.latitude && content.longitude ? `https://www.google.com/maps/dir/?api=1&destination=${content.latitude},${content.longitude}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(content.address || '')}`;

        return (
          <div className="space-y-6 pb-20">
            {/* HERO / MAP HEADER */}
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative group">
              <div className="w-full h-48 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                {content.photoUrl ? (
                  <img src={content.photoUrl} className="w-full h-full object-cover" alt={content.locationPlaceName} />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-cyan-500/20">
                    <MapPinned className="w-20 h-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Logo Overlay */}
                {registeredLogo && (
                  <div className="absolute bottom-4 left-6 w-16 h-16 bg-white rounded-2xl p-2 shadow-xl border border-slate-800 overflow-hidden">
                    <img src={registeredLogo} className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2 text-center">
                  {content.locationPlaceType && <span className="px-3 py-1 bg-cyan-600/10 text-cyan-400 border border-cyan-600/20 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">{content.locationPlaceType}</span>}
                  <h1 className="text-3xl font-black text-white uppercase tracking-tight pt-2">{content.locationPlaceName || item.title}</h1>
                  {content.locationDescription && <p className="text-xs font-medium text-slate-400 italic">« {content.locationDescription} »</p>}
                </div>

                {/* MAIN ACTION GRID */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="col-span-2 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95">
                    <Map className="w-4 h-4" /> Ouvrir la carte
                  </a>

                  <a href={itineraryUrl} target="_blank" rel="noopener noreferrer" className="py-4 bg-white text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                    <Navigation className="w-4 h-4" /> Itinéraire
                  </a>

                  <a href={`https://wa.me/${(content.whatsappNumber || '').replace(/[^\d]/g,'')}?text=Bonjour, je vous contacte à propos de : ${content.locationPlaceName}`} className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>

                  {content.primaryPhone && (
                    <a href={`tel:${content.primaryPhone}`} className="py-4 bg-slate-800 border border-slate-700 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95">
                      <Phone className="w-4 h-4 text-emerald-400" /> Appeler
                    </a>
                  )}

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(content.address || '');
                      alert("Adresse copiée !");
                    }}
                    className="py-4 bg-slate-800 border border-slate-700 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95"
                  >
                    <Copy className="w-4 h-4 text-blue-400" /> Copier Adresse
                  </button>
                </div>
              </div>
            </div>

            {/* ADDRESS SECTION */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
              <SectionHeader title="Adresse & Localisation" icon={MapPinned} colorClass="text-rose-500" />
              <div className="space-y-3">
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <p className="text-sm font-black text-white uppercase leading-tight">{content.address}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {content.locationStreet && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Rue: {content.locationStreet}</span>}
                    {content.neighborhood && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Quartier: {content.neighborhood}</span>}
                    {content.commune && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Commune: {content.commune}</span>}
                    {content.city && <span className="text-[10px] font-black text-blue-400 uppercase tracking-tight">{content.city}</span>}
                    {content.country && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{content.country}</span>}
                  </div>
                </div>
                {content.landmark && <InfoRow label="Point de repère" value={content.landmark} icon={LocateFixed} />}
                {content.postalCode && <InfoRow label="Code Postal" value={content.postalCode} />}
              </div>
            </div>

            {/* GPS & MAP LINKS */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
              <SectionHeader title="Coordonnées GPS" icon={LocateFixed} colorClass="text-blue-500" />
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Latitude" value={content.latitude} />
                <InfoRow label="Longitude" value={content.longitude} />
                {content.altitude && <InfoRow label="Altitude" value={`${content.altitude} m`} />}
              </div>
              <div className="space-y-3 pt-2">
                {content.appleMapsUrl && (
                  <a href={content.appleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl group hover:border-indigo-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Navigation className="w-4 h-4 text-indigo-500" /></div>
                      <span className="text-[10px] font-black uppercase text-white">Apple Maps</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
                  </a>
                )}
              </div>
            </div>

            {/* ACCESS & COMMODITIES */}
            {(content.locationItineraryDescription || content.locationMainEntrance || content.locationMeetingPoint || content.locationParkingInfo || content.locationTransportInfo || content.locationAccessibilityInfo) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
                <SectionHeader title="Accès & Commodités" icon={Layers} colorClass="text-emerald-500" />
                {content.locationItineraryDescription && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Itinéraire détaillé</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{content.locationItineraryDescription}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Entrée" value={content.locationMainEntrance} />
                  <InfoRow label="Meeting Point" value={content.locationMeetingPoint} />
                  <InfoRow label="Parking" value={content.locationParkingInfo} icon={Truck} />
                  <InfoRow label="Transports" value={content.locationTransportInfo} icon={Activity} />
                </div>
                {content.locationAccessibilityInfo && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <span className="text-[8px] font-black text-emerald-500 uppercase block mb-1">Accessibilité</span>
                    <p className="text-[10px] font-bold text-slate-400">{content.locationAccessibilityInfo}</p>
                  </div>
                )}
              </div>
            )}

            {/* CONTACT RESPONSIBLE */}
            {(content.locationManagerName || content.email || content.primaryPhone) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Contact Responsable" icon={User} colorClass="text-indigo-500" />
                <div className="space-y-3">
                  {content.locationManagerName && <InfoRow label="Manager / Gérant" value={content.locationManagerName} icon={User} />}
                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow label="Téléphone" value={content.primaryPhone} icon={Phone} href={`tel:${content.primaryPhone}`} />
                    <InfoRow label="E-mail" value={content.email} icon={Mail} href={`mailto:${content.email}`} />
                  </div>
                </div>
              </div>
            )}

            {/* OPENING HOURS */}
            {content.openingHours && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6">
                <SectionHeader title="Horaires d'Ouverture" icon={Clock} colorClass="text-slate-400" />
                <div className="space-y-2">
                  {content.openingHours.map(d => (
                    <div key={d.day} className="flex justify-between items-center text-[10px] font-black uppercase">
                      <span className="text-slate-500">{d.day}</span>
                      <span className={d.isOpen ? "text-white" : "text-rose-500/70"}>{d.isOpen ? `${d.openTime} - ${d.closeTime}` : 'Fermé'}</span>
                    </div>
                  ))}
                </div>
                {content.locationOpeningDays && (
                   <p className="text-[9px] text-slate-500 mt-4 italic text-center font-bold">Notes: {content.locationOpeningDays}</p>
                )}
              </div>
            )}

            {/* SHARE ACTION */}
            <div className="pt-4">
               <button
                 onClick={() => {
                   if (navigator.share) {
                     navigator.share({ title: content.locationPlaceName, text: content.locationDescription, url: window.location.href });
                   } else {
                     navigator.clipboard.writeText(window.location.href);
                     alert("Lien copié !");
                   }
                 }}
                 className="w-full py-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                >
                 <Share2 className="w-4 h-4" /> Partager la localisation
               </button>
            </div>
          </div>
        );

      case 'COMPANY':
        const companyName = content.company || fullName;
        const managerFullName = content.companyManagerName || `${content.companyManagerFirstName || ''} ${content.companyManagerLastName || ''}`.trim();
        const isAdminHidden = content.privacy?.hideCompanyAdminInfo;

        return (
          <div className="space-y-6 pb-20">
            {/* HERO / IDENTIFICATION */}
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative group">
              {content.companyCoverUrl ? (
                <div className="w-full h-48 relative">
                  <img src={content.companyCoverUrl} className="w-full h-full object-cover" alt={companyName} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>
              ) : (
                <div className="w-full h-24 bg-gradient-to-br from-blue-700 to-indigo-800" />
              )}

              <div className="p-8 text-center space-y-4 relative -mt-16">
                <div className="w-28 h-28 rounded-3xl bg-white p-2 mx-auto shadow-2xl border-4 border-slate-800 flex items-center justify-center overflow-hidden">
                  {registeredLogo ? <img src={registeredLogo} className="w-full h-full object-contain" alt="Logo" /> : <Building2 className="w-12 h-12 text-slate-200" />}
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{companyName}</h1>
                  {(content.companySigle || content.acronym) && (
                    <p className="text-xs font-black text-blue-500 uppercase tracking-[0.3em]">
                      {content.companySigle || content.acronym}
                    </p>
                  )}
                  {content.companyLegalForm && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{content.companyLegalForm} {content.companyCapital ? `• Capital: ${content.companyCapital}` : ''}</p>}
                  {content.slogan && <p className="text-[10px] font-bold text-slate-400 italic mt-2">« {content.slogan} »</p>}
                </div>

                {/* QUICK ACTIONS */}
                <div className="grid grid-cols-4 gap-3 pt-4">
                  {content.primaryPhone && <a href={`tel:${content.primaryPhone}`} className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"><Phone className="w-4 h-4 text-emerald-400" /><span className="text-[7px] font-black uppercase">Appel</span></a>}
                  {content.whatsappNumber && <a href={`https://wa.me/${content.whatsappNumber.replace(/[^\d]/g,'')}`} className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"><MessageSquare className="w-4 h-4 text-emerald-400" /><span className="text-[7px] font-black uppercase">WhatsApp</span></a>}
                  {content.email && <a href={`mailto:${content.email}`} className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"><Mail className="w-4 h-4 text-blue-400" /><span className="text-[7px] font-black uppercase">Email</span></a>}
                  {content.websiteUrl && <a href={content.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"><Globe className="w-4 h-4 text-indigo-400" /><span className="text-[7px] font-black uppercase">Site</span></a>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {content.companyCatalogueUrl && (
                    <a href={content.companyCatalogueUrl} target="_blank" rel="noopener noreferrer" className="py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] rounded-xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95">
                      <ShoppingCart className="w-3.5 h-3.5" /> Catalogue
                    </a>
                  )}
                  {((content.latitude && content.longitude) || content.address) && (
                    <a
                      href={content.latitude && content.longitude ? `https://www.google.com/maps/dir/?api=1&destination=${content.latitude},${content.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.address || '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="py-3.5 bg-white text-slate-950 font-black text-[10px] rounded-xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Itinéraire
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ADMINISTRATIVE INFO */}
            {!isAdminHidden && (content.companyRccm || content.companyTaxId || content.companyFiscalId || content.companyCnpsId || content.companyAgreement || content.companyLicense || content.companyAuthNumber) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4 shadow-xl">
                <SectionHeader title="Informations Administratives" icon={Shield} colorClass="text-rose-500" />
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="RCCM" value={content.companyRccm} />
                  <InfoRow label="ID Fiscal (IFU)" value={content.companyTaxId} />
                  <InfoRow label="N° Fiscal (NIF)" value={content.companyFiscalId} />
                  <InfoRow label="N° CNPS" value={content.companyCnpsId} />
                  <InfoRow label="Agrément" value={content.companyAgreement} />
                  <InfoRow label="Licence" value={content.companyLicense} />
                  <InfoRow label="N° Autorisation" value={content.companyAuthNumber} />
                </div>
              </div>
            )}

            {/* ACTIVITY */}
            {(content.companySector || content.companyDomain || content.companyMainActivity || content.companySecondaryActivities) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Domaine d'Activité" icon={Activity} colorClass="text-emerald-500" />
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Secteur" value={content.companySector || content.industry} />
                  <InfoRow label="Domaine" value={content.companyDomain} />
                </div>
                {content.companyMainActivity && <InfoRow label="Activité Principale" value={content.companyMainActivity} />}
                {content.companySecondaryActivities && content.companySecondaryActivities.length > 0 && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-[8px] font-black uppercase text-slate-500 block mb-2 tracking-widest">Autres Activités</span>
                    <div className="flex flex-wrap gap-2">
                      {content.companySecondaryActivities.map(a => <span key={a} className="px-2 py-1 bg-slate-800 text-[9px] font-bold text-slate-300 rounded-lg border border-slate-700">{a}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PRESENTATION */}
            {(content.companyMission || content.companyVision || content.companyValues || content.servicesList || content.companyBrands || content.companyPartners || content.companyCertifications) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
                <SectionHeader title="Vision & Engagement" icon={Quote} colorClass="text-indigo-500" />
                <div className="space-y-4">
                  {content.companyMission && (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <span className="text-[8px] font-black uppercase text-slate-500 block mb-1 tracking-widest">Mission</span>
                      <p className="text-xs font-bold text-slate-300 leading-relaxed italic">« {content.companyMission} »</p>
                    </div>
                  )}
                  {content.companyVision && (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <span className="text-[8px] font-black uppercase text-slate-500 block mb-1 tracking-widest">Vision</span>
                      <p className="text-xs font-bold text-indigo-300 leading-relaxed">{content.companyVision}</p>
                    </div>
                  )}
                  {content.companyValues && (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <span className="text-[8px] font-black uppercase text-slate-500 block mb-1 tracking-widest">Nos Valeurs</span>
                      <p className="text-xs font-bold text-slate-400">{content.companyValues}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {content.servicesList && content.servicesList.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Produits & Services</span>
                      <div className="flex flex-wrap gap-2">
                        {content.servicesList.map(s => <span key={s} className="px-2 py-1 bg-slate-800 text-[9px] font-black uppercase text-slate-300 rounded-lg border border-slate-700">{s}</span>)}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {content.companyBrands && content.companyBrands.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Marques</span>
                        <p className="text-[10px] font-bold text-slate-400">{content.companyBrands.join(', ')}</p>
                      </div>
                    )}
                    {content.companyPartners && content.companyPartners.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Partenaires</span>
                        <p className="text-[10px] font-bold text-slate-400">{content.companyPartners.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MANAGER */}
            {(managerFullName || content.companyManagerFunction || content.companyManagerPhone || content.companyManagerEmail) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Direction / Responsable" icon={User} colorClass="text-purple-500" />
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-4">
                   <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center border border-purple-500/20"><User className="w-6 h-6 text-purple-500" /></div>
                   <div className="flex-1">
                      <h3 className="text-sm font-black text-white uppercase">{managerFullName}</h3>
                      <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest">{content.companyManagerFunction || content.jobTitle}</p>
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                   {content.companyManagerPhone && <a href={`tel:${content.companyManagerPhone}`} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col items-center gap-1"><Phone className="w-4 h-4 text-emerald-400" /><span className="text-[7px] font-black uppercase">Appel</span></a>}
                   {content.companyManagerWhatsapp && <a href={`https://wa.me/${content.companyManagerWhatsapp.replace(/[^\d]/g,'')}`} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col items-center gap-1"><MessageSquare className="w-4 h-4 text-emerald-400" /><span className="text-[7px] font-black uppercase">WhatsApp</span></a>}
                   {content.companyManagerEmail && <a href={`mailto:${content.companyManagerEmail}`} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col items-center gap-1"><Mail className="w-4 h-4 text-blue-400" /><span className="text-[7px] font-black uppercase">Email</span></a>}
                </div>
              </div>
            )}

            {/* COORDINATES & SIEGE */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
              <SectionHeader title="Coordonnées & Siège" icon={MapPin} colorClass="text-rose-500" />
              <div className="space-y-3">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Siège Social</span>
                      <p className="text-xs font-black text-white uppercase">{content.companyHeadquarters}</p>
                    </div>
                    {content.companyAgency && (
                      <div className="text-right">
                        <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Agence</span>
                        <p className="text-[10px] font-bold text-slate-400">{content.companyAgency}</p>
                      </div>
                    )}
                  </div>
                  <div className="h-px bg-slate-800 w-full my-2" />
                  <p className="text-xs font-bold text-slate-300">{content.address}</p>
                  <p className="text-[10px] font-bold text-slate-500">{content.commune}, {content.city}, {content.country}</p>
                </div>
              </div>
            </div>

            {/* SOCIAL NETWORKS */}
            {content.socialLinks && content.socialLinks.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Suivez-nous" icon={Share2} />
                <div className="grid grid-cols-4 gap-3">
                  {content.socialLinks.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 group">
                      {getSocialIcon(link.platform)}
                      <span className="text-[7px] font-black uppercase text-slate-500 group-hover:text-slate-200 truncate w-full text-center">{link.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* DOCUMENTS & CATALOGUES */}
            {(content.companyPresentationPdfUrl || content.companyCatalogueUrl || content.companyBrochureUrl || content.companyPlaquetteUrl || content.companyCertPublicUrl || content.companyRatesUrl || content.companyPortfolioUrl) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-3">
                <SectionHeader title="Ressources & Catalogues" icon={FileText} colorClass="text-slate-400" />
                {content.companyPresentationPdfUrl && <a href={content.companyPresentationPdfUrl} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between group hover:border-blue-500/50 transition-colors"><span className="text-[10px] font-black uppercase text-white">Présentation PDF</span><Download className="w-4 h-4 text-blue-500" /></a>}
                {content.companyCatalogueUrl && <a href={content.companyCatalogueUrl} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between group hover:border-emerald-500/50 transition-colors"><span className="text-[10px] font-black uppercase text-white">Catalogue Produits</span><ShoppingCart className="w-4 h-4 text-emerald-500" /></a>}
                {content.companyPlaquetteUrl && <a href={content.companyPlaquetteUrl} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between group hover:border-indigo-500/50 transition-colors"><span className="text-[10px] font-black uppercase text-white">Plaquette</span><FileCheck2 className="w-4 h-4 text-indigo-500" /></a>}
                {content.companyCertPublicUrl && <a href={content.companyCertPublicUrl} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between group hover:border-amber-500/50 transition-colors"><span className="text-[10px] font-black uppercase text-white">Certificat Public</span><Award className="w-4 h-4 text-amber-500" /></a>}
                {content.companyRatesUrl && <a href={content.companyRatesUrl} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between group hover:border-rose-500/50 transition-colors"><span className="text-[10px] font-black uppercase text-white">Grille Tarifaire</span><Download className="w-4 h-4 text-rose-500" /></a>}
                {content.companyPortfolioUrl && <a href={content.companyPortfolioUrl} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between group hover:border-purple-500/50 transition-colors"><span className="text-[10px] font-black uppercase text-white">Portfolio / Réalisations</span><Layers className="w-4 h-4 text-purple-500" /></a>}
              </div>
            )}

            {/* SHARE ACTION */}
            <div className="pt-4">
               <button
                 onClick={() => {
                   if (navigator.share) {
                     navigator.share({ title: companyName, text: content.companyMission, url: window.location.href });
                   } else {
                     navigator.clipboard.writeText(window.location.href);
                     alert("Lien copié !");
                   }
                 }}
                 className="w-full py-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                >
                 <Share2 className="w-4 h-4" /> Partager la fiche entreprise
               </button>
            </div>
          </div>
        );

      case 'SOCIAL':
        const socialPlatforms = (content.socialLinks || []);
        const customLinks = (content.socialCustomLinks || []).filter(l => l.isVisible).sort((a,b) => a.order - b.order);

        return (
          <div className="space-y-0 pb-20 -mx-6 -mt-6">
            {/* 1. Header: Banner + Avatar */}
            <div className="relative">
              <div className="w-full h-56 bg-slate-900 overflow-hidden relative">
                {content.photoBannerUrl ? (
                  <img src={content.photoBannerUrl} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-black opacity-80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              </div>

              <div className="absolute -bottom-16 left-0 right-0 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full border-[6px] border-slate-950 shadow-2xl overflow-hidden bg-slate-800 relative">
                  {content.photoAvatarUrl ? (
                    <img src={content.photoAvatarUrl} className="w-full h-full object-cover" alt={content.socialDisplayName} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-800">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                  {content.logoUrl && (
                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full p-1 shadow-lg border-2 border-slate-950">
                      <img src={content.logoUrl} className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Profile Info */}
            <div className="pt-20 px-8 text-center space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-3xl font-black text-white tracking-tight">{content.socialDisplayName || fullName}</h1>
                  {content.socialPseudonym && <BadgeCheck className="w-6 h-6 text-indigo-500" />}
                </div>
                {content.socialPseudonym && <p className="text-sm font-black text-indigo-500 uppercase tracking-widest">{content.socialPseudonym}</p>}
                <div className="flex flex-col items-center gap-1 pt-1">
                  {content.socialProfession && <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">{content.socialProfession}</p>}
                  {content.socialActivity && <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{content.socialActivity}</p>}
                  {(content.jobTitle || content.company) && (
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      {content.jobTitle}{content.jobTitle && content.company ? ' @ ' : ''}{content.company}
                    </p>
                  )}
                </div>
              </div>

              {content.slogan && <p className="text-sm font-black text-indigo-400 italic">"{content.slogan}"</p>}
              {content.bio && <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[300px] mx-auto">{content.bio}</p>}

              {(content.city || content.country) && (
                <div className="flex items-center justify-center gap-1 text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                  <MapPin className="w-3 h-3" />
                  <span>{content.city}{content.city && content.country ? ', ' : ''}{content.country}</span>
                </div>
              )}
            </div>

            {/* 3. Social Grid */}
            {socialPlatforms.length > 0 && (
              <div className="px-8 pt-10">
                <div className="grid grid-cols-4 gap-4">
                  {socialPlatforms.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-lg">
                        {getSocialIcon(link.platform)}
                      </div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{link.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Action Buttons */}
            <div className="px-8 pt-8 flex flex-wrap justify-center gap-3">
              <button onClick={() => {
                const primary = socialPlatforms[0]?.url || content.websiteUrl || (content.socialLinks && content.socialLinks[0]?.url);
                if(primary) window.open(primary, '_blank');
              }} className="flex-1 min-w-[120px] py-3 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-tighter shadow-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                <UserPlus className="w-4 h-4" /> Suivre
              </button>
              <button onClick={() => {
                if(navigator.share) {
                  navigator.share({ title: content.socialDisplayName || fullName, url: window.location.href });
                }
              }} className="p-3 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl hover:bg-slate-800 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button onClick={() => window.location.href = `mailto:${content.email || ''}`} className="flex-1 min-w-[120px] py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-tighter shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
                <Mail className="w-4 h-4" /> Contact
              </button>
            </div>

            {/* 5. Custom Links List */}
            {customLinks.length > 0 && (
              <div className="px-8 pt-10 space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-slate-800" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Mes Liens</span>
                  <div className="h-px flex-1 bg-slate-800" />
                </div>

                {customLinks.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-slate-900 border border-slate-800 text-white rounded-[28px] shadow-2xl group hover:border-indigo-500 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Link className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-sm font-black uppercase tracking-tight">{link.title}</span>
                        {link.description && <span className="block text-[10px] font-medium text-slate-500">{link.description}</span>}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </a>
                ))}
              </div>
            )}

            {/* 6. Secondary Actions */}
            <div className="px-8 pt-12 grid grid-cols-2 gap-4">
              {content.whatsappNumber && (
                <button onClick={() => window.open(`https://wa.me/${content.whatsappNumber.replace(/\D/g, '')}`, '_blank')} className="flex items-center justify-center gap-2 p-4 bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-900/50 transition-colors">
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </button>
              )}
              {content.websiteUrl && (
                <button onClick={() => window.open(content.websiteUrl, '_blank')} className="flex items-center justify-center gap-2 p-4 bg-blue-950/30 border border-blue-900/50 text-blue-400 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-900/50 transition-colors">
                  <Globe className="w-4 h-4" /> Visiter
                </button>
              )}
              <button onClick={() => downloadVCard(item)} className="col-span-2 flex items-center justify-center gap-2 p-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors mt-2">
                <Download className="w-4 h-4" /> Enregistrer le Contact
              </button>
            </div>

            {content.socialLongBio && (
              <div className="px-8 pt-12 pb-10">
                <div className="p-8 bg-slate-950 border border-slate-900 rounded-[40px] space-y-4">
                  <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">À propos</h4>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed whitespace-pre-line">{content.socialLongBio}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'PRODUCT':
        const sheetType = content.productSheetType || 'PRODUCT';

        return (
          <div className="space-y-6 pb-20">
            {/* --- SUBTYPE: PRODUIT --- */}
            {sheetType === 'PRODUCT' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                 {/* HERO / PRODUCT DISPLAY */}
                 <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative group">
                    {content.productMainImageUrl ? (
                      <div className="w-full h-80 relative">
                        <img src={content.productMainImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        {content.productPricePromo && (
                           <div className="absolute top-6 right-6 px-4 py-1.5 bg-rose-600 text-white text-[10px] font-black uppercase rounded-full shadow-2xl animate-bounce">
                              -{Math.round(((parseFloat(content.productPriceNormal || '0') - parseFloat(content.productPricePromo || '0')) / parseFloat(content.productPriceNormal || '1')) * 100)}%
                           </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-slate-800 flex items-center justify-center"><Package className="w-16 h-16 text-slate-700" /></div>
                    )}

                    <div className="p-8 text-center space-y-4">
                       <div className="space-y-1">
                          {content.productBrand && <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">{content.productBrand}</span>}
                          <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">{content.productName || item.title}</h1>
                          {content.productModel && <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{content.productModel}</p>}
                       </div>

                       {(content.productPriceNormal || content.productPricePromo) && (
                         <div className="flex flex-col items-center gap-1">
                            <span className="text-4xl font-black text-emerald-400 tracking-tighter">
                               {content.productPricePromo || content.productPriceNormal}
                               <span className="text-sm font-bold opacity-60 ml-1">{content.productCurrency || 'FCFA'}</span>
                            </span>
                            {content.productPricePromo && <span className="text-xs text-slate-500 line-through font-bold">{content.productPriceNormal} {content.productCurrency}</span>}
                         </div>
                       )}

                       {content.productDescriptionShort && <p className="text-xs font-medium text-slate-400 italic">« {content.productDescriptionShort} »</p>}

                       {/* INVENTORY STATUS */}
                       <div className="flex items-center justify-center gap-3 pt-2">
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${content.productIsAvailable !== false ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                             {content.productIsAvailable !== false ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                             <span className="text-[9px] font-black uppercase">{content.productIsAvailable !== false ? 'En Stock' : 'Épuisé'}</span>
                          </div>
                          {content.productStockQuantity && <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{content.productStockQuantity} unités dispo.</span>}
                       </div>

                       {/* MAIN ACTIONS */}
                       <div className="grid grid-cols-2 gap-3 pt-6">
                          <a href={content.productBuyUrl || '#'} className="col-span-2 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95">
                             <ShoppingCart className="w-4 h-4" /> Acheter Maintenant
                          </a>
                          <a href={`https://wa.me/${(content.productOrderWhatsapp || '').replace(/[^\d]/g,'')}?text=Bonjour, je souhaite commander le produit : ${content.productName}`} className="py-4 bg-emerald-600 text-white font-black text-[10px] rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg">
                             <MessageSquare className="w-4 h-4" /> WhatsApp
                          </a>
                          <a href={`tel:${content.productOrderPhone}`} className="py-4 bg-slate-800 border border-slate-700 text-white font-black text-[10px] rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest">
                             <Phone className="w-4 h-4 text-emerald-400" /> Appeler
                          </a>
                       </div>
                    </div>
                 </div>

                 {/* SPECS & CHARACTERISTICS */}
                 {content.productCharacteristics && (
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                       <SectionHeader title="Fiche Technique" icon={List} colorClass="text-blue-500" />
                       <p className="text-xs text-slate-400 leading-relaxed font-medium whitespace-pre-line">{content.productCharacteristics}</p>
                       <div className="grid grid-cols-2 gap-4 pt-2">
                          <InfoRow label="Référence" value={content.productSku || content.productReference} />
                          <InfoRow label="Dimensions" value={content.productDimensions} />
                          <InfoRow label="Poids" value={content.productWeight} />
                          <InfoRow label="Matière" value={content.productMaterial} />
                       </div>
                    </div>
                 )}

                 {/* LOGISTICS & GUARANTEE */}
                 <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                    <SectionHeader title="Logistique & Garantie" icon={Truck} colorClass="text-amber-500" />
                    <InfoRow label="Frais de livraison" value={content.productDeliveryFees || content.productDeliveryInfo} icon={Truck} />
                    <InfoRow label="Garantie" value={content.productGuarantee} icon={Award} />
                    {content.productConditions && (
                       <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                          <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Conditions de vente</span>
                          <p className="text-[10px] text-slate-500 font-medium italic">{content.productConditions}</p>
                       </div>
                    )}
                 </div>
              </div>
            )}

            {/* --- SUBTYPE: MENU --- */}
            {sheetType === 'MENU' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                 {/* RESTAURANT HEADER */}
                 <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                    <div className="w-24 h-24 rounded-[32px] bg-white p-2 mx-auto shadow-2xl border-4 border-slate-800 overflow-hidden">
                       {content.menuRestaurantLogoUrl ? <img src={content.menuRestaurantLogoUrl} className="w-full h-full object-contain" /> : <Store className="w-10 h-10 text-slate-200 mt-4" />}
                    </div>
                    <div className="space-y-1">
                       <h1 className="text-2xl font-black text-white uppercase tracking-tight">{content.menuRestaurantName || item.title}</h1>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{content.menuRestaurantAddress}</p>
                       <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">{content.menuRestaurantHours}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <a href={`https://wa.me/${(content.menuRestaurantWhatsapp || '').replace(/[^\d]/g,'')}`} className="py-3 bg-emerald-600 text-white font-black text-[10px] rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg">
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                       </a>
                       <a href={`tel:${content.menuRestaurantPhone}`} className="py-3 bg-slate-800 text-white font-black text-[10px] rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest border border-slate-700">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" /> Appeler
                       </a>
                    </div>
                 </div>

                 {/* MENU ITEMS CATEGORIZED */}
                 {['Entrées', 'Plats', 'Grillades', 'Desserts', 'Boissons', 'Menus', 'Promotions', 'Autres'].map(cat => {
                    const items = content.menuItems?.filter(i => i.category === cat);
                    if (!items || items.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-4">
                         <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-3">
                            <span className="w-8 h-px bg-emerald-500/30" /> {cat}
                         </h2>
                         <div className="space-y-4">
                            {items.map(i => (
                              <div key={i.id} className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-4 flex gap-4 hover:border-emerald-500/30 transition-colors shadow-lg">
                                 {i.photoUrl && <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-800"><img src={i.photoUrl} className="w-full h-full object-cover" /></div>}
                                 <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                       <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight">{i.name}</h3>
                                       <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">{i.price}</span>
                                    </div>
                                    {i.description && <p className="text-[10px] text-slate-500 font-medium leading-tight">{i.description}</p>}
                                    {(i.allergens?.length || 0) > 0 && (
                                       <div className="flex flex-wrap gap-1.5 pt-1">
                                          <ShieldAlert className="w-2.5 h-2.5 text-rose-500" />
                                          {i.allergens!.map(a => <span key={a} className="text-[7px] font-black uppercase text-rose-500/70">{a}</span>)}
                                       </div>
                                    )}
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    );
                 })}
              </div>
            )}

            {/* --- SUBTYPE: SERVICE --- */}
            {sheetType === 'SERVICE' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                 {/* HERO / SERVICE DISPLAY */}
                 <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative">
                    {content.productMainImageUrl && (
                      <div className="w-full h-64 relative">
                        <img src={content.productMainImageUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                      </div>
                    )}
                    <div className="p-8 text-center space-y-4">
                       <div className="space-y-1">
                          {content.serviceProviderName && <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">{content.serviceProviderName}</span>}
                          <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">{content.serviceName || item.title}</h1>
                          <div className="flex items-center justify-center gap-3 pt-2">
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400">
                                <Clock className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase">{content.serviceDuration || 'Non spécifiée'}</span>
                             </div>
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
                                <DollarSign className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase">{content.servicePrice || 'Sur devis'}</span>
                             </div>
                          </div>
                       </div>

                       {content.serviceDescription && <p className="text-xs font-medium text-slate-400 leading-relaxed">{content.serviceDescription}</p>}

                       {/* MAIN ACTIONS */}
                       <div className="grid grid-cols-2 gap-3 pt-6">
                          <a href={content.bookingLink || '#'} className="col-span-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95">
                             <Calendar className="w-4 h-4" /> Réserver Maintenant
                          </a>
                          <a href={`https://wa.me/${(content.whatsappNumber || '').replace(/[^\d]/g,'')}?text=Bonjour, je souhaite réserver le service : ${content.serviceName}`} className="py-4 bg-emerald-600 text-white font-black text-[10px] rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg">
                             <MessageSquare className="w-4 h-4" /> WhatsApp
                          </a>
                          <a href={`tel:${content.primaryPhone}`} className="py-4 bg-slate-800 border border-slate-700 text-white font-black text-[10px] rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest">
                             <Phone className="w-4 h-4 text-emerald-400" /> Appeler
                          </a>
                       </div>
                    </div>
                 </div>

                 {/* PROVIDER DETAILS */}
                 <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                    <SectionHeader title="À Propos du Prestataire" icon={User} colorClass="text-indigo-500" />
                    <InfoRow label="Prestataire" value={content.serviceProviderName} icon={BadgeCheck} />
                    <InfoRow label="Disponibilité" value={content.serviceAvailability} icon={Clock} />
                 </div>
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
              <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none">{content.linkTitle || ''}</h1>
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
      <div className="w-full max-w-md mx-auto px-6 pt-10 pb-4 flex-1 relative z-10">
        {renderContent()}
      </div>

      <footer className="py-12 text-center relative z-10">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-1 h-px bg-slate-800 rounded-full" />
          <p className="text-[7px] font-bold uppercase tracking-[0.4em] text-slate-800">ID: {item.publicId}</p>
        </div>
      </footer>
    </div>
  );
};
