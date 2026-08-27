import React, { useState } from 'react';
import { 
  Plus, 
  BarChart3, 
  TrendingUp, 
  Users, 
  CreditCard, 
  ScanLine, 
  Sparkles, 
  Clock, 
  Printer, 
  Palette, 
  Database, 
  ShieldCheck, 
  ChevronRight,
  Eye,
  Settings,
  History,
  BookOpen,
  QrCode,
  ArrowRight,
  RefreshCw,
  Layers,
  Smartphone,
  FileDown,
  Loader2,
  Check
} from 'lucide-react';
import { QRCodeItem, ScanEvent, ClientProfile } from '../../types/qr';
import { getPublicQRUrl } from '../../utils/storage';
import { exportDirectCardPDF } from '../../utils/pdfExport';
import { NavTab } from '../layout/Navbar';

interface DashboardOverviewProps {
  qrItems: QRCodeItem[];
  clients: ClientProfile[];
  scans: ScanEvent[];
  onNavigateTab: (tab: NavTab) => void;
  onEditQR: (item: QRCodeItem) => void;
  onOpenSimulator: (item: QRCodeItem) => void;
  onOpenPrintStudio: (item: QRCodeItem) => void;
  onCreateNewCard: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  qrItems,
  clients,
  scans,
  onNavigateTab,
  onEditQR,
  onOpenSimulator,
  onOpenPrintStudio,
  onCreateNewCard
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const handleDownloadPDF = async (item: QRCodeItem) => {
    if (downloadingId) return;
    try {
      setDownloadingId(item.id);
      setDownloadSuccessId(null);
      await exportDirectCardPDF(item);
      setDownloadSuccessId(item.id);
      setTimeout(() => setDownloadSuccessId(null), 3000);
    } catch (e) {
      console.error('PDF download error:', e);
      onOpenPrintStudio(item);
    } finally {
      setDownloadingId(null);
    }
  };
  const totalClients = clients.length;
  const totalCards = qrItems.length;
  const activeCards = qrItems.filter(q => q.status === 'active').length;
  const inactiveCards = qrItems.filter(q => q.status !== 'active').length;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const monthAgo = new Date(Date.now() - 30 * 86400000);

  const scansToday = scans.filter(s => s.timestamp.startsWith(todayStr)).length;
  const scansThisWeek = scans.filter(s => new Date(s.timestamp) >= weekAgo).length;
  const scansThisMonth = scans.filter(s => new Date(s.timestamp) >= monthAgo).length;
  const totalScans = scans.length;

  const recentCards = qrItems.slice(0, 4);
  const recentScans = scans.slice(0, 4);

