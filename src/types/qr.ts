export type QRType = 
  | 'BUSINESS_CARD'
  | 'BOOK'
  | 'EVENT'
  | 'SHOP'
  | 'LOCATION'
  | 'COMPANY'
  | 'SOCIAL'
  | 'PRODUCT'
  | 'WEB_LINK'
  | 'CUSTOM';

export type ProductSubType = 'PRODUCT' | 'MENU' | 'SERVICE';
export type RedirectMode = 'DIRECT' | 'LANDING_PAGE';

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
    | 'discord'
    | 'threads'
    | 'twitch'
    | 'website'
    | 'other';
  url: string;
  label?: string;
  displayOrder: number;
}

export interface QRContent {
  // --- COMMON / IDENTITY ---
  firstName?: string;
  lastName?: string;
  fullName?: string;
  civility?: string;
  middleName?: string;
  professionalTitle?: string;
  jobTitle?: string;
  profession?: string;
  company?: string;
  commercialName?: string;
  acronym?: string; // Sigle
  acronymDesc?: string; // Signification du sigle
  department?: string;
  industry?: string;
  slogan?: string;
  bio?: string;
  longBio?: string;
  photoUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  photoAvatarUrl?: string; // For SOCIAL

  // --- CONTACT ---
  primaryPhone?: string;
  secondaryPhone?: string;
  workPhone?: string;
  whatsappNumber?: string;
  email?: string;
  workEmail?: string;
  websiteUrl?: string;
  address?: string;
  neighborhood?: string;
  commune?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  landmark?: string; // Point de repère
  locationLink?: string; // Google Maps / Waze
  googleMapsUrl?: string;

  // --- BUSINESS_CARD SPECIFIC ---
  languagesSpoken?: string[];
  availabilityHours?: string;
  servicesOffered?: string[];
  portfolioUrl?: string;
  catalogUrl?: string;
  brochurePdfUrl?: string;
  bookingLink?: string;
  paymentLink?: string;
  publicNotes?: string;
  servicesList?: string[];
  operatingZone?: string;
  businessRegisterNumber?: string;
  businessTaxId?: string;

  // --- BOOK SPECIFIC ---
  bookTitle?: string;
  bookSubtitle?: string;
  bookOriginalTitle?: string;
  bookAuthor?: string;
  bookCoAuthor?: string;
  bookIllustrator?: string;
  bookTranslator?: string;
  bookPrefaceAuthor?: string;
  bookPublisher?: string;
  bookPublisherCollection?: string;
  bookEdition?: string;
  bookEditionNumber?: string;
  bookIsbn10?: string;
  bookIsbn13?: string;
  bookIssn?: string;
  bookYear?: string;
  bookDate?: string;
  bookPlace?: string;
  bookLanguage?: string;
  bookOriginalLanguage?: string;
  bookGenre?: string;
  bookCategory?: string;
  bookSubCategory?: string;
  bookTargetAudience?: string;
  bookReadingLevel?: string;
  bookPages?: number | string;
  bookFormat?: string;
  bookDimensions?: string;
  bookWeight?: string;
  bookCoverType?: string;
  bookMediumType?: 'paper' | 'digital' | 'audio';
  bookSummary?: string;
  bookSynopsis?: string;
  bookLongDescription?: string;
  bookAuthorBio?: string;
  bookTableOfContents?: string;
  bookKeywords?: string[];
  bookThemes?: string[];
  bookExerpt?: string;
  bookPrice?: string;
  bookPromoPrice?: string;
  bookCurrency?: string;
  bookStockStatus?: string;
  bookSalePoints?: string;
  bookBuyUrl?: string;
  bookEbookUrl?: string;
  bookAudioUrl?: string;
  bookDownloadUrl?: string;
  bookExerptUrl?: string;
  bookAuthorWebsite?: string;
  bookTrailerUrl?: string;
  bookPresentationVideoUrl?: string;
  bookInterviewUrl?: string;
  bookPresentationPdfUrl?: string;
  bookGallery?: string[];
  bookOrderPhone?: string;
  bookOrderWhatsapp?: string;
  bookOrderEmail?: string;
  bookOnlineStoreUrl?: string;

  // --- EVENT SPECIFIC ---
  eventTitle?: string;
  eventSubtitle?: string;
  eventType?: string;
  eventTheme?: string;
  eventSlogan?: string;
  eventDescription?: string;
  eventHost?: string;
  eventCoHost?: string;
  eventSponsor?: string; // Parrain
  eventGodmother?: string; // Marraine
  eventGuestOfHonor?: string;
  eventSpecialGuests?: string[];
  eventPerformers?: string[];
  eventPosterUrl?: string;

  eventStartDate?: string;
  eventStartTime?: string;
  eventEndDate?: string;
  eventEndTime?: string;
  eventTimezone?: string;
  eventDoorsOpenTime?: string;

  eventLocationName?: string;
  eventAddress?: string;
  eventCommune?: string;
  eventNeighborhood?: string;
  eventCity?: string;
  eventCountry?: string;
  eventLandmark?: string;
  eventLatitude?: number;
  eventLongitude?: number;
  eventAccessInstructions?: string;

  eventProgram?: string;
  eventActivities?: string;
  eventSpeakers?: string;
  eventSessions?: string;
  eventProgramPdfUrl?: string;

  eventInvitationNumber?: string;
  eventTable?: string;
  eventSeat?: string;
  eventZone?: string;
  eventGuestCategory?: string; // VIP/Standard
  eventGuestPax?: number | string;
  eventGuestInstructions?: string;

