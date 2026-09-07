import { 
  QRCodeItem, 
  ScanEvent, 
  ClientProfile, 
  HistoryLogItem, 
  DesignerProfile, 
  CardModelId, 
  CardFormat 
} from '../types/qr';
import { 
  CANAAN_SERVICES_LOGO, 
  AGB_ENGINEERING_LOGO, 
  ICG_AFRICA_LOGO, 
  SAINTE_VICTOIRE_LOGO, 
} from './defaultLogos';
import { db, auth } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

const CARDS_STORAGE_KEY = 'smart_qr_items_v2';
const CLIENTS_STORAGE_KEY = 'smart_qr_clients_v2';
const SCANS_STORAGE_KEY = 'smart_qr_scans_v2';
const HISTORY_STORAGE_KEY = 'smart_qr_history_v2';
const DESIGNER_STORAGE_KEY = 'smart_qr_designer_v2';

export const DEFAULT_DESIGNER_PROFILE: DesignerProfile = {
  name: 'Gilles Brice ATSÉ',
  agencyName: 'AGB Studio & Conception',
  logoUrl: AGB_ENGINEERING_LOGO,
  phone: '+225 01 04 00 00 00',
  whatsapp: '+225 01 04 00 00 00',
  email: 'atsegillesbrice@gmail.com',
  website: 'https://agb-solutions.ci',
  address: 'Cocody Riviera, Abidjan, Côte d\'Ivoire',
  slogan: 'Conception professionnelle de cartes de visite physiques connectées & fiches vCard sur mesure',
  defaultFormat: '85x55'
};

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'client_001',
    clientNumber: 'CLT-2026-0001',
    firstName: 'Gilles Brice',
    lastName: 'ATSÉ',
    fullName: 'Gilles Brice ATSÉ',
    company: 'AGB',
    commercialName: 'AGB Digital Engineering',
    jobTitle: 'Concepteur d\'applications mobiles & Web',
    industry: 'Technologies & Ingénierie Logicielle',
    photoUrl: '',
    logoUrl: AGB_ENGINEERING_LOGO,
    primaryPhone: '+225 01 04 00 00 00',
    secondaryPhone: '+225 07 97 00 00 00',
    whatsappNumber: '+225 01 04 00 00 00',
    workPhone: '+225 27 22 00 00 00',
    email: 'atsegillesbrice@gmail.com',
    workEmail: 'contact@agb-solutions.ci',
    websiteUrl: 'https://agb-solutions.ci',
    address: 'Cocody Riviera 3',
    commune: 'Cocody',
    neighborhood: 'Riviera Bonoumin',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    locationLink: 'https://maps.google.com/?q=5.3599,-3.9870',
    slogan: 'L\'innovation technologique et le développement sur mesure au service de vos projets',
    bio: 'Conception et ingénierie d\'applications mobiles iOS & Android, architectures Web performantes, logiciels de gestion d\'entreprise et solutions SaaS scalables.',
    servicesList: [
      'Applications mobiles (iOS & Android)',
      'Applications Web & SaaS sur mesure',
      'Logiciels de gestion ERP & CRM',
      'Cartes de visite connectées vCard',
      'Intégration d\'API & Systèmes Cloud'
    ],
    productsList: [
      'Pack Carte Connectée Pro AGB',
      'Audit & Architecture Applicative'
    ],
    businessTaxId: 'CC-2409817-A',
    businessRegisterNumber: 'CI-ABJ-2024-B-12849',
    socialLinks: [
      { id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250104000000', displayOrder: 1 },
      { id: 's2', platform: 'linkedin', url: 'https://linkedin.com/in/gilles-brice-atse', displayOrder: 2 },
      { id: 's3', platform: 'github', url: 'https://github.com/atsegillesbrice', displayOrder: 3 },
      { id: 's4', platform: 'website', url: 'https://agb-solutions.ci', displayOrder: 4 },
      { id: 's5', platform: 'facebook', url: 'https://facebook.com', displayOrder: 5 }
    ],
    internalNotes: 'Client VIP et Fondateur. Carte imprimée sur support PVC Noir Carbone Mat 85x55mm.',
    associatedCardIds: ['qr_demo_01'],
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-21T08:00:00.000Z'
  }
];

