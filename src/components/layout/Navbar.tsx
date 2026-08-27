import React from 'react';
import { 
  QrCode, 
  Plus, 
  BookOpen, 
  Layers, 
  BarChart3, 
  Settings, 
  Users, 
  CreditCard, 
  Palette, 
  History, 
  Database,
  ArrowLeft,
  ScanLine,
  Globe
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'clients' 
  | 'cards' 
  | 'models' 
  | 'create' 
  | 'scanner' 
  | 'android'
  | 'analytics' 
  | 'history' 
  | 'backup' 
  | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenArchitecture: () => void;
  appName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenArchitecture
}) => {
  const isDashboard = currentTab === 'dashboard';

  const quickNavTabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'cards', label: 'Cartes', icon: CreditCard },
    { id: 'scanner', label: 'Scanner', icon: ScanLine },
    { id: 'models', label: 'Modèles', icon: Palette },
    { id: 'android', label: 'Projet Android', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Zone 1: Brand Title & Direct Home Access */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isDashboard && (
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs border border-slate-200"
              title="Revenir à l'interface d'accueil"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="hidden xs:inline">Accueil</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:bg-blue-600 transition-colors shrink-0">
              <div className="w-4 h-4 border-2 border-white rounded-xs flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-xs" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-tight">
                AGB <span className="font-semibold text-blue-600">vCard Studio</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 leading-tight hidden sm:block">
                Atelier de Cartes Connectées
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              isDashboard
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 shrink-0 ${isDashboard ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Accueil</span>
          </button>

          {quickNavTabs.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://agibrico.github.io/agibrico.github.io-/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
            title="Lien officiel GitHub Pages de l'application"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>GitHub Pages</span>
          </a>

          <button
            onClick={onOpenArchitecture}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
            title="Dossier d'architecture technique et structure BD"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Architecture</span>
          </button>

          <button
            onClick={() => onSelectTab('create')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold shadow-xs transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Nouvelle Carte</span>
          </button>
        </div>

      </div>
    </header>
  );
};
