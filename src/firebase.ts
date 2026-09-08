import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
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
let analytics: Analytics | null = null;

try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // Analytics is optional and is not supported in every browser/WebView.
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

export { db, auth, analytics, isFirebaseConfigured };
export default app;
