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
  serverTimestamp
} from 'firebase/firestore';

const CARDS_STORAGE_KEY = 'smart_qr_items_v2';
const CLIENTS_STORAGE_KEY = 'smart_qr_clients_v2';
const SCANS_STORAGE_KEY = 'smart_qr_scans_v2';
const HISTORY_STORAGE_KEY = 'smart_qr_history_v2';
const DESIGNER_STORAGE_KEY = 'smart_qr_designer_v2';
const DELETED_CARDS_KEY = 'smart_qr_deleted_ids_v1';
const DELETED_CLIENTS_KEY = 'smart_qr_deleted_clients_v1';

export function getCurrentUser(): { uid: string; email?: string | null; displayName?: string | null } | null {
  if (auth?.currentUser) {
    return auth.currentUser;
  }
  try {
    const raw = localStorage.getItem('agb_user_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.uid) return parsed;
    }
  } catch {}
  return null;
}

function getDeletedIdSet(storageKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []);
  } catch {
    return new Set();
  }
}

function normalizeTimestamp(value: any, fallback: string = new Date().toISOString()): string {
  if (typeof value === 'string' && value) return value;
  if (value?.toDate instanceof Function) {
    try { return value.toDate().toISOString(); } catch { return fallback; }
  }
  if (typeof value?.seconds === 'number') {
    return new Date(value.seconds * 1000).toISOString();
  }
  return fallback;
}

function normalizeFirestoreCard(data: any): QRCodeItem {
  const now = new Date().toISOString();
  const normalizedStatus = data?.status === 'PUBLISHED' ? 'active' : (data?.status || 'active');
  return {
    ...data,
    status: normalizedStatus,
    createdAt: normalizeTimestamp(data?.createdAt, now),
    updatedAt: normalizeTimestamp(data?.updatedAt, now),
    lastScannedAt: data?.lastScannedAt ? normalizeTimestamp(data.lastScannedAt, now) : undefined,
    expiresAt: data?.expiresAt ? normalizeTimestamp(data.expiresAt, now) : undefined
  } as QRCodeItem;
}

function normalizeFirestoreClient(data: any): ClientProfile {
  const now = new Date().toISOString();
  return {
    ...data,
    createdAt: normalizeTimestamp(data?.createdAt, now),
    updatedAt: normalizeTimestamp(data?.updatedAt, now)
  } as ClientProfile;
}

function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map(item => removeUndefinedDeep(item))
      .filter(item => item !== undefined) as T;
  }
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (nestedValue !== undefined) output[key] = removeUndefinedDeep(nestedValue);
    }
    return output as T;
  }
  return value;
}

export function resetLocalAppData(): void {
  [
    CARDS_STORAGE_KEY,
    CLIENTS_STORAGE_KEY,
    SCANS_STORAGE_KEY,
    HISTORY_STORAGE_KEY,
    DESIGNER_STORAGE_KEY,
    DELETED_CARDS_KEY,
    DELETED_CLIENTS_KEY
  ].forEach(key => localStorage.removeItem(key));
}

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

export const INITIAL_CLIENTS: ClientProfile[] = import.meta.env.DEV ? [
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
  }
] : [];

export const INITIAL_QR_ITEMS: QRCodeItem[] = import.meta.env.DEV ? [
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
  }
] : [];

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

    if (import.meta.env.DEV) {
      INITIAL_QR_ITEMS.forEach(initItem => {
        if (!items.find(i => i && i.id === initItem.id) && !deletedIds.includes(initItem.id)) {
          items.push(initItem);
          changed = true;
        }
      });
    }

    const uniqueMap = new Map<string, QRCodeItem>();
    items.forEach(item => {
      if (!item) return;
      const idKey = (item.publicId || item.id).trim().toUpperCase();
      if (!uniqueMap.has(idKey)) {
        uniqueMap.set(idKey, item);
      }
    });

    const deduplicated = Array.from(new Set(uniqueMap.values()));
    if (deduplicated.length !== items.length) {
      items = deduplicated;
      changed = true;
    }

    if (changed || !data) {
      saveQRCodes(items);
    }

    return items;
  } catch (e) {
    return import.meta.env.DEV ? INITIAL_QR_ITEMS : [];
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
  return getStoredQRCodes().find(q =>
    (q && q.publicId && q.publicId.toLowerCase() === cleanId) ||
    (q && q.id && q.id.toLowerCase() === cleanId)
  );
}

