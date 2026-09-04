export type QRType = 
  | 'vcard'       // Carte de visite numérique / Contact
  | 'book'        // Fiche de livre / Auteur / Éditeur
  | 'invitation'  // Invitation événementielle / Hôte
  | 'shop'        // Commerce / Boutique / Horaires / Services
  | 'location'    // Localisation & Itinéraire GPS / Waze / Maps
  | 'event'       // Événement & Conférence
  | 'product'     // Fiche Produit & Catalogue
  | 'menu'        // Menu Restaurant & Carte
  | 'document'    // Document & Fiche technique
  | 'url'         // Site Web / Lien sécurisé
  | 'text'        // Texte libre / Message
  | 'business'    // Rétrocompatibilité entreprise
  | 'social'      // Rétrocompatibilité réseaux
  | 'image'       // Rétrocompatibilité image
  | 'custom';     // Informations personnalisées structurées

export type QRMode = 'dynamic' | 'static';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type ModuleStyle = 'square' | 'rounded' | 'dots' | 'classy' | 'smooth';
export type EyeStyle = 'square' | 'rounded' | 'circle' | 'leaf';

export type CardBackgroundTheme = 
  | 'white_classic' 
  | 'matte_dark' 
  | 'cream_clean' 
  | 'navy_prestige' 
  | 'emerald_luxe' 
  | 'burgundy_rich'
  | 'slate_minimal'
  | 'custom_solid';

export type CardFormat = '85x55' | '90x50';

export type CardModelId = 
  | 'model_classic'
  | 'model_modern'
  | 'model_minimal'
  | 'model_luxury'
  | 'model_corporate'
  | 'model_creative'
  | 'model_recto_qr'
  | 'model_center_qr';

export type CardStatus = 'active' | 'inactive' | 'archived';

export interface QRStyling {
  fgColor: string;
  bgColor: string;
  transparentBg: boolean;
  moduleStyle: ModuleStyle;
  eyeStyle: EyeStyle;
  eyeColor?: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  size: number;
  logoUrl?: string;
  logoSizeRatio?: number; // 0.15 - 0.28
  logoBackground?: boolean;
  logoBgColor?: string;
  logoBorderRadius?: number;
  topText?: string;
  bottomText?: string;
  bottomTextColor?: string;
  bottomTextBg?: string;
  frameStyle?: 'none' | 'simple-box' | 'banner-bottom' | 'badge-top-bottom';

  // Physical Card Styling Options
  cardBackgroundTheme?: CardBackgroundTheme;
  cardCustomBgColor?: string;
  cardCustomTextColor?: string;
  cardFormat?: CardFormat;
  fontFamily?: string;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
  type?: 'text' | 'link' | 'number' | 'email' | 'phone';
  isPrivate?: boolean;
}

export interface OpeningHourDay {
  day: string; // Lundi, Mardi...
  isOpen: boolean;
  openTime: string; // 08:30
  closeTime: string; // 18:00
  is24h?: boolean;
}

export interface SocialLink {
  id: string;
  platform: 
    | 'whatsapp' 
    | 'facebook' 
    | 'instagram' 
    | 'linkedin' 
    | 'tiktok' 
    | 'twitter' 
    | 'youtube' 
    | 'telegram' 
    | 'snapchat' 
    | 'github' 
    | 'website'
    | 'other';
  url: string;
  label?: string;
  displayOrder: number;
}

export interface QRContent {
  // Identity
  firstName?: string;
  lastName?: string;
  fullName?: string;
  jobTitle?: string;
  company?: string;
  commercialName?: string;
  department?: string;
  industry?: string;
  bio?: string;
  photoUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;

  // Contact
  primaryPhone?: string;
  secondaryPhone?: string;
  whatsappNumber?: string;
  workPhone?: string;
  email?: string;
  workEmail?: string;
  websiteUrl?: string;
  address?: string;
  workAddress?: string;
  commune?: string;
  neighborhood?: string;
  city?: string;
  postalCode?: string;
  country?: string;

  // Location / GPS
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  locationLink?: string; // Lien direct Google Maps / Waze / Apple Plans / Itinéraire

  // Other / Special Information in QR
  otherInformation?: string; // Autres informations personnalisées (disponibilité, notes, etc.)
  emergencyContactNote?: string; // Précision contact en cas de perte
  internalNotes?: string; // Notes privées du concepteur
  freeText?: string; // Texte libre

  // --- LIVRE / BOOK SPECIFIC ---
  bookTitle?: string;
  bookSubtitle?: string;
  bookAuthor?: string;
  bookCoAuthor?: string;
  bookPublisher?: string;
  bookIsbn?: string;
  bookYear?: string;
  bookGenre?: string;
  bookCategory?: string;
  bookSummary?: string;
  bookDescription?: string;
  bookPrice?: string;
  bookPages?: number | string;
  bookLanguage?: string;
  bookCoverUrl?: string;
  bookBuyUrl?: string;
  bookWebsite?: string;

