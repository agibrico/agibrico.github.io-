import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDU79Dd8IYQf245MELSf6cR7lXLEI_ukic",
  authDomain: "agb-vcard-studio.firebaseapp.com",
  projectId: "agb-vcard-studio",
  storageBucket: "agb-vcard-studio.firebasestorage.app",
  messagingSenderId: "745747813194",
  appId: "1:745747813194:web:agbvcardstudio001",
  measurementId: "G-745747813194"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey
  && firebaseConfig.authDomain
  && firebaseConfig.projectId
  && firebaseConfig.appId
);

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;
let analytics: Analytics | null = null;

try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      void isSupported()
        .then(supported => {
          if (supported && app) analytics = getAnalytics(app);
        })
        .catch(error => console.warn('Firebase Analytics indisponible :', error));
    }
  } else {
    console.warn('Configuration Firebase incomplète. Les fonctions Cloud sont désactivées.');
  }
} catch (error) {
  console.error('Initialisation Firebase impossible :', error);
}

export { db, auth, storage, analytics, isFirebaseConfigured };
export default app;
