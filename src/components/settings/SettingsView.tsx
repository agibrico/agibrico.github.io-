import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Check, 
  Save, 
  ShieldCheck, 
  CreditCard,
  Sparkles,
  GitBranch,
  ExternalLink,
  Copy,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { DesignerProfile, CardFormat } from '../../types/qr';
import { getDesignerProfile, saveDesignerProfile, DEFAULT_DESIGNER_PROFILE } from '../../utils/storage';

interface SettingsViewProps {
  onProfileUpdated?: () => void;
  onBackToDashboard?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onProfileUpdated,
  onBackToDashboard
}) => {
  const [profile, setProfile] = useState<DesignerProfile>(getDesignerProfile());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const gitCommands = `git init
git add .
git commit -m "Déploiement AGB vCard Studio sur GitHub Pages"
git branch -M main
git remote add origin https://github.com/agibrico/agibrico.github.io-.git
git push -u origin main --force`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveDesignerProfile(profile);
    setSavedSuccess(true);
    if (onProfileUpdated) onProfileUpdated();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer mr-1"
                title="Retour à l'accueil"
              >
                <span>← Accueil</span>
              </button>
            )}
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Profil Concepteur & Paramètres
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Identité & Hébergement GitHub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Configurez les informations du studio AGB et gérez le déploiement en ligne sur GitHub Pages.
          </p>
        </div>
      </div>

      {/* GitHub Pages Hosting Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Configuré pour GitHub Pages
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
              Hébergement GitHub Pages
            </h2>
            <p className="text-xs text-slate-500">
              Dépôt cible : <span className="font-mono text-slate-800 font-semibold">https://github.com/agibrico/agibrico.github.io-</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/agibrico/agibrico.github.io-"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Voir le Dépôt GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Live URL Card */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              URL Publique en Production (GitHub Pages)
            </span>
            <div className="font-mono text-xs font-bold text-slate-900 break-all">
              https://agibrico.github.io/agibrico.github.io-/
            </div>
            <p className="text-[11px] text-slate-500">
              Les QR codes générés encodent cette adresse pour être immédiatement scannables partout dans le monde.
            </p>
          </div>
        </div>

        {/* Terminal commands */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              Commandes Git pour publier le projet en 1 clic :
            </span>
            <button
              onClick={handleCopyCommands}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              {copiedCmd ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copier les commandes</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {gitCommands}
          </pre>
        </div>

        {/* Step checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-900 block">1. Workflow CI/CD</span>
            <p className="text-slate-500 text-[11px]">Fichier <code className="text-blue-600 font-semibold">.github/workflows/deploy.yml</code> prêt pour le déploiement automatique.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-900 block">2. Routage SPA & 404</span>
            <p className="text-slate-500 text-[11px]">Redirection <code className="text-blue-600 font-semibold">404.html</code> configurée pour les fiches scannées sans rechargement.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1">
            <span className="font-bold text-slate-900 block">3. Base Relative</span>
            <p className="text-slate-500 text-[11px]">Chemins relatifs <code className="text-blue-600 font-semibold">base: './'</code> pour compatibilité absolue sous GitHub Pages.</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Concepteur */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Identité & Studio de Conception</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nom complet du Concepteur *
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Gilles Brice ATSÉ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Nom de l'Agence / Studio *
                </label>
                <input
                  type="text"
                  required
                  value={profile.agencyName}
                  onChange={e => setProfile({ ...profile, agencyName: e.target.value })}
                  placeholder="AGB Studio & Solutions"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Téléphone Principal
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+225 01 04 00 00 00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  WhatsApp Direct
                </label>
                <input
                  type="text"
                  value={profile.whatsapp}
                  onChange={e => setProfile({ ...profile, whatsapp: e.target.value })}
                  placeholder="+225 01 04 00 00 00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  E-mail Professionnel *
                </label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  placeholder="atsegillesbrice@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Site Internet / Portfolio
                </label>
                <input
                  type="text"
                  value={profile.website}
                  onChange={e => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://agb-solutions.ci"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Adresse & Ville du Studio
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                placeholder="Cocody Riviera, Abidjan, Côte d'Ivoire"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Slogan / Signature Studio
              </label>
              <input
                type="text"
                value={profile.slogan}
                onChange={e => setProfile({ ...profile, slogan: e.target.value })}
                placeholder="Conception professionnelle de cartes de visite physiques connectées & fiches vCard sur mesure"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
              />
            </div>
          </div>

          {/* Section 2: Préférences Impression */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Format d'Impression Physique par Défaut</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                profile.defaultFormat === '85x55' ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-bold' : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="defaultFormat"
                  checked={profile.defaultFormat === '85x55'}
                  onChange={() => setProfile({ ...profile, defaultFormat: '85x55' })}
                  className="hidden"
                />
                <div>
                  <span className="text-sm block font-bold">Standard Européen : 85 × 55 mm</span>
                  <span className="text-xs text-slate-500 font-normal">Format carte bancaire standard mondial</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                profile.defaultFormat === '90x50' ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-bold' : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="defaultFormat"
                  checked={profile.defaultFormat === '90x50'}
                  onChange={() => setProfile({ ...profile, defaultFormat: '90x50' })}
                  className="hidden"
                />
                <div>
                  <span className="text-sm block font-bold">Standard International : 90 × 50 mm</span>
                  <span className="text-xs text-slate-500 font-normal">Format américain & international allongé</span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Profil Concepteur enregistré avec succès !</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer le Profil</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