export function encodeCardPayload(item: QRCodeItem): string {
  try {
    const cleanContent = { ...(item.content || {}) };
    if (cleanContent.photoUrl && cleanContent.photoUrl.startsWith('data:')) delete cleanContent.photoUrl;
    if (cleanContent.logoUrl && cleanContent.logoUrl.startsWith('data:')) delete cleanContent.logoUrl;

    const cleanStyling = { ...(item.styling || {}) };
    if (cleanStyling.logoUrl && cleanStyling.logoUrl.startsWith('data:')) delete cleanStyling.logoUrl;

    const compact: any = {
      id: item.id,
      pid: item.publicId,
      tt: item.title,
      tp: item.type,
      c: cleanContent,
      st: cleanStyling
    };
    return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(compact)))));
  } catch (e) {
    return '';
  }
}

export function decodeCardPayload(payload: string): QRCodeItem | null {
  if (!payload || typeof payload !== 'string') return null;
  try {
    let cleanStr = payload.trim();
    if (cleanStr.includes('%')) {
      try { cleanStr = decodeURIComponent(cleanStr); } catch {}
    }
    cleanStr = cleanStr.replace(/-/g, '+').replace(/_/g, '/');
    const mod = cleanStr.length % 4;
    if (mod === 2) cleanStr += '==';
    else if (mod === 3) cleanStr += '=';

    let rawStr = atob(cleanStr);
    let jsonStr = rawStr;
    try { jsonStr = decodeURIComponent(escape(rawStr)); } catch {}

    const compact = JSON.parse(jsonStr);
    if (!compact) return null;

    return {
      id: compact.id || `qr_${(compact.pid || Date.now()).toString().toLowerCase()}`,
      publicId: compact.pid || compact.publicId || 'PUBLIC_CARD',
      title: compact.tt || compact.title || 'Fiche Visite',
      type: compact.tp || compact.type || 'BUSINESS_CARD',
      mode: 'dynamic',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scanCount: 0,
      content: compact.c || compact.content || {},
      styling: compact.st || compact.styling || {}
    };
  } catch (e) {
    console.warn('Failed to decode card payload:', e);
    return null;
  }
}

