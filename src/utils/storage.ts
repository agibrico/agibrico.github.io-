import { 
  QRCodeItem, 
  QRContent,
  QRType,
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
const DELETED_CARDS_KEY = 'smart_qr_deleted_ids_v1';
const DELETED_CLIENTS_KEY = 'smart_qr_deleted_clients_v1';

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
    jobTitle: 'Responsable Commercial',
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
    company: 'Indépendant',
    jobTitle: 'Gérant',
    industry: 'Conseil',
    primaryPhone: '+225 07 07 12 34 56',
    email: 'c.fodjo@outlook.com',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    socialLinks: [{ id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250707123456', displayOrder: 1 }],
    createdAt: '2026-09-07T18:00:00.000Z',
    updatedAt: '2026-09-08T10:00:00.000Z'
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
      transparentBg: false,
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
      transparentBg: false,
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
      transparentBg: false,
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
    title: 'Richmond DONGO — Responsable Commercial',
    type: 'BUSINESS_CARD',
    mode: 'dynamic',
    status: 'active',
    createdAt: '2026-08-13T11:00:00.000Z',
    updatedAt: '2026-08-24T11:00:00.000Z',
    scanCount: 68,
    content: {
      fullName: 'Richmond DONGO',
      jobTitle: 'Responsable Commercial',
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
      transparentBg: false,
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
      socialLinks: [],
      privacy: { isPublic: true }
    },
    styling: { fgColor: '#2563eb', bgColor: '#ffffff', transparentBg: false, moduleStyle: 'rounded', eyeStyle: 'rounded', errorCorrectionLevel: 'M', margin: 2, size: 300 }
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
      eventStartDate: '2026-12-20',
      eventLocationName: 'Hôtel Ivoire, Abidjan',
      socialLinks: [],
      privacy: { isPublic: true }
    },
    styling: { fgColor: '#7c3aed', bgColor: '#ffffff', transparentBg: false, moduleStyle: 'rounded', eyeStyle: 'rounded', errorCorrectionLevel: 'M', margin: 2, size: 300 }
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
      socialLinks: [],
      privacy: { isPublic: true }
    },
    styling: { fgColor: '#059669', bgColor: '#ffffff', transparentBg: false, moduleStyle: 'rounded', eyeStyle: 'rounded', errorCorrectionLevel: 'M', margin: 2, size: 300 }
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
      socialLinks: [],
      privacy: { isPublic: true }
    },
    styling: { fgColor: '#475569', bgColor: '#ffffff', transparentBg: false, moduleStyle: 'rounded', eyeStyle: 'rounded', errorCorrectionLevel: 'M', margin: 2, size: 300 }
  },
  {
    id: 'qr_demo_09',
    cardNumber: 'CARD-2026-0009',
    publicId: 'EV6MKMQU',
    clientId: 'client_005',
    title: 'Christophe FODJO — Gérant',
    type: 'BUSINESS_CARD',
    mode: 'dynamic',
    status: 'active',
    createdAt: '2026-09-07T18:00:00.000Z',
    updatedAt: '2026-09-08T10:00:00.000Z',
    scanCount: 12,
    content: {
      fullName: 'Christophe FODJO',
      jobTitle: 'Gérant',
      company: 'Indépendant',
      primaryPhone: '+225 07 07 12 34 56',
      email: 'c.fodjo@outlook.com',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      socialLinks: [{ id: 's1', platform: 'whatsapp', url: 'https://wa.me/2250707123456', displayOrder: 1 }],
      privacy: { hideAddress: false }
    },
    styling: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      transparentBg: false,
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
    publicId: 'GPKNURUP',
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
      transparentBg: false,
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
    const deletedData = localStorage.getItem(DELETED_CARDS_KEY);
    const deletedIds: string[] = deletedData ? JSON.parse(deletedData) : [];

    let items: QRCodeItem[] = data ? JSON.parse(data) : [];

    if (!Array.isArray(items)) {
      items = [];
    }

    let changed = false;

    // --- Legacy Compatibility: Cleanup redundant cards for Specific Clients ---
    // Rule 1: Richmond DONGO — Keep ONLY "Responsable Commercial" (qr_demo_04)
    // Rule 2: Christophe FODJO — Keep ONLY "Gérant" (qr_demo_09)
    const countBefore = items.length;
    items = items.filter(item => {
      if (!item) return false;

      const fullName = (item.content?.fullName || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      const jobTitle = (item.content?.jobTitle || '').toLowerCase();

      // Richmond DONGO cleanup
      if (fullName.includes('richmond dongo') || title.includes('richmond dongo')) {
        const isKeepable = item.id === 'qr_demo_04' || item.publicId === 'CAN2026R';
        const hasRightJob = jobTitle === 'responsable commercial';
        if (!isKeepable || !hasRightJob) {
          if (!deletedIds.includes(item.id)) deletedIds.push(item.id);
          return false;
        }
      }

      // Christophe FODJO cleanup
      if (fullName.includes('christophe fodjo') || title.includes('christophe fodjo')) {
        const isKeepable = item.id === 'qr_demo_09' || item.publicId === 'EV6MKMQU';
        const hasRightJob = jobTitle === 'gérant';
        if (!isKeepable || !hasRightJob) {
          if (!deletedIds.includes(item.id)) deletedIds.push(item.id);
          return false;
        }
      }

      return true;
    });

    if (items.length !== countBefore) {
      changed = true;
      localStorage.setItem(DELETED_CARDS_KEY, JSON.stringify(deletedIds));
    }

    INITIAL_QR_ITEMS.forEach(initItem => {
      // Only add if not in current items AND not in deleted list
      if (!items.find(i => i && i.id === initItem.id) && !deletedIds.includes(initItem.id)) {
        items.push(initItem);
        changed = true;
      }
    });

    // Strict De-duplication by publicId (keeping most recent)
    const uniqueMap = new Map<string, QRCodeItem>();
    items.forEach(item => {
      if (!item || !item.publicId) return;
      const key = item.publicId.trim().toUpperCase();
      const existing = uniqueMap.get(key);
      if (!existing || new Date(item.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
        uniqueMap.set(key, item);
      }
    });

    if (uniqueMap.size < items.length) {
      items = Array.from(uniqueMap.values());
      changed = true;
    }

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

export async function fetchQRCodeByPublicId(publicId: string, preferServer = true): Promise<QRCodeItem | null> {
  if (!publicId) return null;
  const cleanId = publicId.trim();

  // 1. Try Firestore first if preferred (to get latest data on scan)
  if (preferServer && db) {
    try {
      const cardRef = doc(db, 'cards', cleanId);
      const cardSnap = await getDoc(cardRef);
      if (cardSnap.exists()) {
        return {
          ...cardSnap.data() as QRCodeItem,
          // Ensure updatedAt is string for consistency if Firestore returns Timestamp
          updatedAt: cardSnap.data().updatedAt?.toDate?.()?.toISOString() || cardSnap.data().updatedAt
        };
      }
    } catch (err) {
      console.warn("Firestore fetch failed, falling back to local", err);
    }
  }

  // 2. Local fallback
  const localFound = getQRCodeByPublicId(cleanId);
  if (localFound) return localFound;

  // 3. Firestore fallback if not preferred but not found locally
  if (!preferServer && db) {
    try {
      const cardRef = doc(db, 'cards', cleanId);
      const cardSnap = await getDoc(cardRef);
      if (cardSnap.exists()) return cardSnap.data() as QRCodeItem;
    } catch (err) {}
  }

  return null;
}

/**
 * Recursively removes all keys with empty string values (""), null, undefined, or empty arrays ([])
 * from the QR content object before returning it.
 * Ensures data minimality.
 */
export function cleanQRCodeContent(content: QRContent, type: QRType): QRContent {
  if (!content) return {} as QRContent;

  const deepClean = (obj: any): any => {
    if (obj === null || obj === undefined) return undefined;
    if (typeof obj !== 'object') return obj === "" ? undefined : obj;

    if (Array.isArray(obj)) {
      const arr = obj.map(deepClean).filter(v =>
        v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)
      );
      return arr.length > 0 ? arr : undefined;
    }

    const res: any = {};
    let hasKeys = false;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Exception: privacy settings and customSections are preserved if they are objects
        // We preserve customSections to keep field definitions even if empty in the editor
        if (key === 'privacy' || key === 'customSections') {
          res[key] = obj[key];
          hasKeys = true;
          continue;
        }

        const val = deepClean(obj[key]);
        if (val !== undefined) {
          res[key] = val;
          hasKeys = true;
        }
      }
    }
    return hasKeys ? res : undefined;
  };

  const initialCleaned = deepClean(content) || {};
  const cleaned: any = {};

  // Field-to-Type mapping for prefix-based filtering
  const typePrefixMap: Record<string, string> = {
    'BOOK': 'book',
    'EVENT': 'event',
    'SHOP': 'shop',
    'COMPANY': 'company',
    'SOCIAL': 'social',
    'PRODUCT': 'product',
    'WEB_LINK': 'link',
    'LOCATION': 'location',
  };

  const currentPrefix = typePrefixMap[type];
  const otherPrefixes = Object.values(typePrefixMap).filter(p => p !== currentPrefix);

  for (const key in initialCleaned) {
    const value = initialCleaned[key];

    // Always keep common fields
    const commonFields = [
      'firstName', 'lastName', 'fullName', 'civility', 'middleName', 'jobTitle', 'profession',
      'company', 'department', 'industry', 'slogan', 'bio', 'photoUrl', 'logoUrl', 'bannerUrl',
      'primaryPhone', 'secondaryPhone', 'workPhone', 'whatsappNumber', 'email', 'workEmail',
      'websiteUrl', 'address', 'neighborhood', 'commune', 'city', 'region', 'postalCode', 'country',
      'latitude', 'longitude', 'privacy', 'customSections', 'customFields', 'openingHours', 'socialLinks'
    ];

    if (commonFields.includes(key)) {
      cleaned[key] = value;
      continue;
    }

    // Category type check (e.g. productSheetType only for PRODUCT)
    if (key === 'productSheetType' || key === 'menuItems' || key === 'serviceName') {
      if (type === 'PRODUCT') cleaned[key] = value;
      continue;
    }

    // Keep fields starting with the current prefix
    if (currentPrefix && key.startsWith(currentPrefix)) {
      cleaned[key] = value;
      continue;
    }

    // If it's a field for another type (prefixed), discard it
    if (otherPrefixes.some(p => key.startsWith(p))) {
      continue;
    }

    // Otherwise keep it
    cleaned[key] = value;
  }

  return cleaned as QRContent;
}

