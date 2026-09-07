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
  Landmark
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
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center space-y-6 shadow-2xl">
              <div className="mx-auto w-44 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-800 relative">
                {content.photoUrl ? <img src={content.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-indigo-500"><BookOpen className="w-12 h-12 mb-3" /><span className="text-[10px] font-black uppercase tracking-widest">Couverture</span></div>}
                {content.bookMediumType === 'audio' && <div className="absolute top-2 right-2 p-2 bg-slate-900/80 rounded-full"><Headphones className="w-4 h-4 text-indigo-400" /></div>}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-white uppercase">{content.bookTitle || ''}</h1>
                {content.bookSubtitle && <p className="text-xs font-bold text-slate-500 uppercase">{content.bookSubtitle}</p>}
                {content.bookAuthor && <p className="text-sm font-bold text-slate-400">Par <span className="text-indigo-400 uppercase">{content.bookAuthor}</span></p>}
                {content.bookIllustrator && <p className="text-[9px] font-bold text-slate-500">Illustré par {content.bookIllustrator}</p>}
                {content.bookPrice && <div className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-black mt-2">{content.bookPrice} {content.bookCurrency || 'FCFA'}</div>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {content.bookBuyUrl && <a href={content.bookBuyUrl} className="col-span-2 py-4 bg-indigo-600 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95"><ShoppingCart className="w-4 h-4" /> Acheter l'ouvrage</a>}
                {content.bookTrailerUrl && <a href={content.bookTrailerUrl} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-2xl text-slate-200"><Video className="w-5 h-5 text-indigo-400" /><span className="text-[8px] font-black uppercase">Trailer</span></a>}
                {content.bookAudioUrl && <a href={content.bookAudioUrl} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-2xl text-slate-200"><Headphones className="w-5 h-5 text-emerald-400" /><span className="text-[8px] font-black uppercase">Audio</span></a>}
              </div>
            </div>
            {(content.bookSummary || content.bookTableOfContents) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6">
                {content.bookSummary && (
                  <div className="space-y-3">
                    <SectionHeader title="Résumé de l'œuvre" icon={FileText} />
                    <p className="text-xs text-slate-300 leading-relaxed font-medium whitespace-pre-line">{content.bookSummary}</p>
                  </div>
                )}
                {content.bookTableOfContents && (
                  <div className="space-y-3">
                    <SectionHeader title="Table des matières" icon={List} />
                    <p className="text-[10px] text-slate-500 font-bold whitespace-pre-line">{content.bookTableOfContents}</p>
                  </div>
                )}
              </div>
            )}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 grid grid-cols-2 gap-3">
              <InfoRow label="ISBN 13" value={content.bookIsbn13} />
              <InfoRow label="Maison d'Édition" value={content.bookPublisher} />
              <InfoRow label="Édition" value={content.bookEditionNumber} />
              <InfoRow label="Langue" value={content.bookLanguage} />
              <InfoRow label="Année" value={content.bookYear} />
              <InfoRow label="Nb. Pages" value={content.bookPages} />
              <InfoRow label="Format" value={content.bookFormat} />
              <InfoRow label="Public" value={content.bookTargetAudience} />
            </div>
          </div>
        );

      case 'EVENT':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-600" />
              <div className="space-y-2 pt-2">
                {content.eventTheme && <span className="px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest rounded-full">{content.eventTheme}</span>}
                {content.eventTitle && <h1 className="text-3xl font-black text-white uppercase tracking-tight pt-2 leading-none">{content.eventTitle}</h1>}
                <p className="text-sm font-bold text-slate-400">{content.eventHost && `Organisé par ${content.eventHost}`}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 rounded-[32px] border border-slate-800 shadow-inner">
                <div className="text-left space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase block">Date & Heure</span>
                  <p className="text-xs font-black text-white">{content.eventStartDate}</p>
                  <p className="text-[10px] font-bold text-rose-500">{content.eventStartTime}</p>
                  {content.eventDoorsOpenTime && <p className="text-[8px] font-black text-slate-600 uppercase">Portes: {content.eventDoorsOpenTime}</p>}
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase block">Lieu</span>
                  <p className="text-xs font-black text-white truncate">{content.eventLocationName}</p>
                  <p className="text-[9px] text-slate-400 font-bold truncate">{content.eventAddress}</p>
                  {content.eventDressCode && <p className="text-[8px] font-black text-rose-500/60 uppercase">{content.eventDressCode}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleAddToCalendar} className="col-span-2 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95"><Calendar className="w-4 h-4" /> Ajouter au Calendrier</button>
                {content.eventBookingUrl && <a href={content.eventBookingUrl} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-2xl text-white font-bold text-[10px]"><ShoppingCart className="w-5 h-5 text-rose-400" /><span>Réserver</span></a>}
                <button onClick={() => { if(content.whatsappNumber || content.primaryPhone) window.open(`https://wa.me/${(content.whatsappNumber || content.primaryPhone!).replace(/[^\d]/g,'')}?text=Confirmation Presence pour ${content.eventTitle}`, '_blank')}} className="flex flex-col items-center gap-2 p-4 bg-emerald-600 rounded-2xl text-white font-bold text-[10px]"><CheckCircle2 className="w-5 h-5" /><span>RSVP WhatsApp</span></button>
              </div>
            </div>

            {(content.eventDescription || content.eventSponsor || content.eventGodmother) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Détails & Protocole" icon={Info} colorClass="text-rose-500" />
                {content.eventDescription && <p className="text-xs text-slate-300 leading-relaxed font-medium">{content.eventDescription}</p>}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {content.eventSponsor && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[8px] font-black text-slate-500 uppercase block">Parrain</span>
                      <span className="text-[10px] font-bold text-white">{content.eventSponsor}</span>
                    </div>
                  )}
                  {content.eventGodmother && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[8px] font-black text-slate-500 uppercase block">Marraine</span>
                      <span className="text-[10px] font-bold text-white">{content.eventGodmother}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'SHOP':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
               <div className="w-24 h-24 rounded-3xl bg-white p-2 mx-auto shadow-xl flex items-center justify-center overflow-hidden">
                 {registeredLogo && <img src={registeredLogo} className="w-full h-full object-contain" />}
               </div>
               <div className="space-y-2">
                 <h1 className="text-2xl font-black text-white uppercase leading-none tracking-tight">{content.commercialName || content.company || ''}</h1>
                 {content.shopIndustry && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase rounded-full">{content.shopIndustry}</span>}
               </div>
               <div className="grid grid-cols-4 gap-3">
                 <a href={`tel:${content.primaryPhone}`} className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl text-slate-200 hover:bg-slate-700 transition-colors"><Phone className="w-5 h-5 text-emerald-400" /><span className="text-[7px] font-black uppercase">Appel</span></a>
                 <a href={`https://wa.me/${(content.whatsappNumber || content.primaryPhone || '').replace(/[^\d]/g,'')}`} className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl text-slate-200 hover:bg-slate-700 transition-colors"><MessageSquare className="w-5 h-5 text-emerald-400" /><span className="text-[7px] font-black uppercase">WhatsApp</span></a>
                 <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.address || '')}`} className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl text-slate-200 hover:bg-slate-700 transition-colors"><Navigation className="w-5 h-5 text-blue-400" /><span className="text-[7px] font-black uppercase">GPS</span></a>
                 <a href={content.websiteUrl} className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-2xl text-slate-200 hover:bg-slate-700 transition-colors"><Globe className="w-5 h-5 text-indigo-400" /><span className="text-[7px] font-black uppercase">Web</span></a>
               </div>
            </div>

            {(content.shopDeliveryAvailable || content.shopPaymentMethods) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-4">
                <SectionHeader title="Services & Paiements" icon={ShoppingCart} colorClass="text-emerald-500" />
                {content.shopDeliveryAvailable && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                    <Truck className="w-5 h-5 text-emerald-500" />
                    <div className="flex-1">
                      <span className="text-[10px] font-black uppercase text-emerald-500 block">Livraison à domicile</span>
                      <p className="text-[9px] font-bold text-slate-400">Zone: {content.shopDeliveryZone || 'Locale'} | Min: {content.shopMinOrderAmount || 'Aucun'}</p>
                    </div>
                  </div>
                )}
                {content.shopPaymentMethods && content.shopPaymentMethods.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[8px] font-black uppercase text-slate-600 block tracking-widest">Modes de paiement</span>
                    <div className="flex flex-wrap gap-2">
                      {content.shopPaymentMethods.map(p => <span key={p} className="px-2 py-1 bg-slate-800 text-[8px] font-black text-slate-400 uppercase rounded border border-slate-700">{p}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {content.openingHours && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6">
                <SectionHeader title="Horaires d'ouverture" icon={Clock} colorClass="text-slate-500" />
                <div className="space-y-2">
                  {content.openingHours.map(d => (
                    <div key={d.day} className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500">{d.day}</span>
                      <span className={d.isOpen ? "text-white" : "text-rose-500/70"}>{d.isOpen ? `${d.openTime} - ${d.closeTime}` : 'Fermé'}</span>
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
                {content.locationPlaceName && <h1 className="text-2xl font-black text-white uppercase">{content.locationPlaceName}</h1>}
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
                 {registeredLogo && <img src={registeredLogo} className="w-full h-full object-contain" />}
               </div>
               <div className="space-y-2">
                 <h1 className="text-2xl font-black text-white uppercase tracking-tight">{content.company || fullName}</h1>
                 {content.companyLegalForm && <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{content.companyLegalForm}</p>}
                 {content.slogan && <p className="text-xs font-bold text-slate-400 italic mt-2">« {content.slogan} »</p>}
               </div>
               <div className="grid grid-cols-2 gap-3">
                 {content.primaryPhone && <a href={`tel:${content.primaryPhone}`} className="py-3 bg-slate-800 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"><Phone className="w-4 h-4 text-emerald-400" /> Appeler</a>}
                 {content.websiteUrl && <a href={content.websiteUrl} className="py-3 bg-slate-800 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"><Globe className="w-4 h-4 text-indigo-400" /> Visiter</a>}
               </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-6 shadow-xl">
              <SectionHeader title="Profil Institutionnel" icon={Building2} />
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="RCCM" value={content.companyRccm} />
                <InfoRow label="ID Fiscal / IFU" value={content.companyTaxId} />
                <InfoRow label="Dirigeant / Gérant" value={content.companyManagerName} icon={User} />
                {content.companyManagerPhone && <InfoRow label="Tél. Direct" value={content.companyManagerPhone} icon={Phone} href={`tel:${content.companyManagerPhone}`} />}
                <InfoRow label="Activité Principale" value={content.companyMainActivity} icon={Activity} />
                <InfoRow label="Capital Social" value={content.companyCapital} icon={Landmark} />
              </div>
              <div className="space-y-4 pt-2">
                {content.companyMission && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-[8px] font-black uppercase text-slate-500 block mb-1 tracking-widest">Mission</span>
                    <p className="text-xs font-bold text-slate-300 leading-relaxed">{content.companyMission}</p>
                  </div>
                )}
                {content.companyVision && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-[8px] font-black uppercase text-slate-500 block mb-1 tracking-widest">Vision</span>
                    <p className="text-xs font-bold text-indigo-300 leading-relaxed">{content.companyVision}</p>
                  </div>
                )}
              </div>
            </div>

            {(content.companyPresentationPdfUrl || content.companyCatalogueUrl || content.companyPortfolioUrl) && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-3">
                <SectionHeader title="Ressources & Médias" icon={FileText} />
                {content.companyPresentationPdfUrl && <InfoRow label="Plaquette Institutionnelle" value="Consulter le PDF" icon={FileCheck2} href={content.companyPresentationPdfUrl} />}
                {content.companyCatalogueUrl && <InfoRow label="Catalogue Produits" value="Voir le catalogue" icon={ShoppingCart} href={content.companyCatalogueUrl} />}
                {content.companyPortfolioUrl && <InfoRow label="Portfolio / Réalisations" value="Découvrir" icon={Layers} href={content.companyPortfolioUrl} />}
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
                  {content.productPricePromo && <div className="absolute top-6 right-6 px-4 py-1.5 bg-rose-600 text-white text-[10px] font-black uppercase rounded-full shadow-2xl animate-pulse">OFFRE SPÉCIALE</div>}
                </div>
              )}
              <div className="p-8 text-center space-y-4">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight leading-none">{content.productName || item.title}</h1>
                <div className="flex flex-col items-center gap-1">
                  {content.productBrand && <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{content.productBrand}</p>}
                  {content.productModel && <p className="text-[9px] font-bold text-slate-600 uppercase">{content.productModel} {content.productSku ? `• ${content.productSku}` : ''}</p>}
                </div>

                {sheetType === 'PRODUCT' && (content.productPriceNormal || content.productPricePromo) && (
                  <div className="py-2">
                    <span className="text-4xl font-black text-emerald-400 tracking-tighter">{content.productPricePromo || content.productPriceNormal} <span className="text-sm font-bold opacity-70 ml-1">{content.productCurrency || 'FCFA'}</span></span>
                    {content.productPricePromo && <p className="text-xs text-slate-500 line-through font-bold mt-1">{content.productPriceNormal} {content.productCurrency}</p>}
                  </div>
                )}
                {content.productDescriptionShort && <p className="text-xs font-medium text-slate-400 italic">« {content.productDescriptionShort} »</p>}

                <div className="grid grid-cols-2 gap-3 pt-4">
                  {(content.productOrderPhone || content.whatsappNumber || content.primaryPhone) && <a href={`https://wa.me/${(content.productOrderPhone || content.whatsappNumber || content.primaryPhone!).replace(/[^\d]/g,'')}`} className="py-4 bg-emerald-600 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95"><MessageSquare className="w-4 h-4" /> Commander</a>}
                  {content.productBuyUrl && <a href={content.productBuyUrl} className="py-4 bg-blue-600 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-95"><ShoppingCart className="w-4 h-4" /> Acheter</a>}
                </div>
              </div>
            </div>

            {sheetType === 'PRODUCT' && content.productCharacteristics && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[32px] p-6 space-y-3">
                <SectionHeader title="Fiche Technique" icon={List} />
                <p className="text-[10px] text-slate-400 leading-relaxed font-bold whitespace-pre-line">{content.productCharacteristics}</p>
              </div>
            )}

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

            {sheetType === 'SERVICE' && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-[40px] p-8 space-y-6 shadow-2xl">
                 <SectionHeader title="Détails du Service" icon={Activity} colorClass="text-blue-500" />
                 <div className="space-y-2">
                   <h2 className="text-xl font-black text-white uppercase">{content.serviceName || content.productName}</h2>
                   <div className="flex items-center gap-4">
                     <span className="text-2xl font-black text-blue-500">{content.servicePrice || content.productPriceNormal} <span className="text-[10px] opacity-60">{content.productCurrency || 'FCFA'}</span></span>
                     {content.serviceDuration && <span className="px-2 py-1 bg-slate-800 text-[8px] font-black text-slate-400 uppercase rounded">{content.serviceDuration}</span>}
                   </div>
                 </div>
                 {content.serviceDescription && <p className="text-xs text-slate-400 leading-relaxed font-medium">{content.serviceDescription}</p>}
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