// STRICT READ-ONLY fetch from Firestore
export async function fetchQRCodeByPublicId(publicId: string): Promise<QRCodeItem | null> {
  if (!publicId) return null;
  const cleanId = publicId.trim();
  const upperDocId = cleanId.toUpperCase();

  if (import.meta.env.DEV) console.log("QR_PUBLIC_FETCH_START", cleanId);

  try {
    if (!db) {
      const local = getQRCodeByPublicId(cleanId);
      if (local) {
        if (import.meta.env.DEV) console.log("QR_PUBLIC_FETCH_OK", cleanId);
        return local;
      }
      if (import.meta.env.DEV) console.warn("QR_PUBLIC_FETCH_NOT_FOUND", cleanId);
      return null;
    }

    // 1. Direct getDoc
    let cardSnap = await getDoc(doc(db, 'cards', upperDocId));
    if (cardSnap.exists()) {
      if (import.meta.env.DEV) console.log("QR_PUBLIC_FETCH_OK", upperDocId);
      return normalizeFirestoreCard(cardSnap.data());
    }

    if (cleanId !== upperDocId) {
      cardSnap = await getDoc(doc(db, 'cards', cleanId));
      if (cardSnap.exists()) {
        if (import.meta.env.DEV) console.log("QR_PUBLIC_FETCH_OK", cleanId);
        return normalizeFirestoreCard(cardSnap.data());
      }
    }

    // 2. Query collection where publicId == cleanId
    const qPublic = query(collection(db, 'cards'), where('publicId', '==', cleanId));
    const snapPublic = await getDocs(qPublic);
    if (!snapPublic.empty) {
      if (import.meta.env.DEV) console.log("QR_PUBLIC_FETCH_OK", cleanId);
      return normalizeFirestoreCard(snapPublic.docs[0].data());
    }

    const qPublicUpper = query(collection(db, 'cards'), where('publicId', '==', upperDocId));
    const snapPublicUpper = await getDocs(qPublicUpper);
    if (!snapPublicUpper.empty) {
      if (import.meta.env.DEV) console.log("QR_PUBLIC_FETCH_OK", upperDocId);
      return normalizeFirestoreCard(snapPublicUpper.docs[0].data());
    }

    const localFallback = getQRCodeByPublicId(cleanId);
    if (localFallback) {
      if (import.meta.env.DEV) console.log("QR_PUBLIC_FETCH_OK", cleanId);
      return localFallback;
    }

    if (import.meta.env.DEV) console.warn("QR_PUBLIC_FETCH_NOT_FOUND", cleanId);
    return null;
  } catch (err) {
    if (import.meta.env.DEV) console.warn("QR_PUBLIC_FETCH_FAILED", err);
    const localFallback = getQRCodeByPublicId(cleanId);
    return localFallback || null;
  }
}

