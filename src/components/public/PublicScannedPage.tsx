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
  Clock
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

    // 1. Direct Payload Extraction from URL
    if (typeof window !== 'undefined') {
      const fullUrl = window.location.href;
      const matchPayload = fullUrl.match(/[?&](?:d|data)=([a-zA-Z0-9%_-]+)/);
      if (matchPayload && matchPayload[1]) {
        const decoded = decodeCardPayload(matchPayload[1]);
        if (decoded) {
          setItem(decoded);
          setLoading(false);
          if (!isSimulator) {
            recordScanEvent(decoded.publicId || publicId || 'direct_payload');
          }
          return;
        }
      }
    }

    if (publicId) {
      setLoading(true);
      setError(null);
      
      fetchQRCodeByPublicId(publicId)
        .then(found => {
          if (found) {
            setItem(found);
            if (!isSimulator) {
              recordScanEvent(publicId);
            }
          } else {
            setError("Cette fiche de contact est introuvable ou le QR Code n'est plus actif.");
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching card:', err);
          setError("Impossible de charger la fiche. Veuillez vérifier votre connexion.");
          setLoading(false);
        });
    }
  }, [publicId, propQrItem, isSimulator]);

  const handleDownloadContact = () => {
    if (!item) return;
    try {
      downloadVCard(item.content);
      setSavedContact(true);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch (e) {}
      setTimeout(() => setSavedContact(false), 4000);
    } catch (e) {
      console.error('Error downloading vCard:', e);
    }
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

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-200">Ouverture de la fiche connectée...</h3>
            <p className="text-xs text-slate-400">Chargement des coordonnées officielles</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error / Not Found State (Polite, no SaaS links)
  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 bg-slate-800 border border-slate-700 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">Fiche de contact introuvable</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || "Ce QR Code n'est pas encore associé à une fiche active ou a été archivé."}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Deactivated / Suspended State
  if (item.status === 'inactive' || item.status === 'archived') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">Fiche Temporairement Suspendue</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cette carte de visite connectée est temporairement mise en pause par son titulaire. Veuillez réessayer ultérieurement ou le contacter directement.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Live Client Dynamic Resolution: If linked to a client profile, merge the latest live client data (STRICT ID MATCH ONLY)
  const linkedClient = item.clientId ? getClientById(item.clientId) : null;

  const content: QRContent = linkedClient ? {
    ...item.content,
    firstName: linkedClient.firstName || item.content.firstName,
    lastName: linkedClient.lastName || item.content.lastName,
    fullName: linkedClient.fullName || item.content.fullName,
    company: linkedClient.company || item.content.company,
    commercialName: linkedClient.commercialName || item.content.commercialName,
    jobTitle: linkedClient.jobTitle || item.content.jobTitle,
    industry: linkedClient.industry || item.content.industry,
    photoUrl: linkedClient.photoUrl !== undefined ? linkedClient.photoUrl : item.content.photoUrl,
    logoUrl: (linkedClient.logoUrl && !linkedClient.logoUrl.includes('unsplash.com')) ? linkedClient.logoUrl : item.content.logoUrl,
    primaryPhone: linkedClient.primaryPhone || item.content.primaryPhone,
    secondaryPhone: linkedClient.secondaryPhone !== undefined ? linkedClient.secondaryPhone : item.content.secondaryPhone,
    whatsappNumber: linkedClient.whatsappNumber !== undefined ? linkedClient.whatsappNumber : item.content.whatsappNumber,
    workPhone: linkedClient.workPhone !== undefined ? linkedClient.workPhone : item.content.workPhone,
    email: linkedClient.email || item.content.email,
    workEmail: linkedClient.workEmail !== undefined ? linkedClient.workEmail : item.content.workEmail,
    websiteUrl: linkedClient.websiteUrl !== undefined ? linkedClient.websiteUrl : item.content.websiteUrl,
    address: linkedClient.address || item.content.address,
    commune: linkedClient.commune !== undefined ? linkedClient.commune : item.content.commune,
    city: linkedClient.city || item.content.city,
    country: linkedClient.country || item.content.country,
    locationLink: linkedClient.locationLink !== undefined ? linkedClient.locationLink : item.content.locationLink,
    slogan: linkedClient.slogan !== undefined ? linkedClient.slogan : item.content.slogan,
    bio: linkedClient.bio !== undefined ? linkedClient.bio : item.content.bio,
    servicesList: linkedClient.servicesList && linkedClient.servicesList.length > 0 ? linkedClient.servicesList : item.content.servicesList,
    productsList: linkedClient.productsList && linkedClient.productsList.length > 0 ? linkedClient.productsList : item.content.productsList,
    socialLinks: linkedClient.socialLinks && linkedClient.socialLinks.length > 0 ? linkedClient.socialLinks : item.content.socialLinks
  } : item.content;

  const { styling } = item;
  const fullName = content.fullName || `${content.firstName || ''} ${content.lastName || ''}`.trim() || 'Fiche Professionnelle';

  // Strict verified registered logo with company vector logo fallback
  const registeredLogo = (content.logoUrl && !content.logoUrl.includes('unsplash.com'))
    ? content.logoUrl
    : (styling?.logoUrl && !styling.logoUrl.includes('unsplash.com'))
    ? styling.logoUrl
    : getCompanyDefaultLogo(content.company || content.commercialName || fullName);

  // Clean company monogram initials
  const getCompanyInitials = (comp?: string, name?: string) => {
    if (comp && comp.trim()) {
      const words = comp.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
      return comp.slice(0, 2).toUpperCase();
    }
    if (name && name.trim()) {
      const words = name.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    return 'AGB';
  };

  // =========================================================================
  // TYPE 1: LIVRE / BOOK PUBLIC VIEW
  // =========================================================================
  if (item.type === 'book') {
    const bookTitle = content.bookTitle || item.title || 'Livre';
    const bookAuthor = content.bookAuthor || fullName;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased selection:bg-indigo-600 selection:text-white">
        <div className="w-full max-w-md mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Fiche Officielle du Livre
            </span>
          </div>
          {isSimulator && onCloseSimulator && (
            <button onClick={onCloseSimulator} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              Fermer le simulateur
            </button>
          )}
        </div>

        <div className="w-full max-w-md mx-auto px-4 py-2 flex-1 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center space-y-4">
            {/* Book Cover */}
            <div className="mx-auto w-40 h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/60 bg-slate-800">
              {content.bookCoverUrl || content.photoUrl ? (
                <img src={content.bookCoverUrl || content.photoUrl} alt={bookTitle} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
                  <BookOpen className="w-10 h-10 text-indigo-400 mb-2" />
                  <p className="text-xs font-bold text-white line-clamp-3">{bookTitle}</p>
                </div>
              )}
            </div>

            {/* Title & Author */}
            <div className="space-y-1">
              <h1 className="text-xl font-black text-white">{bookTitle}</h1>
              {content.bookSubtitle && (
                <p className="text-xs font-medium text-indigo-300">{content.bookSubtitle}</p>
              )}
              <p className="text-sm font-semibold text-slate-300 pt-1">Par <span className="text-white font-bold">{bookAuthor}</span></p>
              {content.bookCoAuthor && (
                <p className="text-xs text-slate-400 italic">Co-auteur(s) : {content.bookCoAuthor}</p>
              )}
              {content.bookPublisher && (
                <p className="text-xs text-slate-400 pt-1">Éditeur : {content.bookPublisher} {content.bookYear ? `(${content.bookYear})` : ''}</p>
              )}
            </div>

            {/* Price & Availability Badge */}
            {(content.bookPrice || content.bookAvailability) && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {content.bookPrice && (
                  <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                    Prix : {content.bookPrice} {content.bookCurrency || 'FCFA'}
                  </div>
                )}
                {content.bookAvailability && (
                  <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${
                    content.bookAvailability === 'available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    content.bookAvailability === 'preorder' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {content.bookAvailability === 'available' ? 'Disponible' :
                     content.bookAvailability === 'preorder' ? 'En précommande' : 'Épuisé'}
                  </div>
                )}
              </div>
            )}

            {/* Main Action: Buy / Order */}
            {content.bookBuyUrl && (
              <div className="w-full pt-1">
                <a
                  href={content.bookBuyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-900/30 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Acheter / Commander le livre</span>
                </a>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 w-full pt-1">
              {(content.bookOrderPhone || content.primaryPhone) && (
                <a href={`tel:${(content.bookOrderPhone || content.primaryPhone!).replace(/\s+/g, '')}`} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-200">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-semibold">Commander</span>
                </a>
              )}
              {(content.bookWhatsapp || content.whatsappNumber) && (
                <a href={`https://wa.me/${(content.bookWhatsapp || content.whatsappNumber!).replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-200">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-semibold">WhatsApp</span>
                </a>
              )}
              {(content.bookWebsite || content.websiteUrl) && (
                <a href={content.bookWebsite || content.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-200">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-semibold">Site Web</span>
                </a>
              )}
            </div>
          </div>

          {/* Book Summary & Technical details */}
          {(content.bookSummary || content.bookDescription) && (
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-xl">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Résumé & Présentation</h2>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {content.bookSummary || content.bookDescription}
              </p>
            </div>
          )}

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 space-y-2.5 shadow-xl text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Informations Techniques</h2>
            {content.bookIsbn && <p><span className="text-slate-400">ISBN :</span> <span className="font-mono text-slate-200 font-semibold">{content.bookIsbn}</span></p>}
            {content.bookPages && <p><span className="text-slate-400">Pagination :</span> <span className="text-slate-200 font-semibold">{content.bookPages}</span></p>}
            {content.bookGenre && <p><span className="text-slate-400">Genre :</span> <span className="text-slate-200 font-semibold">{content.bookGenre}</span></p>}
            {content.bookLanguage && <p><span className="text-slate-400">Langue :</span> <span className="text-slate-200 font-semibold">{content.bookLanguage}</span></p>}
          </div>

          {content.otherInformation && (
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-xl">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Autres informations</h2>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {content.otherInformation}
              </p>
            </div>
          )}
        </div>

        <footer className="w-full max-w-md mx-auto py-6 px-4 text-center space-y-1">
          <p className="text-[10px] font-medium text-slate-500">Fiche de Livre Publique • AGB QR Code Designer</p>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // TYPE 2: INVITATION ÉVÉNEMENTIELLE PUBLIC VIEW
  // =========================================================================
  if (item.type === 'invitation') {
    const invTitle = content.invitationTitle || item.title || 'Invitation Officielle';

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased selection:bg-amber-600 selection:text-white">
        <div className="w-full max-w-md mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Invitation Officielle
            </span>
          </div>
          {isSimulator && onCloseSimulator && (
            <button onClick={onCloseSimulator} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              Fermer
            </button>
          )}
        </div>

        <div className="w-full max-w-md mx-auto px-4 py-2 flex-1 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center space-y-4">
            {content.invitationImageUrl && (
              <div className="w-full h-44 rounded-2xl overflow-hidden shadow-lg border border-slate-700">
                <img src={content.invitationImageUrl} alt="Invitation" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {content.invitationEventType || 'Événement & Gala'}
              </span>
              <h1 className="text-xl font-black text-white pt-2">{invTitle}</h1>
              {content.invitationHost && (
                <p className="text-xs text-slate-300">À l'initiative de <span className="font-bold text-white">{content.invitationHost}</span></p>
              )}
              {content.invitationGuest && (
                <p className="text-xs text-amber-400 font-semibold">Invité : {content.invitationGuest}</p>
              )}
            </div>

            {/* Date & Time Box */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 text-left">
              <div>
                <span className="text-[10px] font-medium text-slate-400 block">Date</span>
                <span className="text-xs font-bold text-white">{content.invitationDate || 'Date à confirmer'}</span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-slate-400 block">Heure</span>
                <span className="text-xs font-bold text-white">{content.invitationTime || '18h30'}</span>
              </div>
            </div>

            {/* Location & Itinerary */}
            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 text-left space-y-2">
              <div>
                <span className="text-[10px] font-medium text-slate-400 block">Lieu & Adresse</span>
                <p className="text-xs font-bold text-white">{content.invitationLocationName || 'Lieu d\'exception'}</p>
                {content.invitationAddress && <p className="text-[11px] text-slate-300">{content.invitationAddress}</p>}
              </div>

              {(content.invitationMapsUrl || content.locationLink || content.invitationAddress) && (
                <a
                  href={content.invitationMapsUrl || content.locationLink || `https://maps.google.com/?q=${encodeURIComponent(content.invitationAddress || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Voir l'Itinéraire (Google Maps)</span>
                </a>
              )}
            </div>

            {/* Personalized message */}
            {content.invitationMessage && (
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/30 text-xs text-slate-300 italic leading-relaxed">
                « {content.invitationMessage} »
              </div>
            )}

            {/* RSVP buttons */}
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              {content.invitationWhatsapp && (
                <a
                  href={`https://wa.me/${content.invitationWhatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Bonjour, je confirme ma présence à l'événement ${invTitle}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Confirmer RSVP</span>
                </a>
              )}
              {content.invitationPhone && (
                <a
                  href={`tel:${content.invitationPhone.replace(/\s+/g, '')}`}
                  className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold border border-slate-700"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Appeler l'Hôte</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <footer className="w-full max-w-md mx-auto py-6 px-4 text-center space-y-1">
          <p className="text-[10px] font-medium text-slate-500">Invitation Numérique Certifiée • AGB Studio</p>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // TYPE 3: COMMERCE & BOUTIQUE PUBLIC VIEW
  // =========================================================================
  if (item.type === 'shop' || item.type === 'business') {
    const shopName = content.shopName || content.company || item.title || 'Commerce';

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased selection:bg-emerald-600 selection:text-white">
        <div className="w-full max-w-md mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Fiche Commerce & Horaires
            </span>
          </div>
          {isSimulator && onCloseSimulator && (
            <button onClick={onCloseSimulator} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              Fermer
            </button>
          )}
        </div>

        <div className="w-full max-w-md mx-auto px-4 py-2 flex-1 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center space-y-4">
            {content.photoUrl && (
              <div className="w-full h-44 rounded-2xl overflow-hidden shadow-lg border border-slate-700">
                <img src={content.photoUrl} alt={shopName} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-white">{shopName}</h1>
              {content.shopDescription && (
                <p className="text-xs text-slate-300 leading-relaxed">{content.shopDescription}</p>
              )}
              {content.address && (
                <p className="text-xs text-slate-400 flex items-center justify-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{[content.address, content.commune, content.city].filter(Boolean).join(', ')}</span>
                </p>
              )}
            </div>

            {/* Quick Actions: Maps & Call */}
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              {(content.shopMapsUrl || content.locationLink || content.address) && (
                <a
                  href={content.shopMapsUrl || content.locationLink || `https://maps.google.com/?q=${encodeURIComponent(content.address || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-lg"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Itinéraire GPS</span>
                </a>
              )}
              {content.whatsappNumber && (
                <a
                  href={`https://wa.me/${content.whatsappNumber.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold border border-slate-700"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Horaires d'ouverture */}
          {content.shopOpeningHours && content.shopOpeningHours.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-xl">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Horaires d'Ouverture</span>
              </h2>

              <div className="space-y-1.5 text-xs">
                {content.shopOpeningHours.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <span className="font-semibold text-slate-300">{h.day}</span>
                    <span className={h.isOpen ? 'text-emerald-400 font-bold' : 'text-slate-500 font-medium'}>
                      {h.isOpen ? `${h.openTime} - ${h.closeTime}` : 'Fermé'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services & Produits */}
          {content.shopServices && content.shopServices.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-xl">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Services & Prestations</h2>
              <div className="space-y-1.5">
                {content.shopServices.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 text-xs text-slate-200">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="w-full max-w-md mx-auto py-6 px-4 text-center space-y-1">
          <p className="text-[10px] font-medium text-slate-500">Fiche de Commerce Connectée • AGB Studio</p>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // TYPE 4: LOCALISATION / ITINÉRAIRE PUBLIC VIEW
  // =========================================================================
  if (item.type === 'location') {
    const locName = content.locationPlaceName || content.locationShopName || item.title || 'Localisation';

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white">
        <div className="w-full max-w-md mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Itinéraire & GPS
            </span>
          </div>
          {isSimulator && onCloseSimulator && (
            <button onClick={onCloseSimulator} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              Fermer
            </button>
          )}
        </div>

        <div className="w-full max-w-md mx-auto px-4 py-2 flex-1 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-black text-white">{locName}</h1>
              {content.locationAddress && (
                <p className="text-xs text-slate-300 font-medium">{content.locationAddress}</p>
              )}
              <p className="text-[11px] text-slate-400">
                {[content.locationCommune, content.locationCity].filter(Boolean).join(', ')}
              </p>
            </div>

            {/* Direct Navigation Buttons: Google Maps & Waze */}
            <div className="space-y-2 pt-2">
              <a
                href={content.locationGoogleMapsUrl || `https://maps.google.com/?q=${content.locationLatitude || 5.3599},${content.locationLongitude || -3.9870}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Ouvrir dans Google Maps</span>
              </a>

              {content.locationWazeUrl && (
                <a
                  href={content.locationWazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-2xl border border-slate-700 transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Ouvrir dans Waze</span>
                </a>
              )}
            </div>

            {/* Call / WhatsApp contact */}
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              {content.locationPhone && (
                <a href={`tel:${content.locationPhone.replace(/\s+/g, '')}`} className="flex items-center justify-center gap-2 p-3 bg-slate-800 text-slate-200 rounded-2xl text-xs font-semibold border border-slate-700">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Appeler</span>
                </a>
              )}
              {content.locationWhatsapp && (
                <a href={`https://wa.me/${content.locationWhatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 bg-slate-800 text-slate-200 rounded-2xl text-xs font-semibold border border-slate-700">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <footer className="w-full max-w-md mx-auto py-6 px-4 text-center space-y-1">
          <p className="text-[10px] font-medium text-slate-500">Localisation & Itinéraire Connecté • AGB Studio</p>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // TYPE 5: VCARD STANDARD VIEW
  // =========================================================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Mobile Top Header */}
      <div className="w-full max-w-md mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            Fiche Certifiée Directe
          </span>
        </div>

        {isSimulator && onCloseSimulator && (
          <button
            onClick={onCloseSimulator}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-slate-700"
          >
            Fermer le simulateur
          </button>
        )}
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md mx-auto px-4 py-2 flex-1 space-y-4">

        {/* Profile Card Header */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Ambient Background Accent */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            
            {/* Company Logo / Emblem */}
            <div className="relative">
              {registeredLogo ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-white p-2.5 flex items-center justify-center">
                  <img
                    src={registeredLogo}
                    alt={content.company || fullName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 border-2 border-slate-700/80 flex items-center justify-center text-white text-2xl font-black shadow-xl tracking-wider select-none">
                  {getCompanyInitials(content.company, fullName)}
                </div>
              )}
            </div>

            {/* Name & Job Title */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {fullName}
              </h1>
              {content.jobTitle && (
                <p className="text-sm font-semibold text-blue-400 leading-snug">
                  {content.jobTitle}
                </p>
              )}
              {content.company && (
                <p className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5 pt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{content.company}</span>
                  {content.commercialName && content.commercialName !== content.company && (
                    <span className="text-slate-400">({content.commercialName})</span>
                  )}
                </p>
              )}
            </div>

            {/* Slogan & Bio */}
            {content.slogan && (
              <p className="text-xs italic text-slate-300 bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-700/50 leading-relaxed">
                « {content.slogan} »
              </p>
            )}

            {content.bio && (
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                {content.bio}
              </p>
            )}

            {/* Primary Action Button: Save to Phone Contacts */}
            <div className="w-full pt-2">
              <button
                onClick={handleDownloadContact}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
              >
                {savedContact ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-300" />
                    <span>Contact Enregistré !</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Enregistrer dans mes contacts</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick 1-Click Action Buttons Row */}
            <div className="grid grid-cols-4 gap-2.5 w-full pt-1">
              {content.primaryPhone && (
                <a
                  href={`tel:${content.primaryPhone.replace(/\s+/g, '')}`}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-colors"
                >
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-semibold">Appeler</span>
                </a>
              )}

              {content.whatsappNumber && (
                <a
                  href={`https://wa.me/${content.whatsappNumber.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-semibold">WhatsApp</span>
                </a>
              )}

              {content.email && (
                <a
                  href={`mailto:${content.email}`}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-colors"
                >
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-[10px] font-semibold">E-mail</span>
                </a>
              )}

              {(content.locationLink || content.address) && (
                <a
                  href={content.locationLink || (content.address ? `https://maps.google.com/?q=${encodeURIComponent(`${content.address} ${content.city || ''} ${content.country || ''}`)}` : '#')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-colors"
                >
                  <Navigation className="w-5 h-5 text-amber-400" />
                  <span className="text-[10px] font-semibold">Itinéraire</span>
                </a>
              )}
            </div>

          </div>
        </div>

        {/* Section: Coordonnées Complètes */}
        {(content.primaryPhone || content.secondaryPhone || content.whatsappNumber || content.email || content.websiteUrl || content.address || content.city) && (
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>Coordonnées Directes</span>
            </h2>

            <div className="space-y-2">

              {/* Téléphone Principal */}
              {content.primaryPhone && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 block">Téléphone Principal</span>
                      <a href={`tel:${content.primaryPhone.replace(/\s+/g, '')}`} className="text-xs sm:text-sm font-semibold text-white hover:text-blue-400">
                        {content.primaryPhone}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(content.primaryPhone!, 'phone')}
                    className="p-2 text-slate-400 hover:text-white"
                    title="Copier"
                  >
                    {copiedPhone === content.primaryPhone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Téléphone Secondaire */}
              {content.secondaryPhone && !content.privacy?.hideSecondaryPhone && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-700 text-slate-300 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 block">Ligne Secondaire</span>
                      <a href={`tel:${content.secondaryPhone.replace(/\s+/g, '')}`} className="text-xs sm:text-sm font-semibold text-white hover:text-blue-400">
                        {content.secondaryPhone}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(content.secondaryPhone!, 'phone')}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    {copiedPhone === content.secondaryPhone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* WhatsApp */}
              {content.whatsappNumber && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 block">WhatsApp Direct</span>
                      <a
                        href={`https://wa.me/${content.whatsappNumber.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-semibold text-emerald-400 hover:underline"
                      >
                        {content.whatsappNumber}
                      </a>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${content.whatsappNumber.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-emerald-600/20 text-emerald-400 text-xs font-semibold rounded-lg hover:bg-emerald-600/30"
                  >
                    Ouvrir
                  </a>
                </div>
              )}

              {/* Email */}
              {content.email && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/40">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-medium text-slate-400 block">E-mail</span>
                      <a href={`mailto:${content.email}`} className="text-xs sm:text-sm font-semibold text-white hover:text-blue-400 truncate block">
                        {content.email}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(content.email!, 'email')}
                    className="p-2 text-slate-400 hover:text-white shrink-0"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Site Web */}
              {content.websiteUrl && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/40">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-medium text-slate-400 block">Site Internet</span>
                      <a
                        href={content.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-semibold text-blue-400 hover:underline truncate block"
                      >
                        {content.websiteUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                  <a
                    href={content.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-white shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Adresse & Localisation */}
              {(content.address || content.city) && !content.privacy?.hideAddress && (
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/40 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-medium text-slate-400 block">Localisation & Siège</span>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {[content.address, content.commune, content.city, content.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>

                  {content.locationLink && (
                    <a
                      href={content.locationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lancer le GPS / Itinéraire</span>
                    </a>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* Section: Services & Expertises */}
        {content.servicesList && content.servicesList.length > 0 && (
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>Services & Prestations</span>
            </h2>

            <div className="grid grid-cols-1 gap-2">
              {content.servicesList.map((srv, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/30 text-xs font-medium text-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span>{srv}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Horaires d'ouverture & Zone d'intervention */}
        {((content.openingHours && content.openingHours.length > 0) || content.operatingZone) && (
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Horaires & Disponibilités</span>
            </h2>

            {content.operatingZone && (
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-xs text-slate-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Zone d'intervention</span>
                <span className="font-semibold text-white">{content.operatingZone}</span>
              </div>
            )}

            {content.openingHours && content.openingHours.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">Heures d'ouverture</span>
                <div className="grid grid-cols-1 gap-1.5 bg-slate-800/40 p-2.5 rounded-2xl border border-slate-700/30 text-xs">
                  {content.openingHours.map((oh, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 px-1.5 border-b border-slate-800/60 last:border-0">
                      <span className="font-medium text-slate-300">{oh.day}</span>
                      <span className={`text-[11px] font-semibold ${oh.isOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {oh.isOpen ? `${oh.openTime} - ${oh.closeTime}` : 'Fermé'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section: Réseaux Sociaux */}
        {content.socialLinks && content.socialLinks.length > 0 && (
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 space-y-3 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Réseaux Sociaux & Liens</span>
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {content.socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 text-slate-200 text-xs font-semibold capitalize transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="truncate">{social.platform}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Section: Mentions Légales & Registres */}
        {(content.businessRegisterNumber || content.businessTaxId) && !content.privacy?.hideTaxInfo && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 text-[11px] text-slate-400 space-y-1">
            {content.businessRegisterNumber && (
              <p><span className="font-semibold text-slate-300">RCCM :</span> {content.businessRegisterNumber}</p>
            )}
            {content.businessTaxId && (
              <p><span className="font-semibold text-slate-300">Compte Contribuable :</span> {content.businessTaxId}</p>
            )}
          </div>
        )}

      </div>

      {/* Discreet Footer */}
      <footer className="w-full max-w-md mx-auto py-6 px-4 text-center space-y-1.5">
        <p className="text-[10px] font-medium text-slate-500">
          Fiche de contact numérique vCard • Certifiée active & synchronisée
        </p>
        <p className="text-[9px] text-slate-600 flex items-center justify-center gap-1">
          <span>Conçu par <span className="font-semibold text-slate-400">AGB Studio</span></span>
          <span>•</span>
          <a
            href="tel:+2250777709693"
            className="text-blue-400/80 hover:text-blue-400 hover:underline inline-flex items-center gap-0.5"
          >
            <span>+225 07 7 70 96 93</span>
          </a>
        </p>
      </footer>

    </div>
  );
};