export function saveOrUpdateQRCode(item: QRCodeItem, syncToServer = true): { item: QRCodeItem, isUpdate: boolean } {
  const items = getStoredQRCodes();
  const cleanedContent = cleanQRCodeContent(item.content, item.type);

  // Remove from deleted list if re-added
  const deletedData = localStorage.getItem(DELETED_CARDS_KEY);
  if (deletedData) {
    const deletedIds: string[] = JSON.parse(deletedData);
    if (deletedIds.includes(item.id)) {
      localStorage.setItem(DELETED_CARDS_KEY, JSON.stringify(deletedIds.filter(id => id !== item.id)));
    }
  }

  // De-duplication check: Find by ID or by PublicId
  let existingIdx = items.findIndex(q => q.id === item.id);
  if (existingIdx === -1 && item.publicId) {
    existingIdx = items.findIndex(q => q.publicId === item.publicId);
  }

  const isUpdate = existingIdx >= 0;

  // Merge logic: ensure we don't lose existing fields if update is partial
  const updatedItem: QRCodeItem = {
    ...(isUpdate ? items[existingIdx] : {}),
    ...item,
    content: cleanedContent,
    userId: auth?.currentUser?.uid || (isUpdate ? items[existingIdx].userId : item.userId),
    updatedAt: new Date().toISOString()
  };

  if (isUpdate) {
    items[existingIdx] = updatedItem;
  } else {
    items.unshift(updatedItem);
  }

  saveQRCodes(items);

  if (syncToServer && db && updatedItem.publicId) {
    const cardRef = doc(db, 'cards', updatedItem.publicId);
    // Use setDoc WITHOUT merge: true to ensure cleaned fields are removed from Firestore too
    setDoc(cardRef, {
      ...updatedItem,
      updatedAt: serverTimestamp()
    }).catch(err => console.error("Firestore sync failed:", err));
  }

  return { item: updatedItem, isUpdate };
}