export const INITIAL_QR_ITEMS: QRCodeItem[] = [
  {
    id: 'qr_demo_01',
    cardNumber: 'CARD-2026-0001',
    publicId: 'AGB2026X',
    clientId: 'client_001',
    title: 'Gilles Brice ATSÉ — Concepteur d\'applications',
    type: 'BUSINESS_CARD',
    mode: 'dynamic',
    status: 'active',
    modelId: 'model_luxury',
    cardFormat: '85x55',
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-21T08:00:00.000Z',
    scanCount: 184,
    lastScannedAt: '2026-08-21T05:30:00.000Z',
    tags: ['Carte Pro', 'Développeur', 'AGB', 'VIP'],
    content: {
      firstName: 'Gilles Brice',
      lastName: 'ATSÉ',
      fullName: 'Gilles Brice ATSÉ',
      jobTitle: 'Concepteur d\'applications mobiles & solutions Web sur mesure',
      company: 'AGB',
      commercialName: 'AGB Digital Engineering',
      department: 'Ingénierie Logicielle & Conseil',
      industry: 'Technologies de l\'Information & Digital',
      slogan: 'L\'innovation technologique et le développement sur mesure au service de vos projets',
      bio: 'Conception et ingénierie d\'applications mobiles iOS & Android, architectures Web performantes, logiciels de gestion d\'entreprise et solutions SaaS scalables.',
      photoUrl: '',
      logoUrl: AGB_ENGINEERING_LOGO,
      primaryPhone: '+225 01 04 00 00 00',
      secondaryPhone: '+225 07 97 00 00 00',
      whatsappNumber: '+225 01 04 00 00 00',
      workPhone: '+225 27 22 00 00 00',
      email: 'atsegillesbrice@gmail.com',
      workEmail: 'contact@agb-solutions.ci',
      websiteUrl: 'https://agb-solutions.ci',
      address: 'Cocody Riviera 3',
      commune: 'Cocody',
      neighborhood: 'Riviera Bonoumin',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      latitude: 5.3599,
      longitude: -3.9870,
      locationLink: 'https://maps.google.com/?q=5.3599,-3.9870',
      googleMapsUrl: 'https://maps.google.com/?q=5.3599,-3.9870',
      businessRegisterNumber: 'CI-ABJ-2024-B-12849',
      businessTaxId: 'CC-2409817-A',
      servicesList: [
        'Applications mobiles (iOS & Android)',
        'Applications Web sur mesure',
        'Logiciels de gestion & ERP/CRM',
        'Cartes de visite connectées vCard',
        'Solutions SaaS & Cloud'
      ],
      socialLinks: [
        { id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250104000000', displayOrder: 1 },
        { id: 's2', platform: 'linkedin', url: 'https://linkedin.com/in/gilles-brice-atse', displayOrder: 2 },
        { id: 's3', platform: 'github', url: 'https://github.com/atsegillesbrice', displayOrder: 3 },
        { id: 's4', platform: 'website', url: 'https://agb-solutions.ci', displayOrder: 4 },
        { id: 's5', platform: 'facebook', url: 'https://facebook.com', displayOrder: 5 }
      ],
      customFields: [],
      customSections: [],
      privacy: { hideAddress: false }
    },
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      transparentBg: false,
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      eyeColor: '#2563eb',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'matte_dark',
      logoUrl: AGB_ENGINEERING_LOGO,
      logoSizeRatio: 0.22,
      logoBackground: true,
      logoBgColor: '#ffffff',
      logoBorderRadius: 8,
      bottomText: 'SCANNEZ POUR MA FICHE COMPLÈTE',
      bottomTextColor: '#0f172a',
      bottomTextBg: '#f1f5f9',
      cardFormat: '85x55'
    }
  }
];

export const INITIAL_HISTORY: HistoryLogItem[] = [
  {
    id: 'hist_01',
    timestamp: '2026-08-21T08:00:00.000Z',
    action: 'update_card',
    title: 'Mise à jour coordonnées',
    details: 'Ajout du lien de localisation GPS et note d\'urgence sur la carte AGB2026X',
    clientId: 'client_001',
    cardId: 'qr_demo_01'
  }
];

