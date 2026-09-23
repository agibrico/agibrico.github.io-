import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_KEY = 'agb_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const appUser: AppUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Utilisateur'
        };
        setUser(appUser);
        try { localStorage.setItem(SESSION_KEY, JSON.stringify(appUser)); } catch {}
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Admin universal bypass check
    if ((cleanEmail === 'admin@agibrico.com' || cleanEmail === 'atsegillesbrice@gmail.com' || cleanEmail === 'admin') && pass === 'agibrico') {
      const adminUser: AppUser = {
        uid: 'admin_agb_001',
        email: cleanEmail.includes('@') ? cleanEmail : 'atsegillesbrice@gmail.com',
        displayName: 'Gilles Brice ATSÉ (Admin)',
        isAdmin: true
      };
      setUser(adminUser);
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser)); } catch {}

      if (auth) {
        signInWithEmailAndPassword(auth, 'atsegillesbrice@gmail.com', pass).catch(() => {});
      }
      return;
    }

    // Standard Firebase Auth login
    if (auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        const appUser: AppUser = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || res.user.email?.split('@')[0] || 'Utilisateur'
        };
        setUser(appUser);
        try { localStorage.setItem(SESSION_KEY, JSON.stringify(appUser)); } catch {}
        return;
      } catch (err) {
        console.warn('Firebase login failed, trying local fallback:', err);
        throw err;
      }
    }

    // Local user session fallback if auth is not initialized
    const localUser: AppUser = {
      uid: `user_${Date.now()}`,
      email: email,
      displayName: email.split('@')[0] || 'Utilisateur'
    };
    setUser(localUser);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(localUser)); } catch {}
  };

  const signup = async (email: string, pass: string, name?: string) => {
    if (auth) {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) {
        await updateProfile(res.user, { displayName: name }).catch(() => {});
      }
      const appUser: AppUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: name || res.user.displayName || res.user.email?.split('@')[0] || 'Utilisateur'
      };
      setUser(appUser);
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(appUser)); } catch {}
      return;
    }

    const localUser: AppUser = {
      uid: `user_${Date.now()}`,
      email,
      displayName: name || email.split('@')[0] || 'Utilisateur'
    };
    setUser(localUser);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(localUser)); } catch {}
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth).catch(() => {});
    }
    setUser(null);
    try { localStorage.removeItem(SESSION_KEY); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