export function cleanQRCodeContent(content: QRContent, type: QRType): QRContent {
  if (!content) return {} as QRContent;
  const deepClean = (obj: any): any => {
    if (obj === null || obj === undefined) return undefined;
    if (typeof obj !== 'object') return obj === "" ? undefined : obj;
    if (Array.isArray(obj)) {
      const arr = obj.map(deepClean).filter(v => v !== undefined && v !== null);
      return arr.length > 0 ? arr : undefined;
    }
    const res: any = {};
    let hasKeys = false;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
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
  return (deepClean(content) || {}) as QRContent;
}

export async function saveOrUpdateQRCode(
  item: QRCodeItem,
  syncToServer = true
): Promise<{ item: QRCodeItem, isUpdate: boolean, cloudSynced: boolean, error?: any }> {
  if (import.meta.env.DEV) console.log("QR_SAVE_LOCAL_OK", item.id);
  const items = getStoredQRCodes();
  const cleanedContent = cleanQRCodeContent(item.content, item.type);

  const deletedData = localStorage.getItem(DELETED_CARDS_KEY);
  if (deletedData) {
    const deletedIds: string[] = JSON.parse(deletedData);
    if (deletedIds.includes(item.id)) {
      localStorage.setItem(DELETED_CARDS_KEY, JSON.stringify(deletedIds.filter(id => id !== item.id)));
    }
  }

  let existingIdx = items.findIndex(q => q.id === item.id);
  if (existingIdx === -1 && item.publicId) {
    existingIdx = items.findIndex(q => q.publicId === item.publicId);
  }

  const isUpdate = existingIdx >= 0;
  const currentUser = getCurrentUser();

  const updatedItem: QRCodeItem = {
    ...(isUpdate ? items[existingIdx] : {}),
    ...item,
    content: cleanedContent,
    userId: currentUser?.uid || (isUpdate ? (items[existingIdx] as any).userId : item.userId),
    createdAt: isUpdate ? items[existingIdx].createdAt : (item.createdAt || new Date().toISOString()),
    updatedAt: new Date().toISOString()
  };

  if (isUpdate) {
    items[existingIdx] = updatedItem;
  } else {
    items.unshift(updatedItem);
  }

  saveQRCodes(items);

  let cloudSynced = false;
  let syncError: any = null;

  if (syncToServer && db && updatedItem.publicId) {
    if (import.meta.env.DEV) console.log("QR_FIRESTORE_SAVE_START", updatedItem.publicId);
    try {
      const firestoreUid = auth?.currentUser?.uid || currentUser?.uid;
      if (!firestoreUid) {
        throw new Error("Utilisateur non authentifié pour la synchronisation Cloud.");
      }
      const cleanPublicId = updatedItem.publicId.trim().toUpperCase();
      const cloudItem = removeUndefinedDeep({ ...updatedItem, userId: firestoreUid });
      const cardRef = doc(db, 'cards', cleanPublicId);

      await setDoc(cardRef, {
        ...cloudItem,
        updatedAt: serverTimestamp()
      });

      // Verification after publication
      const snap = await getDoc(cardRef);
      if (snap.exists() && (snap.data()?.publicId?.toUpperCase() === cleanPublicId || snap.data()?.publicId === updatedItem.publicId)) {
        cloudSynced = true;
        if (import.meta.env.DEV) console.log("QR_FIRESTORE_SAVE_OK", cleanPublicId);
      } else {
        cloudSynced = false;
        syncError = new Error("Vérification Firestore échouée (document introuvable après setDoc)");
        if (import.meta.env.DEV) console.warn("QR_FIRESTORE_SAVE_FAILED", syncError);
      }
    } catch (err) {
      cloudSynced = false;
      syncError = err;
      if (import.meta.env.DEV) console.warn("QR_FIRESTORE_SAVE_FAILED", err);
    }
  }

  return { item: updatedItem, isUpdate, cloudSynced, error: syncError };
}

export function deleteQRCode(id: string): void {
  const items = getStoredQRCodes();
  const target = items.find(q => q.id === id);

  if (target) {
    const deletedData = localStorage.getItem(DELETED_CARDS_KEY);
    const deletedIds: string[] = deletedData ? JSON.parse(deletedData) : [];
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(DELETED_CARDS_KEY, JSON.stringify(deletedIds));
    }
    saveQRCodes(items.filter(q => q.id !== id));
    if (db && auth?.currentUser && target.publicId) {
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scanCount: 0,
    lastScannedAt: undefined
  };
  void saveOrUpdateQRCode(duplicate);
  return duplicate;
}

export async function syncCardsWithServer(): Promise<QRCodeItem[]> {
  if (!db || !auth?.currentUser) return getStoredQRCodes();

  try {
    const userId = auth.currentUser.uid;
    const deletedCardIds = getDeletedIdSet(DELETED_CARDS_KEY);
    const deletedClientIds = getDeletedIdSet(DELETED_CLIENTS_KEY);

    const qCards = query(collection(db, 'cards'), where('userId', '==', userId));
    const cardSnaps = await getDocs(qCards);
    const serverCards = cardSnaps.docs
      .map(snapshot => normalizeFirestoreCard(snapshot.data()))
      .filter(card => !deletedCardIds.has(card.id));

    const localCards = getStoredQRCodes().filter(card => !deletedCardIds.has(card.id) && (!card.userId || card.userId === userId));
    const mergedCards = [...localCards];

    serverCards.forEach(sCard => {
      const idx = mergedCards.findIndex(lc => lc.id === sCard.id || lc.publicId === sCard.publicId);
      if (idx >= 0) {
        const localUpdatedAt = Date.parse(mergedCards[idx].updatedAt || '') || 0;
        const serverUpdatedAt = Date.parse(sCard.updatedAt || '') || 0;
        if (serverUpdatedAt >= localUpdatedAt) {
          mergedCards[idx] = { ...mergedCards[idx], ...sCard };
        } else {
          if (db && mergedCards[idx].publicId) {
            const cleanPublicId = mergedCards[idx].publicId.trim().toUpperCase();
            setDoc(doc(db, 'cards', cleanPublicId), removeUndefinedDeep({ ...mergedCards[idx], userId })).catch(() => {});
          }
        }
      } else {
        mergedCards.push(sCard);
      }
    });

    saveQRCodes(mergedCards);
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

    if (!Array.isArray(clients)) clients = [];

    let changed = false;
    if (import.meta.env.DEV) {
      INITIAL_CLIENTS.forEach(initClient => {
        if (!clients.find(c => c && c.id === initClient.id) && !deletedIds.includes(initClient.id)) {
          clients.push(initClient);
          changed = true;
        }
      });
    }

    const uniqueMap = new Map<string, ClientProfile>();
    clients.forEach(c => {
      if (!c) return;
      if (!uniqueMap.has(c.id)) uniqueMap.set(c.id, c);
    });

    const deduplicated = Array.from(new Set(uniqueMap.values()));
    if (deduplicated.length !== clients.length) {
      clients = deduplicated;
      changed = true;
    }

    if (changed || !data) {
      saveClients(clients);
    }

    return clients;
  } catch (e) {
    return import.meta.env.DEV ? INITIAL_CLIENTS : [];
  }
}

export function saveClients(clients: ClientProfile[]): void {
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
}

export async function saveOrUpdateClient(client: Partial<ClientProfile> & { id?: string }): Promise<{ client: ClientProfile, isUpdate: boolean }> {
  const clients = getStoredClients();
  if (client.id) {
    const deletedIds = getDeletedIdSet(DELETED_CLIENTS_KEY);
    if (deletedIds.delete(client.id)) {
      localStorage.setItem(DELETED_CLIENTS_KEY, JSON.stringify(Array.from(deletedIds)));
    }
  }

  const existingIdx = client.id ? clients.findIndex(c => c.id === client.id) : -1;
  const isUpdate = existingIdx >= 0;
  const existing = isUpdate ? clients[existingIdx] : undefined;
  const id = existing?.id || client.id || `client_${Date.now()}`;
  const now = new Date().toISOString();
  const fullName = (client.fullName || `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.company || existing?.fullName || 'Client').trim();

  const fullClient: ClientProfile = {
    ...(existing || {}),
    ...client,
    id,
    clientNumber: client.clientNumber || existing?.clientNumber || generateClientNumber(clients.length + 1),
    firstName: client.firstName ?? existing?.firstName ?? '',
    lastName: client.lastName ?? existing?.lastName ?? '',
    fullName,
    company: client.company ?? existing?.company ?? '',
    jobTitle: client.jobTitle ?? existing?.jobTitle ?? '',
    primaryPhone: client.primaryPhone ?? existing?.primaryPhone ?? '',
    email: client.email ?? existing?.email ?? '',
    city: client.city ?? existing?.city ?? 'Abidjan',
    country: client.country ?? existing?.country ?? "Côte d'Ivoire",
    socialLinks: client.socialLinks ?? existing?.socialLinks ?? [],
    userId: getCurrentUser()?.uid || existing?.userId,
    createdAt: existing?.createdAt || client.createdAt || now,
    updatedAt: now
  };

  if (isUpdate) clients[existingIdx] = fullClient;
  else clients.unshift(fullClient);
  saveClients(clients);

  const activeUser = getCurrentUser();
  if (db && fullClient.id) {
    const firestoreUid = auth?.currentUser?.uid || activeUser?.uid;
    if (firestoreUid) {
      const clientRef = doc(db, 'clients', fullClient.id);
      const cloudClient = removeUndefinedDeep({ ...fullClient, userId: firestoreUid });
      await setDoc(clientRef, {
        ...cloudClient,
        updatedAt: serverTimestamp()
      }).catch(err => console.error('Client Firestore sync failed:', err));
    }
  }

  return { client: fullClient, isUpdate };
}

export function deleteClient(id: string): void {
  const clients = getStoredClients();
  const target = clients.find(client => client.id === id);
  const deletedIds = getDeletedIdSet(DELETED_CLIENTS_KEY);
  deletedIds.add(id);
  localStorage.setItem(DELETED_CLIENTS_KEY, JSON.stringify(Array.from(deletedIds)));
  saveClients(clients.filter(client => client.id !== id));

  if (target && db && auth?.currentUser) {
    deleteDoc(doc(db, 'clients', target.id)).catch(err => console.error('Client Firestore delete failed:', err));
  }
}

export function getStoredHistory(): HistoryLogItem[] {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordScanEvent(publicId: string): void {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const deviceType: ScanEvent['deviceType'] = /iPad|Tablet|PlayBook|Silk/i.test(ua) ? 'tablet' : /Mobi|Android|iPhone|iPod/i.test(ua) ? 'mobile' : 'desktop';
  const os: ScanEvent['os'] = /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /Android/i.test(ua) ? 'Android' : /Windows/i.test(ua) ? 'Windows' : 'Other';
  const browser: ScanEvent['browser'] = /Chrome\//i.test(ua) ? 'Chrome' : /Safari\//i.test(ua) ? 'Safari' : 'Other';

  const scan: ScanEvent = {
    id: `scan_${Date.now()}`,
    qrCodeId: publicId,
    publicId,
    timestamp: new Date().toISOString(),
    deviceType,
    os,
    browser,
    referrer: typeof document !== 'undefined' && document.referrer ? document.referrer : undefined
  };

  const scans = getStoredScans();
  scans.unshift(scan);
  localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(scans.slice(0, 500)));
}

export function generateSecurePublicId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    return Array.from(bytes, value => alphabet[value % alphabet.length]).join('');
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`.slice(-8).toUpperCase();
}

export function generateCardNumber(sequence: number, type: string = 'BUSINESS_CARD'): string {
  const seqStr = sequence.toString().padStart(6, '0');
  switch (type) {
    case 'BOOK': return `AGB-BOOK-${seqStr}`;
    case 'EVENT': return `AGB-EVT-${seqStr}`;
    case 'SHOP': return `AGB-SHOP-${seqStr}`;
    case 'LOCATION': return `AGB-LOC-${seqStr}`;
    default: return `AGB-CARD-${seqStr}`;
  }
}

export function generateClientNumber(sequence: number): string {
  return `AGB-CLT-${sequence.toString().padStart(6, '0')}`;
}

const configuredPublicUrl = (import.meta.env.VITE_PUBLIC_APP_URL || '').trim();
if (import.meta.env.PROD && !configuredPublicUrl) {
  throw new Error("ERREUR DE CONFIGURATION : VITE_PUBLIC_APP_URL est obligatoire en production pour générer les QR codes dynamiques.");
}
const baseUrl = configuredPublicUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://agb-vcard-studio.web.app/');
export const CANONICAL_PUBLIC_URL = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

export function getPublicQRUrl(publicId: string): string {
  const cleanId = (publicId || '').trim();
  return `${CANONICAL_PUBLIC_URL}#q/${encodeURIComponent(cleanId)}`;
}

export function getClientById(id: string): ClientProfile | undefined {
  return getStoredClients().find(c => c.id === id);
}

export async function syncOfficialDataToCloud(): Promise<void> {
  const currentUser = getCurrentUser();
  if (!db || !currentUser) return;
  const userId = auth?.currentUser?.uid || currentUser.uid;

  try {
    const allCards = getStoredQRCodes();
    for (const card of allCards) {
      if (card.publicId) {
        const cleanPid = card.publicId.trim().toUpperCase();
        await setDoc(doc(db, 'cards', cleanPid), {
          ...removeUndefinedDeep(card),
          userId: card.userId || userId,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
  } catch (err) {
    console.error('Data cloud sync failed:', err);
  }
}

export function exportFullDatabaseJSON(): string {
  const dbExport = {
    cards: getStoredQRCodes(),
    clients: getStoredClients(),
    scans: getStoredScans(),
    history: getStoredHistory(),
    designer: getDesignerProfile(),
    exportDate: new Date().toISOString(),
    version: '2.0'
  };
  return JSON.stringify(dbExport, null, 2);
}

export function importFullDatabaseJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data.cards) || !Array.isArray(data.clients)) return false;
    saveQRCodes(data.cards);
    saveClients(data.clients);
    return true;
  } catch {
    return false;
  }
}