  eventDressCode?: string;
  eventRsvpEnabled?: boolean;
  eventRsvpDeadline?: string;
  eventMaxCapacity?: number | string;
  eventTicketPrice?: string;
  eventIsPaid?: boolean;
  eventBookingUrl?: string;
  eventTicketUrl?: string;
  eventPhone?: string;
  eventWhatsApp?: string;
  eventEmail?: string;

  // Backward compatibility or alternate names for Event
  invitationTitle?: string;
  invitationDate?: string;
  invitationTime?: string;
  invitationLocationName?: string;
  invitationAddress?: string;

  // --- SHOP SPECIFIC ---
  shopIndustry?: string;
  shopName?: string;
  shopCommercialName?: string;
  shopCoverUrl?: string;
  shopType?: string;
  shopDescription?: string;
  shopProducts?: string;
  shopProductsCategories?: string[];
  shopServices?: string[];
  shopBrands?: string[];
  shopPromotions?: string;
  shopNewArrivals?: string;

  openingHours?: OpeningHourDay[];
  shopDeliveryAvailable?: boolean;
  shopDeliveryZone?: string;
  shopDeliveryFees?: string;
  shopMinOrderAmount?: string;
  shopInStorePickup?: boolean;
  shopPaymentMethods?: string[];

  shopCatalogUrl?: string;
  shopPriceListUrl?: string;
  shopMenuUrl?: string;
  shopBrochureUrl?: string;

  // --- COMPANY SPECIFIC ---
  companyLegalForm?: string;
  companyMainActivity?: string;
  companyCreationDate?: string;
  companyCapital?: string;
  companyRccm?: string;
  companyTaxId?: string;
  companyFiscalId?: string;
  companyCnpsId?: string;
  companyLicenseId?: string;
  companyAuthorizationNumber?: string;
  companyMission?: string;
  companyVision?: string;
  companyValues?: string;
  companyPartners?: string[];
  companyCertifications?: string[];
  companyManagerName?: string;
  companyManagerPhone?: string;
  companyManagerEmail?: string;
  companyPresentationPdfUrl?: string;
  companyCatalogueUrl?: string;
  companyPortfolioUrl?: string;

  // --- SOCIAL / BIO SPECIFIC ---
  socialDisplayName?: string;
  socialNickname?: string;
  socialProfession?: string;
  socialLinks: SocialLink[];

  // --- PRODUCT / MENU / SERVICE SPECIFIC ---
  productSheetType?: ProductSubType;
  productName?: string;
  productBrand?: string;
  productModel?: string;
  productSku?: string;
  productReference?: string;
  productCode?: string;
  productDescriptionShort?: string;
  productDescriptionFull?: string;
  productCharacteristics?: string;
  productDimensions?: string;
  productWeight?: string;
  productMaterial?: string;
  productColors?: string[];
  productSizes?: string[];
  productVariants?: string;
  productPriceNormal?: string;
  productPricePromo?: string;
  productCurrency?: string;
  productDiscountPercentage?: string;
  productStockQuantity?: number | string;
  productIsAvailable?: boolean;
  productMinQuantity?: number | string;
  productGuarantee?: string;
  productConditions?: string;
  productDeliveryFees?: string;
  productOrderPhone?: string;
  productOrderWhatsapp?: string;
  productBuyUrl?: string;
  productMainImageUrl?: string;
  productGallery?: string[];
  productVideoUrl?: string;

  menuItems?: Array<{
    id: string;
    category: string;
    name: string;
    description?: string;
    price: string;
    photoUrl?: string;
    isAvailable: boolean;
    allergens?: string[];
    sides?: string[]; // Accompagnements
    options?: string[];
    extras?: string[];
  }>;

  serviceName?: string;
  serviceDescription?: string;
  servicePrice?: string;
  serviceDuration?: string;
  serviceAvailability?: string;
  serviceProviderName?: string;

  // --- WEB_LINK SPECIFIC ---
  linkTitle?: string;
  linkDescription?: string;
  linkDestinationUrl?: string;
  linkType?: string; // Website, Shop, Facebook, etc.
  redirectMode?: RedirectMode;
  customButtonText?: string;

  // --- CUSTOM SPECIFIC ---
  locationPlaceName?: string;
  customSections?: CustomSection[];
  customFields?: CustomField[]; // For backward compatibility or simple lists

  // Privacy & Protection
  privacy: {
    hideAddress?: boolean;
    hideSecondaryPhone?: boolean;
    hideTaxInfo?: boolean;
    requirePassword?: boolean;
    accessPassword?: string;
    isPublic?: boolean;
  };

  // Internal
  internalNotes?: string;
  otherInformation?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: CustomFieldExtended[];
  isVisible: boolean;
}

export interface CustomFieldExtended {
  id: string;
  type:
    | 'text_short' | 'text_long' | 'number' | 'phone' | 'whatsapp' | 'email' | 'url'
    | 'date' | 'time' | 'datetime' | 'address' | 'gps' | 'boolean' | 'select'
    | 'radio' | 'multiselect' | 'image' | 'gallery' | 'document' | 'pdf'
    | 'amount' | 'currency' | 'percentage' | 'rating' | 'matricule' | 'reference'
    | 'code' | 'number_id' | 'status' | 'button' | 'social' | 'video' | 'audio'
    | 'separator' | 'section_title';
  label: string;
  value: any;
  placeholder?: string;
  description?: string;
  isRequired: boolean;
  isVisible: boolean;
  isPublic: boolean;
  order: number;
  options?: string[];
  icon?: string;
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
