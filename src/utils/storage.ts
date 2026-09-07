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
    company: 'AGB Digital Engineering',
    jobTitle: 'Concepteur d\'applications mobiles & Web',
    industry: 'Technologies',
    logoUrl: AGB_ENGINEERING_LOGO,
    primaryPhone: '+225 01 04 00 00 00',
    email: 'atsegillesbrice@gmail.com',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    socialLinks: [{ id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250104000000', displayOrder: 1 }],
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-21T08:00:00.000Z'
  },
  {
    id: 'client_002',
    clientNumber: 'CLT-2026-0002',
    firstName: 'Sarah',
    lastName: 'KOUASSI',
    fullName: 'Sarah KOUASSI',
    company: 'ICG Africa',
    jobTitle: 'Consultante en Stratégie & Finance',
    industry: 'Finance',
    logoUrl: ICG_AFRICA_LOGO,
    primaryPhone: '+225 07 07 00 00 00',
    email: 's.kouassi@icg-africa.com',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    socialLinks: [{ id: 's1', platform: 'linkedin', url: 'https://linkedin.com', displayOrder: 1 }],
    createdAt: '2026-08-11T09:00:00.000Z',
    updatedAt: '2026-08-22T09:00:00.000Z'
  },
  {
    id: 'client_003',
    clientNumber: 'CLT-2026-0003',
    firstName: 'Marc',
    lastName: 'BAMBA',
    fullName: 'Dr. Marc BAMBA',
    company: 'Centre Médical Sainte-Victoire',
    jobTitle: 'Médecin Cardiologue',
    industry: 'Santé',
    logoUrl: SAINTE_VICTOIRE_LOGO,
    primaryPhone: '+225 05 05 00 00 00',
    email: 'dr.bamba@sainte-victoire.ci',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    socialLinks: [{ id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250505000000', displayOrder: 1 }],
    createdAt: '2026-08-12T10:00:00.000Z',
    updatedAt: '2026-08-23T10:00:00.000Z'
  },
  {
    id: 'client_004',
    clientNumber: 'CLT-2026-0004',
    firstName: 'Richmond',
    lastName: 'DONGO',
    fullName: 'Richmond DONGO',
    company: 'Canaan Services',
    jobTitle: 'Responsable Imprimerie & Gadgets',
    industry: 'Imprimerie',
    logoUrl: CANAAN_SERVICES_LOGO,
    primaryPhone: '+225 06 64 41 65 15',
    email: 'richmond.dongo@canaan.ci',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    socialLinks: [{ id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250664416515', displayOrder: 1 }],
    createdAt: '2026-08-13T11:00:00.000Z',
    updatedAt: '2026-08-24T11:00:00.000Z'
  },
  {
    id: 'client_005',
    clientNumber: 'CLT-2026-0005',
    firstName: 'Christophe',
    lastName: 'FODJO',
    fullName: 'Christophe FODJO',
    company: 'FODJO Consulting',
    jobTitle: 'Consultant',
    industry: 'Business Services',
    primaryPhone: '+225 00 00 00 00 00',
    email: 'c.fodjo@example.com',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    createdAt: '2026-09-07T18:00:00.000Z',
    updatedAt: '2026-09-07T18:00:00.000Z'
  },
  {
    id: 'client_006',
    clientNumber: 'CLT-2026-0006',
    firstName: 'Eric Thierry',
    lastName: 'OHOUEU',
    fullName: 'Eric Thierry OHOUEU',
    company: 'MINISTÈRE DE L\'EMPLOI, DE LA PROTECTION SOCIALE ET DE LA FORMATION PROFESSIONNELLE',
    jobTitle: 'Administrateur du Travail et des Lois Sociales',
    industry: 'Administration Publique',
    primaryPhone: '+225 05 05 09 36 76',
    email: 'eric.ohoueu@travail.gouv.ci',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    socialLinks: [
      { id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250505093676', displayOrder: 1 },
      { id: 's2', platform: 'phone', url: 'tel:+2250101202909', displayOrder: 2 }
    ],
    createdAt: '2026-09-07T18:00:00.000Z',
    updatedAt: '2026-09-07T18:00:00.000Z'
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
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-21T08:00:00.000Z',
    scanCount: 184,
    content: {
      fullName: 'Gilles Brice ATSÉ',
      jobTitle: 'Concepteur d\'applications mobiles & Web',
      company: 'AGB Digital Engineering',
      logoUrl: AGB_ENGINEERING_LOGO,
      primaryPhone: '+225 01 04 00 00 00',
      email: 'atsegillesbrice@gmail.com',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      socialLinks: [{ id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250104000000', displayOrder: 1 }],
      privacy: { hideAddress: false }
    },
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'matte_dark',
      logoUrl: AGB_ENGINEERING_LOGO
    }
  },
  {
    id: 'qr_demo_02',
    cardNumber: 'CARD-2026-0002',
    publicId: 'ICG2026S',
    clientId: 'client_002',
    title: 'Sarah KOUASSI — Consultante Finance',
    type: 'BUSINESS_CARD',
    mode: 'dynamic',
    status: 'active',
    createdAt: '2026-08-11T09:00:00.000Z',
    updatedAt: '2026-08-22T09:00:00.000Z',
    scanCount: 45,
    content: {
      fullName: 'Sarah KOUASSI',
      jobTitle: 'Consultante en Stratégie & Finance',
      company: 'ICG Africa',
      logoUrl: ICG_AFRICA_LOGO,
      primaryPhone: '+225 07 07 00 00 00',
      email: 's.kouassi@icg-africa.com',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      socialLinks: [{ id: 's1', platform: 'linkedin', url: 'https://linkedin.com', displayOrder: 1 }],
      privacy: { hideAddress: false }
    },
    styling: {
      fgColor: '#1e293b',
      bgColor: '#ffffff',
      moduleStyle: 'classy',
      eyeStyle: 'square',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'navy_prestige',
      logoUrl: ICG_AFRICA_LOGO
    }
  },
  {
    id: 'qr_demo_03',
    cardNumber: 'CARD-2026-0003',
    publicId: 'MED2026M',
    clientId: 'client_003',
    title: 'Dr. Marc BAMBA — Cardiologie',
    type: 'BUSINESS_CARD',
    mode: 'dynamic',
    status: 'active',
    createdAt: '2026-08-12T10:00:00.000Z',
    updatedAt: '2026-08-23T10:00:00.000Z',
    scanCount: 120,
    content: {
      fullName: 'Dr. Marc BAMBA',
      jobTitle: 'Médecin Cardiologue',
      company: 'Centre Médical Sainte-Victoire',
      logoUrl: SAINTE_VICTOIRE_LOGO,
      primaryPhone: '+225 05 05 00 00 00',
      email: 'dr.bamba@sainte-victoire.ci',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      socialLinks: [{ id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250505000000', displayOrder: 1 }],
      privacy: { hideAddress: false }
    },
    styling: {
      fgColor: '#0f766e',
      bgColor: '#ffffff',
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'emerald_luxe',
      logoUrl: SAINTE_VICTOIRE_LOGO
    }
  },
  {
    id: 'qr_demo_04',
    cardNumber: 'CARD-2026-0004',
    publicId: 'CAN2026R',
    clientId: 'client_004',
    title: 'Richmond DONGO — Canaan Services',
    type: 'BUSINESS_CARD',
    mode: 'dynamic',
    status: 'active',
    createdAt: '2026-08-13T11:00:00.000Z',
    updatedAt: '2026-08-24T11:00:00.000Z',
    scanCount: 68,
    content: {
      fullName: 'Richmond DONGO',
      jobTitle: 'Responsable Imprimerie & Gadgets',
      company: 'Canaan Services',
      logoUrl: CANAAN_SERVICES_LOGO,
      primaryPhone: '+225 06 64 41 65 15',
      email: 'richmond.dongo@canaan.ci',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      socialLinks: [{ id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250664416515', displayOrder: 1 }],
      privacy: { hideAddress: false }
    },
    styling: {
      fgColor: '#dc2626',
      bgColor: '#ffffff',
      moduleStyle: 'dots',
      eyeStyle: 'circle',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'white_classic',
      logoUrl: CANAAN_SERVICES_LOGO
    }
  },
  {
    id: 'qr_demo_05',
    publicId: 'BOOK2026',
    title: 'Livre Démo — L\'Art du Digital',
    type: 'BOOK',
    mode: 'dynamic',
    status: 'active',
    createdAt: '2026-08-14T12:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z',
    scanCount: 12,
    content: {
      bookTitle: 'L\'Art du Digital',
      bookAuthor: 'Gilles Brice ATSÉ',
      bookSummary: 'Un guide complet sur la transformation digitale en Afrique.',
      privacy: { isPublic: true }
    },
    styling: { fgColor: '#2563eb', bgColor: '#ffffff', errorCorrectionLevel: 'M', margin: 2, size: 300 }
  },
  {
    id: 'qr_demo_06',
    publicId: 'EVENT2026',
    title: 'Invitation — Gala AGB 2026',
    type: 'EVENT',
    mode: 'dynamic',
    status: 'active',
    createdAt: '2026-08-15T13:00:00.000Z',
    updatedAt: '2026-08-26T13:00:00.000Z',
    scanCount: 89,
    content: {
      eventTitle: 'Gala Annuel AGB Digital',
      eventDate: '2026-12-20',
      eventLocationName: 'Hôtel Ivoire, Abidjan',
      privacy: { isPublic: true }
    },
    styling: { fgColor: '#7c3aed', bgColor: '#ffffff', errorCorrectionLevel: 'M', margin: 2, size: 300 }
  },
  {
    id: 'qr_demo_07',
    publicId: 'SHOP2026',
    title: 'Boutique — Canaan Gadgets',
    type: 'SHOP',
    mode: 'dynamic',
    status: 'active',
    createdAt: '2026-08-16T14:00:00.000Z',
    updatedAt: '2026-08-27T14:00:00.000Z',
    scanCount: 156,
    content: {
      commercialName: 'Canaan Gadgets',
      shopIndustry: 'E-commerce & Personnalisation',
      privacy: { isPublic: true }
    },
    styling: { fgColor: '#059669', bgColor: '#ffffff', errorCorrectionLevel: 'M', margin: 2, size: 300 }
  },
  {
    id: 'qr_demo_08',
    publicId: 'LOC2026',
    title: 'Localisation — Siège AGB',
    type: 'LOCATION',
    mode: 'dynamic',
    status: 'active',
    createdAt: '2026-08-17T15:00:00.000Z',
    updatedAt: '2026-08-28T15:00:00.000Z',
    scanCount: 34,
    content: {
      locationPlaceName: 'AGB Digital Headquarters',
      address: 'Riviera 3, Abidjan',
      latitude: 5.3599,
      longitude: -3.9870,
      privacy: { isPublic: true }
    },
    styling: { fgColor: '#475569', bgColor: '#ffffff', errorCorrectionLevel: 'M', margin: 2, size: 300 }
  },
  {
    id: 'qr_demo_09',
    cardNumber: 'CARD-2026-0009',
    publicId: 'EV6MKMQU',
    clientId: 'client_005',
    title: 'Christophe FODJO — Business Card',
    type: 'BUSINESS_CARD',
    mode: 'dynamic',
    status: 'active',
    createdAt: '2026-09-07T18:00:00.000Z',
    updatedAt: '2026-09-07T18:00:00.000Z',
    scanCount: 0,
    content: {
      fullName: 'Christophe FODJO',
      jobTitle: 'Consultant',
      company: 'FODJO Consulting',
      primaryPhone: '+225 00 00 00 00 00',
      email: 'c.fodjo@example.com',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      privacy: { hideAddress: false }
    },
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'matte_dark'
    }
  },
  {
    id: 'qr_demo_10',
    cardNumber: 'CARD-2026-0010',
    publicId: 'ERIC2026',
    clientId: 'client_006',
    title: 'Eric Thierry OHOUEU — Administrateur du Travail',
    type: 'BUSINESS_CARD',
    mode: 'dynamic',
    status: 'active',
    createdAt: '2026-09-07T18:00:00.000Z',
    updatedAt: '2026-09-07T18:00:00.000Z',
    scanCount: 0,
    content: {
      fullName: 'Eric Thierry OHOUEU',
      jobTitle: 'Administrateur du Travail et des Lois Sociales',
      company: 'MINISTÈRE DE L\'EMPLOI, DE LA PROTECTION SOCIALE ET DE LA FORMATION PROFESSIONNELLE',
      primaryPhone: '+225 05 05 09 36 76',
      email: 'eric.ohoueu@travail.gouv.ci',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      socialLinks: [
        { id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250505093676', displayOrder: 1 },
        { id: 's2', platform: 'phone', url: 'tel:+2250101202909', displayOrder: 2 }
      ],
      privacy: { hideAddress: false }
    },
    styling: {
      fgColor: '#1e293b',
      bgColor: '#ffffff',
      moduleStyle: 'rounded',
      eyeStyle: 'rounded',
      errorCorrectionLevel: 'H',
      margin: 3,
      size: 320,
      cardBackgroundTheme: 'navy_prestige'
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
    let items: QRCodeItem[] = data ? JSON.parse(data) : [];

    // Ensure initial items are present
    let changed = false;
    INITIAL_QR_ITEMS.forEach(initItem => {
      if (!items.find(i => i.id === initItem.id)) {
        items.push(initItem);
        changed = true;
      }
    });

    if (changed || !data) {
      saveQRCodes(items);
    }

    return items;
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
  if (!db || !auth.currentUser) return getStoredQRCodes();

  try {
    const userId = auth.currentUser.uid;

    // 1. Sync Cards
    const qCards = query(collection(db, 'cards'), where('userId', '==', userId));
    const cardSnaps = await getDocs(qCards);
    const serverCards = cardSnaps.docs.map(doc => doc.data() as QRCodeItem);

    const localCards = getStoredQRCodes();
    const mergedCards = [...localCards];

    serverCards.forEach(sCard => {
      const idx = mergedCards.findIndex(lc => lc.id === sCard.id || lc.publicId === sCard.publicId);
      if (idx >= 0) {
        mergedCards[idx] = { ...mergedCards[idx], ...sCard };
      } else {
        mergedCards.push(sCard);
      }
    });

    saveQRCodes(mergedCards);

    // 2. Sync Clients
    const qClients = query(collection(db, 'clients'), where('userId', '==', userId));
    const clientSnaps = await getDocs(qClients);
    const serverClients = clientSnaps.docs.map(doc => doc.data() as ClientProfile);

    const localClients = getStoredClients();
    const mergedClients = [...localClients];

    serverClients.forEach(sClient => {
      const idx = mergedClients.findIndex(lc => lc.id === sClient.id);
      if (idx >= 0) {
        mergedClients[idx] = { ...mergedClients[idx], ...sClient };
      } else {
        mergedClients.push(sClient);
      }
    });

    saveClients(mergedClients);

    return mergedCards;
  } catch (err) {
    console.error('Sync error:', err);
    return getStoredQRCodes();
  }
}

export function getStoredClients(): ClientProfile[] {
  try {
    const data = localStorage.getItem(CLIENTS_STORAGE_KEY);
    let clients: ClientProfile[] = data ? JSON.parse(data) : [];

    // Ensure initial clients are present
    let changed = false;
    INITIAL_CLIENTS.forEach(initClient => {
      if (!clients.find(c => c.id === initClient.id)) {
        clients.push(initClient);
        changed = true;
      }
    });

    if (changed || !data) {
      saveClients(clients);
    }

    return clients;
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