export function deleteQRCode(id: string): void {
  const items = getStoredQRCodes();
  const target = items.find(q => q.id === id);

  if (target) {
    // 1. Mark as deleted in Local Storage
    const deletedData = localStorage.getItem(DELETED_CARDS_KEY);
    const deletedIds: string[] = deletedData ? JSON.parse(deletedData) : [];
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(DELETED_CARDS_KEY, JSON.stringify(deletedIds));
    }

    // 2. Remove from active list
    saveQRCodes(items.filter(q => q.id !== id));

    // 3. Delete from Firestore if possible
    if (db && target.publicId) {
      deleteDoc(doc(db, 'cards', target.publicId)).catch(err => console.error("Firestore delete failed:", err));
    }
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
    const deletedData = localStorage.getItem(DELETED_CLIENTS_KEY);
    const deletedIds: string[] = deletedData ? JSON.parse(deletedData) : [];

    let clients: ClientProfile[] = data ? JSON.parse(data) : [];

    if (!Array.isArray(clients)) {
      clients = [];
    }

    let changed = false;
    INITIAL_CLIENTS.forEach(initClient => {
      if (!clients.find(c => c && c.id === initClient.id) && !deletedIds.includes(initClient.id)) {
        clients.push(initClient);
        changed = true;
      }
    });

    // Strict De-duplication by fullName (keeping most recent)
    const uniqueMap = new Map<string, ClientProfile>();
    clients.forEach(c => {
      if (!c || !c.fullName) return;
      const key = c.fullName.trim().toLowerCase();
      const existing = uniqueMap.get(key);
      if (!existing || new Date(c.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
        uniqueMap.set(key, c);
      }
    });

    if (uniqueMap.size < clients.length) {
      clients = Array.from(uniqueMap.values());
      changed = true;
    }

    if (changed || !data) {
      saveClients(clients);
    }

    return clients;
  } catch (e) {
    return INITIAL_CLIENTS;
  }
}

