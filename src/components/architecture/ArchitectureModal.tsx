import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Layers, 
  Smartphone, 
  Cpu, 
  ShieldCheck, 
  DollarSign, 
  BookOpen, 
  FileCode, 
  Workflow, 
  X, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tech' | 'db' | 'api' | 'security' | 'flows' | 'hosting' | 'android'>('tech');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Dossier d'Architecture Technique & Spécifications SaaS
              </h2>
              <p className="text-xs text-slate-500">
                Spécifications complètes de production pour SMART QR (Web SaaS + Mobile Ready)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-200 bg-slate-50 overflow-x-auto">
          {[
            { id: 'tech', label: '1. Stack & Architecture', icon: Cpu },
            { id: 'db', label: '2. Modèle PostgreSQL / DDL', icon: Database },
            { id: 'api', label: '3. Spécifications REST API', icon: Server },
            { id: 'flows', label: '4. Flux Création & Scan', icon: Workflow },
            { id: 'security', label: '5. Sécurité & Confidentialité', icon: ShieldCheck },
            { id: 'hosting', label: '6. Hébergement & Coûts', icon: DollarSign },
            { id: 'android', label: '7. Architecture Android Natif', icon: Smartphone },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-700 dark:text-slate-300 space-y-6">
          
          {activeTab === 'tech' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-4">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> 1. Recommandation d'Architecture Globale
                </h3>
                <p className="text-xs text-indigo-800 dark:text-indigo-300/90 leading-relaxed">
                  L'écosystème SMART QR est conçu selon le modèle <strong>Decoupled Edge-First Micro-SaaS</strong> :
                  un backend haute disponibilité gérant les URLs courtes dynamiques et l'analytics sans latence, 
                  un front-end React SPA PWA ultra-réactif pour le Studio de création/Dashboard, et une page d'atterrissage publique 
                  légère (&lt;45KB) optimisée pour s'afficher en moins de <strong>120ms</strong> lors du scan par appareil photo standard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-600" /> Backend & Edge Runtime
                  </h4>
                  <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400">
                    <li><strong>Node.js / Express / NestJS</strong> ou Fastify pour les microservices API</li>
                    <li><strong>PostgreSQL 16</strong> (Cloud SQL / Neon / Supabase) pour l'ACID</li>
                    <li><strong>Redis / Upstash</strong> pour la mise en cache ultra-rapide des fiches dynamiques (/q/:publicId)</li>
                    <li><strong>Stockage S3 / Cloud Storage</strong> avec CDN Cloudflare pour logos et photos</li>
                  </ul>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-600" /> Frontend & Clients
                  </h4>
                  <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400">
                    <li><strong>React 19 + TypeScript + Vite + Tailwind CSS</strong></li>
                    <li><strong>QR Engine :</strong> Vector SVG / Canvas 2D + Moteur Reed-Solomon H (30%)</li>
                    <li><strong>Scanner intégré :</strong> WebRTC MediaStream + jsQR avec fallbacks</li>
                    <li><strong>vCard 3.0 RFC 6350 :</strong> Téléchargement direct sans serveur requis</li>
                  </ul>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-800/60">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">Arborescence de Production Complète</h4>
                <pre className="bg-slate-900 text-slate-200 text-xs p-4 rounded-lg overflow-x-auto font-mono">
{`smart-qr/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # JWT, sessions, password hash argon2
│   │   │   ├── qrcode/        # QR engine, Dynamic redirects, scannability
│   │   │   ├── analytics/     # Scan logging, privacy-safe metrics
│   │   │   ├── vcard/          # vCard RFC 6350 formatters
│   │   │   └── storage/       # S3 image optimizer, webp converter
│   │   ├── db/
│   │   │   ├── schema.sql     # PostgreSQL tables
│   │   │   └── migrations/
│   │   └── server.ts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/     # Vue d'ensemble, stats, filtres
│   │   │   ├── editor/        # Formulaires identité, coordonnées, réseaux
│   │   │   ├── styler/        # Couleurs, modules, yeux, logo, badges
│   │   │   ├── preview/       # Simulateur mobile & check scannabilité
│   │   │   ├── public/        # Landing page publique /q/:publicId
│   │   │   ├── scanner/       # Lecteur caméra WebRTC
│   │   │   └── print/         # Export PDF A4, cartes, chevalets, badges
│   │   ├── utils/             # qrEngine, vcard, storage, contrast
│   │   └── types/             # Schémas TypeScript stricts
└── mobile-android/            # Application native Kotlin / Jetpack Compose`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'db' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Schéma SQL PostgreSQL Relationnel Normalisé</h3>
                  <p className="text-xs text-slate-500">Prêt pour Cloud SQL, Supabase ou PostgreSQL natif</p>
                </div>
                <button
                  onClick={() => copyToClipboard(SQL_SCHEMA, 'sql')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  {copiedSection === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'sql' ? 'Copié !' : 'Copier SQL DDL'}
                </button>
              </div>

              <pre className="bg-slate-900 text-emerald-400 text-xs p-4 rounded-xl overflow-x-auto font-mono max-h-96">
{SQL_SCHEMA}
              </pre>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Endpoints REST API & OpenAPI 3.0</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">POST /api/auth/register</span>
                  <p className="text-slate-500 mt-1">Inscription d'un nouvel utilisateur avec hash Argon2</p>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">POST /api/auth/login</span>
                  <p className="text-slate-500 mt-1">Authentification et génération de JWT sécurisé HttpOnly</p>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">GET /api/qr</span>
                  <p className="text-slate-500 mt-1">Récupère tous les QR codes du compte connecté avec pagination</p>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">POST /api/qr</span>
                  <p className="text-slate-500 mt-1">Crée un nouveau QR dynamique ou statique</p>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">PUT /api/qr/:id</span>
                  <p className="text-slate-500 mt-1">Met à jour les informations sans modifier l'identifiant du QR</p>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">GET /q/:publicId</span>
                  <p className="text-slate-500 mt-1">Route publique ultra-rapide affichant la fiche (sans authentification)</p>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">GET /q/:publicId/vcard</span>
                  <p className="text-slate-500 mt-1">Génère et télécharge le fichier .vcf conforme RFC 6350</p>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-mono text-pink-600 dark:text-pink-400 font-bold">POST /api/qr/:id/duplicate</span>
                  <p className="text-slate-500 mt-1">Duplique une fiche avec un nouvel identifiant unique</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flows' && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 dark:text-white">Flux Utilisateur : Création, Scan et Interaction Contact</h3>
              
              <div className="relative border-l-2 border-indigo-500 pl-6 ml-3 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Étape 1 : Création & Personnalisation</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    L'utilisateur choisit le type (Carte de visite, Entreprise, Menu, Social...), remplit les coordonnées, ajoute son logo et choisit ses couleurs.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Étape 2 : Contrôle Automatique de Lisibilité</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    L'algorithme vérifie le contraste (&gt;4.5:1), la marge de sécurité (Quiet Zone) et teste un décodage optique direct en mémoire.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Étape 3 : Scan par le destinataire (Appareil photo standard)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    La personne scanne avec son smartphone iPhone ou Android natif. <strong>Aucune application à installer</strong>. La page publique s'ouvre instantanément.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-900" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Étape 4 : Enregistrement Contact en 1 Clic</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Un clic sur <strong>"Enregistrer dans mes contacts"</strong> télécharge le fichier vCard .vcf et ouvre automatiquement l'application Contacts du smartphone avec photo, numéros et réseaux pré-remplis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Architecture de Sécurité & Confidentialité</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2">Identifiants Aléatoires Non-Prévisibles</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Les URLs publiques utilisent un identifiant cryptographique Base32 aléatoire (ex: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">7F8A9K2P</code>) sans exposer les clés primaires de base de données.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2">Filtrage des Champs Privés</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Chaque information (téléphone secondaire, adresse, notes internes) peut être marquée comme privée ou masquée. L'API publique ne renvoie jamais ces données.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2">Protection Anti-Abus & Rate Limiting</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Limitation de débit sur la création de QR et l'enregistrement de scans pour éviter le flooding ou le scraping automatisé.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2">Statistiques Respectueuses du RGPD</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Aucune collecte d'IP en clair ou de données nominatives lors du scan. Analyse basée sur User-Agent anonymisé et pays.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hosting' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Estimation des Coûts d'Hébergement & Scalabilité</h3>
              
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3">Composant</th>
                      <th className="p-3">Solution Recommandée</th>
                      <th className="p-3">Phase Lancement (0-10k scans/j)</th>
                      <th className="p-3">Phase Scale (1M scans/j)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr>
                      <td className="p-3 font-semibold">Backend API / Edge</td>
                      <td className="p-3">Google Cloud Run / Vercel Edge</td>
                      <td className="p-3 text-emerald-600 font-medium">0 € (Tier Gratuit)</td>
                      <td className="p-3">~25 - 45 € / mois</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Base de Données</td>
                      <td className="p-3">Cloud SQL PostgreSQL / Neon Serverless</td>
                      <td className="p-3 text-emerald-600 font-medium">0 € - 10 € / mois</td>
                      <td className="p-3">~40 - 80 € / mois</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Cache & Redirection</td>
                      <td className="p-3">Redis Upstash / Cloudflare CDN</td>
                      <td className="p-3 text-emerald-600 font-medium">0 € (Free tier)</td>
                      <td className="p-3">~15 € / mois</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Stockage Images & Logos</td>
                      <td className="p-3">Cloud Storage S3 + Cloudflare R2</td>
                      <td className="p-3 text-emerald-600 font-medium">&lt; 1 € / mois</td>
                      <td className="p-3">~10 - 20 € / mois</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                      <td className="p-3" colSpan={2}>TOTAL MENSUEL ESTIMÉ</td>
                      <td className="p-3 text-emerald-600 font-bold">0 € à 10 € / mois</td>
                      <td className="p-3 text-indigo-600 font-bold">~90 € à 160 € / mois</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Roadmap & Architecture Mobile Android Native (Kotlin)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Structure recommandée pour l'application mobile complémentaire avec Jetpack Compose, CameraX et Room Offline :
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Stack Mobile Native</h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400">
                    <li><strong>Language :</strong> Kotlin 2.0+</li>
                    <li><strong>UI Framework :</strong> Jetpack Compose + Material 3</li>
                    <li><strong>Architecture :</strong> Clean Architecture + MVVM + MVI</li>
                    <li><strong>Scanner :</strong> CameraX + ML Kit Barcode Scanning</li>
                    <li><strong>Offline-First :</strong> Room Database + WorkManager Sync</li>
                    <li><strong>Injection :</strong> Hilt / Dagger</li>
                    <li><strong>Réseau :</strong> Retrofit + OkHttp + Moshi</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Fonctionnalités Clés de l'App Native</h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400">
                    <li>Widget d'écran d'accueil avec son QR Code personnel VIP</li>
                    <li>Scanner ultra-rapide avec lampe torche et historique hors-ligne</li>
                    <li>Synchronisation bidirectionnelle automatique dès retour du réseau</li>
                    <li>Partage direct via NFC et Android Beam / Quick Share</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
          <span className="text-xs text-slate-500">
            Architecture vérifiée pour un passage en production SaaS immédiat
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-xs transition-colors cursor-pointer"
          >
            Fermer et Accéder à l'Application
          </button>
        </div>

      </div>
    </div>
  );
};

const SQL_SCHEMA = `-- Schéma SQL PostgreSQL de Production pour SMART QR SaaS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des Utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    phone VARCHAR(50),
    company VARCHAR(150),
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des QR Codes
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_id VARCHAR(16) UNIQUE NOT NULL, -- Identifiant court ex: 7F8A9K2P
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('vcard', 'business', 'social', 'product', 'image', 'event', 'location', 'url', 'custom')),
    mode VARCHAR(10) NOT NULL DEFAULT 'dynamic' CHECK (mode IN ('dynamic', 'static')),
    title VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    scan_count BIGINT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche instantanée sur le scan
CREATE INDEX idx_qr_codes_public_id ON qr_codes(public_id);
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);

-- Contenu détaillé des fiches
CREATE TABLE qr_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id UUID UNIQUE REFERENCES qr_codes(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200),
    job_title VARCHAR(150),
    company VARCHAR(150),
    industry VARCHAR(100),
    bio TEXT,
    photo_url TEXT,
    logo_url TEXT,
    banner_url TEXT,
    primary_phone VARCHAR(50),
    secondary_phone VARCHAR(50),
    whatsapp_number VARCHAR(50),
    email VARCHAR(255),
    website_url TEXT,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(30),
    country VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    google_maps_url TEXT,
    business_register_number VARCHAR(100), -- RCCM
    business_tax_id VARCHAR(100),         -- Compte contribuable
    privacy_settings JSONB DEFAULT '{}'::jsonb
);

-- Réseaux sociaux
CREATE TABLE qr_social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    label VARCHAR(100),
    display_order INT DEFAULT 0
);

-- Champs personnalisés illimités
CREATE TABLE qr_custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
    field_label VARCHAR(150) NOT NULL,
    field_value TEXT NOT NULL,
    field_type VARCHAR(30) DEFAULT 'text',
    is_private BOOLEAN DEFAULT FALSE
);

-- Personnalisation visuelle du QR
CREATE TABLE qr_stylings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id UUID UNIQUE REFERENCES qr_codes(id) ON DELETE CASCADE,
    fg_color VARCHAR(20) DEFAULT '#0f172a',
    bg_color VARCHAR(20) DEFAULT '#ffffff',
    transparent_bg BOOLEAN DEFAULT FALSE,
    module_style VARCHAR(30) DEFAULT 'square',
    eye_style VARCHAR(30) DEFAULT 'square',
    eye_color VARCHAR(20),
    error_correction_level VARCHAR(2) DEFAULT 'H',
    margin INT DEFAULT 3,
    size INT DEFAULT 400,
    logo_url TEXT,
    logo_size_ratio REAL DEFAULT 0.22,
    top_text VARCHAR(100),
    bottom_text VARCHAR(100)
);

-- Enregistrement des scans et analytics respectueux de la vie privée
CREATE TABLE qr_scan_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    device_type VARCHAR(20),
    operating_system VARCHAR(30),
    browser VARCHAR(30),
    country VARCHAR(100),
    city VARCHAR(100),
    referrer TEXT
);

CREATE INDEX idx_qr_scan_events_qr_time ON qr_scan_events(qr_code_id, scanned_at);
`;