  // The complete suite of interactive module buttons representing every feature
  const moduleCards: {
    id: NavTab;
    title: string;
    description: string;
    badge: string;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
    bgColor: string;
    borderColor: string;
  }[] = [
    {
      id: 'clients',
      title: 'Clients',
      description: 'Carnet de clients, ajout, suppression et mise à jour dynamique des coordonnées',
      badge: `${totalClients} clients`,
      icon: Users,
      accentColor: 'text-purple-600',
      bgColor: 'bg-purple-50/60 hover:bg-purple-100/70',
      borderColor: 'border-purple-200 hover:border-purple-300'
    },
    {
      id: 'cards',
      title: 'Cartes',
      description: 'Catalogue complet des cartes générées, tirages physiques et statuts d\'activation',
      badge: `${totalCards} cartes`,
      icon: CreditCard,
      accentColor: 'text-blue-600',
      bgColor: 'bg-blue-50/60 hover:bg-blue-100/70',
      borderColor: 'border-blue-200 hover:border-blue-300'
    },
    {
      id: 'create',
      title: 'Éditeur (+ Créer)',
      description: 'Studio de création, personnalisation visuelle, vCard 3.0 et QR Code haute définition',
      badge: 'Conception Pro',
      icon: Plus,
      accentColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/60 hover:bg-indigo-100/70',
      borderColor: 'border-indigo-200 hover:border-indigo-300'
    },
    {
      id: 'scanner',
      title: 'QR Codes & Scanner',
      description: 'Scanner caméra intégré, vérification de contraste et test de lisibilité mobile',
      badge: 'Test Live',
      icon: ScanLine,
      accentColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/60 hover:bg-emerald-100/70',
      borderColor: 'border-emerald-200 hover:border-emerald-300'
    },
    {
      id: 'models',
      title: 'Modèles de Cartes',
      description: '8 Gabarits graphiques haut de gamme (Luxe, Titane, Émeraude, Minimaliste, etc.)',
      badge: '8 Modèles',
      icon: Palette,
      accentColor: 'text-rose-600',
      bgColor: 'bg-rose-50/60 hover:bg-rose-100/70',
      borderColor: 'border-rose-200 hover:border-rose-300'
    },
    {
      id: 'android',
      title: 'Projet Android (Kotlin)',
      description: 'Architecture Android Studio, Jetpack Compose, Room DB & Moteur d\'impression vectorielle',
      badge: 'Source Kotlin',
      icon: BookOpen,
      accentColor: 'text-teal-600',
      bgColor: 'bg-teal-50/60 hover:bg-teal-100/70',
      borderColor: 'border-teal-200 hover:border-teal-300'
    },
    {
      id: 'analytics',
      title: 'Statistiques',
      description: 'Volume de scans en temps réel, audience mobile, répartition par ville et OS',
      badge: `${totalScans} scans`,
      icon: BarChart3,
      accentColor: 'text-amber-600',
      bgColor: 'bg-amber-50/60 hover:bg-amber-100/70',
      borderColor: 'border-amber-200 hover:border-amber-300'
    },
    {
      id: 'history',
      title: 'Historique',
      description: 'Journal complet de traçabilité des modifications, tirages et synchronisations',
      badge: 'Journal d\'Audit',
      icon: History,
      accentColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50/60 hover:bg-cyan-100/70',
      borderColor: 'border-cyan-200 hover:border-cyan-300'
    },
    {
      id: 'backup',
      title: 'Sauvegarde',
      description: 'Exportation et importation JSON de l\'intégralité des données de l\'atelier',
      badge: 'Sécurité DB',
      icon: Database,
      accentColor: 'text-slate-700',
      bgColor: 'bg-slate-50/80 hover:bg-slate-100',
      borderColor: 'border-slate-200 hover:border-slate-300'
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Configuration générale de l\'atelier, profil concepteur et formats d\'impression 85×55mm',
      badge: 'Config AGB',
      icon: Settings,
      accentColor: 'text-slate-600',
      bgColor: 'bg-slate-50/80 hover:bg-slate-100',
      borderColor: 'border-slate-200 hover:border-slate-300'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header Banner & Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Studio & Concepteur AGB • Gestion Intégrale</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Atelier de Cartes de Visite Connectées vCard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Sélectionnez un module ci-dessous pour accéder directement à son interface dédiée. Modifiez les informations de vos clients à tout moment : leurs QR Codes physiques existants s'actualiseront automatiquement lors des scans !
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onCreateNewCard}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nouvelle Carte</span>
            </button>
            <button
              onClick={() => onNavigateTab('clients')}
              className="flex items-center gap-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs rounded-full transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>+ Gérer Clients</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC QR CODE SYNCHRONIZATION HIGHLIGHT BANNER */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Mise à Jour Instantanée & Sans Réimpression
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                100% Automatique
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-3xl">
              Vous pouvez <strong className="font-semibold">ajouter, modifier ou retirer</strong> n'importe quelle coordonnée client (téléphone, WhatsApp, e-mail, adresse, fonction, photo, etc.). <span className="underline decoration-emerald-500 font-bold">Le QR Code physique imprimé ne change jamais</span> et affichera automatiquement les nouvelles données dès le prochain scan !
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('clients')}
          className="shrink-0 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-end sm:self-center"
        >
          <span>Ouvrir Fiches Clients</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. MAIN INTERACTIVE BUTTONS HUB (All Modules from Drawer) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Modules & Interfaces de Production</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            Cliquez sur un bouton pour afficher uniquement son interface
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {moduleCards.map(mod => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => onNavigateTab(mod.id)}
                className={`p-5 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between gap-4 group cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 ${mod.bgColor} ${mod.borderColor}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl bg-white shadow-xs flex items-center justify-center ${mod.accentColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200/80 shadow-xs">
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-1 line-clamp-2">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 text-xs font-bold text-slate-700 group-hover:text-blue-700">
                  <span>Accéder à l'écran</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform group-hover:text-blue-600" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. KEY METRICS & RECENT PRODUCTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Produced Cards */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Dernières Cartes Créées</h2>
            </div>
            <button
              onClick={() => onNavigateTab('cards')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Voir toutes ({totalCards})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentCards.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {item.content.photoUrl ? (
                    <img
                      src={item.content.photoUrl}
                      alt={item.title}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {item.content.firstName?.[0] || 'C'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                        {item.cardNumber || item.publicId}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.status === 'active' ? 'Active' : 'Suspendue'}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.content.company} • {item.scanCount || 0} scan{(item.scanCount || 0) > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleDownloadPDF(item)}
                    disabled={downloadingId === item.id}
                    className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                      downloadSuccessId === item.id
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                    title="Télécharger directement le PDF Recto / Verso"
                  >
                    {downloadingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    ) : downloadSuccessId === item.id ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <FileDown className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                  <button
                    onClick={() => onOpenSimulator(item)}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
                    title="Aperçu mobile fiche vCard"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenPrintStudio(item)}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
                    title="Studio d'impression"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditQR(item)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Scan Stream */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Scans Réceptionnés</h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En direct
            </span>
          </div>

          <div className="space-y-2.5">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-bold">{scan.city || 'Abidjan'} ({scan.country || 'CI'})</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(scan.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{scan.deviceType} • {scan.os}</span>
                  <span className="text-blue-600 font-semibold font-mono text-[10px]">
                    {scan.publicId || 'SCAN'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('analytics')}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Consulter Toutes les Statistiques
          </button>
        </div>

      </div>

    </div>
  );
};