function generateSampleScans(): ScanEvent[] {
  const scans: ScanEvent[] = [];
  const qrCodes = [
    { id: 'qr_demo_01', publicId: 'AGB2026X' }
  ];
  const devices: ScanEvent['deviceType'][] = ['mobile', 'mobile', 'mobile', 'mobile', 'tablet', 'desktop'];
  const oss: ScanEvent['os'][] = ['iOS', 'iOS', 'Android', 'Android', 'Android'];
  const browsers: ScanEvent['browser'][] = ['Safari', 'Chrome', 'Samsung Internet', 'Chrome'];
  const cities = ['Abidjan', 'Abidjan', 'Paris', 'Dakar', 'Yamoussoukro', 'San-Pédro', 'Lyon'];

  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    const target = qrCodes[Math.floor(Math.random() * qrCodes.length)];
    const d = new Date(Date.now() - (daysAgo * 86400000));
    
    scans.push({
      id: `scan_${Math.random().toString(36).substring(2, 9)}`,
      qrCodeId: target.id,
      publicId: target.publicId,
      timestamp: d.toISOString(),
      deviceType: devices[Math.floor(Math.random() * devices.length)],
      os: oss[Math.floor(Math.random() * oss.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      country: 'Côte d\'Ivoire',
      city: cities[Math.floor(Math.random() * cities.length)],
      referrer: 'Scan Appareil Photo'
    });
  }
  return scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getStoredQRCodes(): QRCodeItem[] {
  try {
    const data = localStorage.getItem(CARDS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(INITIAL_QR_ITEMS));
      return INITIAL_QR_ITEMS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_QR_ITEMS;
  }
}

export function saveQRCodes(items: QRCodeItem[]): void {
  localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(items));
}

export function getQRCodeById(id: string): QRCodeItem | undefined {
  return getStoredQRCodes().find(q => q.id === id);
}

export function getQRCodeByPublicId(publicId: string): QRCodeItem | undefined {
  if (!publicId) return undefined;
  const cleanId = publicId.trim().toLowerCase();
  return getStoredQRCodes().find(q => (q.publicId && q.publicId.toLowerCase() === cleanId) || q.id.toLowerCase() === cleanId);
}

export function encodeCardPayload(item: QRCodeItem): string {
  try {
    const compact: any = {
      id: item.id,
      pid: item.publicId,
      tt: item.title,
      tp: item.type,
      c: item.content,
      st: item.styling
    };
    const jsonStr = JSON.stringify(compact);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
  } catch (e) {
    return '';
  }
}

export function decodeCardPayload(payload: string): QRCodeItem | null {
  try {
    const raw = decodeURIComponent(escape(atob(decodeURIComponent(payload))));
    const compact = JSON.parse(raw);
    if (!compact) return null;

    return {
      id: compact.id,
      publicId: compact.pid,
      title: compact.tt,
      type: compact.tp,
      mode: 'dynamic',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scanCount: 0,
      content: compact.c,
      styling: compact.st
    };
  } catch (e) {
    return null;
  }
}

export async function fetchQRCodeByPublicId(publicId: string): Promise<QRCodeItem | null> {
  if (!publicId) return null;
  const cleanId = publicId.trim();

  // 1. Local
  const localFound = getQRCodeByPublicId(cleanId);
  if (localFound) return localFound;

  // 2. Firestore
  if (db) {
    try {
      const cardRef = doc(db, 'cards', cleanId);
      const cardSnap = await getDoc(cardRef);
      if (cardSnap.exists()) return cardSnap.data() as QRCodeItem;
    } catch (err) {}
  }

  return null;
}

export function saveOrUpdateQRCode(item: QRCodeItem, syncToServer = true): QRCodeItem {
  const items = getStoredQRCodes();
  const existingIdx = items.findIndex(q => q.id === item.id);
  
  const updatedItem: QRCodeItem = {
    ...item,
    userId: auth?.currentUser?.uid || item.userId,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    items[existingIdx] = updatedItem;
  } else {
    items.unshift(updatedItem);
  }

  saveQRCodes(items);

  if (syncToServer && db) {
    const cardRef = doc(db, 'cards', updatedItem.publicId);
    setDoc(cardRef, { ...updatedItem, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
  }

  return updatedItem;
}

export function deleteQRCode(id: string): void {
  const items = getStoredQRCodes();
  const target = items.find(q => q.id === id);
  if (target) {
    saveQRCodes(items.filter(q => q.id !== id));
    if (db) deleteDoc(doc(db, 'cards', target.publicId)).catch(() => {});
  }
}

export function duplicateQRCode(id: string): QRCodeItem | null {
  const original = getQRCodeById(id);
  if (!original) return null;
  const duplicate = {
    ...JSON.parse(JSON.stringify(original)),
    id: `qr_${Date.now()}`,
    publicId: generateSecurePublicId(),
    title: `${original.title} (Copie)`,
    scanCount: 0
  };
  saveOrUpdateQRCode(duplicate);
  return duplicate;
}

export async function syncCardsWithServer(): Promise<QRCodeItem[]> {
  return getStoredQRCodes();
}

export function getStoredClients(): ClientProfile[] {
  try {
    const data = localStorage.getItem(CLIENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_CLIENTS;
  } catch (e) {
    return INITIAL_CLIENTS;
  }
}

export function saveClients(clients: ClientProfile[]): void {
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
}

export function saveOrUpdateClient(client: Partial<ClientProfile> & { id?: string }): ClientProfile {
  const clients = getStoredClients();
  const id = client.id || `client_${Date.now()}`;
  const fullClient: ClientProfile = { ...client as ClientProfile, id, updatedAt: new Date().toISOString() };
  const idx = clients.findIndex(c => c.id === id);
  if (idx >= 0) clients[idx] = fullClient; else clients.unshift(fullClient);
  saveClients(clients);
  return fullClient;
}

export function deleteClient(id: string): void {
  saveClients(getStoredClients().filter(c => c.id !== id));
}

export function getStoredHistory(): HistoryLogItem[] {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_HISTORY;
  } catch (e) {
    return INITIAL_HISTORY;
  }
}

export function addHistoryLog(log: Omit<HistoryLogItem, 'id' | 'timestamp'>): void {
  const history = getStoredHistory();
  history.unshift({ ...log, id: `hist_${Date.now()}`, timestamp: new Date().toISOString() });
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
}

export function getDesignerProfile(): DesignerProfile {
  try {
    const data = localStorage.getItem(DESIGNER_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_DESIGNER_PROFILE;
  } catch {
    return DEFAULT_DESIGNER_PROFILE;
  }
}

export function saveDesignerProfile(profile: DesignerProfile): void {
  localStorage.setItem(DESIGNER_STORAGE_KEY, JSON.stringify(profile));
}

export function getStoredScans(): ScanEvent[] {
  try {
    const data = localStorage.getItem(SCANS_STORAGE_KEY);
    return data ? JSON.parse(data) : generateSampleScans();
  } catch (e) {
    return [];
  }
}

export function recordScanEvent(publicId: string): void {
  const scans = getStoredScans();
  scans.unshift({
    id: `scan_${Date.now()}`,
    qrCodeId: publicId,
    publicId,
    timestamp: new Date().toISOString(),
    deviceType: 'mobile',
    os: 'Android',
    browser: 'Chrome'
  });
  localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(scans.slice(0, 500)));
}

export function generateSecurePublicId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function generateCardNumber(sequence: number, type: string = 'BUSINESS_CARD'): string {
  const seqStr = sequence.toString().padStart(6, '0');
  switch (type) {
    case 'BOOK': return `AGB-BOOK-${seqStr}`;
    case 'EVENT': return `AGB-EVT-${seqStr}`;
    case 'SHOP': return `AGB-SHOP-${seqStr}`;
    case 'LOCATION': return `AGB-LOC-${seqStr}`;
    case 'COMPANY': return `AGB-CO-${seqStr}`;
    case 'SOCIAL': return `AGB-SOC-${seqStr}`;
    case 'PRODUCT': return `AGB-PRD-${seqStr}`;
    case 'WEB_LINK': return `AGB-LNK-${seqStr}`;
    case 'CUSTOM': return `AGB-CUS-${seqStr}`;
    default: return `AGB-CARD-${seqStr}`;
  }
}

export function generateClientNumber(sequence: number): string {
  return `AGB-CLT-${sequence.toString().padStart(6, '0')}`;
}

export const CANONICAL_GITHUB_PAGES_URL = 'https://agibrico.github.io/agibrico.github.io-/';

export function getPublicQRUrl(publicId: string, card?: QRCodeItem): string {
  return `${CANONICAL_GITHUB_PAGES_URL}#q/${publicId}`;
}

export function getClientById(id: string): ClientProfile | undefined {
  return getStoredClients().find(c => c.id === id);
}

export function exportFullDatabaseJSON(): string {
  const db = {
    cards: getStoredQRCodes(),
    clients: getStoredClients(),
    scans: getStoredScans(),
    history: getStoredHistory(),
    designer: getDesignerProfile(),
    exportDate: new Date().toISOString(),
    version: '2.0'
  };
  return JSON.stringify(db, null, 2);
}

export function importFullDatabaseJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.cards || !data.clients) return false;

    saveQRCodes(data.cards);
    saveClients(data.clients);
    if (data.scans) localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(data.scans));
    if (data.history) localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(data.history));
    if (data.designer) saveDesignerProfile(data.designer);

    return true;
  } catch (e) {
    return false;
  }
}