  // --- INVITATION SPECIFIC ---
  invitationEventType?: string;
  invitationTitle?: string;
  invitationHost?: string;
  invitationGuest?: string;
  invitationDate?: string;
  invitationTime?: string;
  invitationEndDate?: string;
  invitationEndTime?: string;
  invitationLocationName?: string;
  invitationAddress?: string;
  invitationMessage?: string;
  invitationPhone?: string;
  invitationWhatsapp?: string;
  invitationImageUrl?: string;
  invitationMapsUrl?: string;
  invitationDescription?: string;
  invitationProgram?: string;
  invitationDressCode?: string;
  invitationSpecialGuest?: string;
  invitationBookingUrl?: string;
  invitationRsvpEnabled?: boolean;
  invitationRsvpDeadline?: string;

  // --- COMMERCE / SHOP SPECIFIC ---
  shopName?: string;
  shopIndustry?: string;
  shopSlogan?: string;
  shopDescription?: string;
  shopOpeningHours?: OpeningHourDay[];
  shopServices?: string[];
  shopProducts?: string[];
  shopWazeUrl?: string;
  shopMapsUrl?: string;

  // --- LOCALISATION / ITINÉRAIRE SPECIFIC ---
  locationPlaceName?: string;
  locationShopName?: string;
  locationAddress?: string;
  locationCity?: string;
  locationCommune?: string;
  locationNeighborhood?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationGoogleMapsUrl?: string;
  locationWazeUrl?: string;
  locationPhone?: string;
  locationWhatsapp?: string;
  locationPhotoUrl?: string;

  // --- MENU SPECIFIC ---
  menuCategories?: Array<{
    category: string;
    items: Array<{ name: string; description?: string; price: string }>;
  }>;

  // Business specific
  slogan?: string;
  operatingZone?: string; // Zone d'intervention
  servicesList?: string[];
  productsList?: string[];
  businessTaxId?: string; // Compte Contribuable / TVA
  businessRegisterNumber?: string; // RCCM / SIREN
  openingHours?: OpeningHourDay[];
  
  // Product / Event / Image specific
  productPrice?: string;
  productCurrency?: string;
  productBadge?: string;
  galleryImages?: string[];
  eventStartDate?: string;
  eventEndDate?: string;
  eventLocationName?: string;
  eventTicketUrl?: string;

  // Social & Custom
  socialLinks: SocialLink[];
  customFields: CustomField[];

  // Privacy rules (masqué / privé / public)
  privacy: {
    hideAddress?: boolean;
    hideSecondaryPhone?: boolean;
    hideTaxInfo?: boolean;
    requirePassword?: boolean;
    accessPassword?: string;
  };
}

export interface ClientProfile {
  id: string;
  userId?: string; // UID of the creator
  clientNumber: string; // e.g. CLT-2026-001
  firstName: string;
  lastName: string;
  fullName: string;
  company: string;
  commercialName?: string;
  jobTitle: string;
  industry?: string;
  photoUrl?: string;
  logoUrl?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  whatsappNumber?: string;
  workPhone?: string;
  email: string;
  workEmail?: string;
  websiteUrl?: string;
  address?: string;
  commune?: string;
  neighborhood?: string;
  city: string;
  country: string;
  locationLink?: string;
  slogan?: string;
  bio?: string;
  operatingZone?: string;
  openingHours?: OpeningHourDay[];
  servicesList?: string[];
  productsList?: string[];
  businessTaxId?: string;
  businessRegisterNumber?: string;
  socialLinks: SocialLink[];
  internalNotes?: string;
  associatedCardIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScanEvent {
  id: string;
  qrCodeId: string;
  publicId?: string;
  timestamp: string; // ISO string
  deviceType: 'mobile' | 'desktop' | 'tablet';
  os: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Other';
  browser: 'Safari' | 'Chrome' | 'Firefox' | 'Edge' | 'Samsung Internet' | 'Other';
  country?: string;
  city?: string;
  referrer?: string;
}

export interface HistoryLogItem {
  id: string;
  timestamp: string;
  action: 'create_client' | 'update_client' | 'delete_client' | 'create_card' | 'update_card' | 'duplicate_card' | 'delete_card' | 'status_change' | 'print_card' | 'export_backup' | 'restore_backup';
  title: string;
  details?: string;
  clientId?: string;
  cardId?: string;
}

export interface QRCodeItem {
  id: string;
  userId?: string; // UID of the creator
  cardNumber?: string; // e.g. CARD-2026-0001
  publicId: string; // e.g. "AGB2026X"
  clientId?: string;
  title: string;
  type: QRType;
  mode: QRMode;
  status: CardStatus;
  modelId?: CardModelId;
  cardFormat?: CardFormat;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  scanCount: number;
  lastScannedAt?: string;
  
  content: QRContent;
  styling: QRStyling;
  tags?: string[];
}

export interface DesignerProfile {
  name: string;
  agencyName: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  slogan: string;
  defaultFormat: CardFormat;
}

export interface ScannabilityResult {
  score: number; // 0 - 100
  isReadable: boolean;
  statusText: string;
  contrastRatio: number;
  logoCoverageRatio: number;
  warnings: string[];
  recommendations: string[];
}