export function deduplicateData(): void {
  // Trigger re-load with de-duplication logic
  getStoredClients();
  getStoredQRCodes();
}

export function saveClients(clients: ClientProfile[]): void {
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
}

export function saveOrUpdateClient(client: Partial<ClientProfile> & { id?: string }): { client: ClientProfile, isUpdate: boolean } {
  const clients = getStoredClients();
  const nameKey = (client.fullName || '').trim().toLowerCase();

  // Remove from deleted list if re-added
  if (client.id) {
    const deletedData = localStorage.getItem(DELETED_CLIENTS_KEY);
    if (deletedData) {
      const deletedIds: string[] = JSON.parse(deletedData);
      if (deletedIds.includes(client.id)) {
        localStorage.setItem(DELETED_CLIENTS_KEY, JSON.stringify(deletedIds.filter(id => id !== client.id)));
      }
    }
  }

  // De-duplication check: Find by ID or by FullName
  let existingIdx = clients.findIndex(c => c.id === client.id);
  if (existingIdx === -1 && nameKey) {
    existingIdx = clients.findIndex(c => (c.fullName || '').trim().toLowerCase() === nameKey);
  }

  const isUpdate = existingIdx >= 0;
  const id = isUpdate ? clients[existingIdx].id : (client.id || `client_${Date.now()}`);

  const fullClient: ClientProfile = {
    ...(isUpdate ? clients[existingIdx] : {}),
    ...client as ClientProfile,
    id,
    updatedAt: new Date().toISOString()
  };

  if (isUpdate) {
    clients[existingIdx] = fullClient;
  } else {
    clients.unshift(fullClient);
  }

  saveClients(clients);
  return { client: fullClient, isUpdate };
}

export function deleteClient(id: string): void {
  // 1. Mark as deleted
  const deletedData = localStorage.getItem(DELETED_CLIENTS_KEY);
  const deletedIds: string[] = deletedData ? JSON.parse(deletedData) : [];
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    localStorage.setItem(DELETED_CLIENTS_KEY, JSON.stringify(deletedIds));
  }

  // 2. Filter out
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
