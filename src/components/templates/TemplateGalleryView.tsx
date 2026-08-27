import React from 'react';
import { 
  Layers, 
  Sparkles, 
  Check, 
  Plus, 
  CreditCard, 
  ArrowRight,
  Shield,
  Palette,
  Eye
} from 'lucide-react';
import { CardModelId, CardBackgroundTheme, ModuleStyle, EyeStyle } from '../../types/qr';

export interface CardTemplateDef {
  id: CardModelId;
  title: string;
  category: string;
  description: string;
  theme: CardBackgroundTheme;
  bgColor: string;
  textColor: string;
  accentColor: string;
  moduleStyle: ModuleStyle;
  eyeStyle: EyeStyle;
  rectoLayout: string;
  versoLayout: string;
  idealFor: string;
}

export const CARD_TEMPLATES: CardTemplateDef[] = [
  {
    id: 'model_classic',
    title: '1. Classique Professionnel',
    category: 'Standard Bureau',
    description: 'Design intemporel et équilibré avec typographie contrastée et fond blanc satiné.',
    theme: 'white_classic',
    bgColor: '#ffffff',
    textColor: '#0f172a',
    accentColor: '#2563eb',
    moduleStyle: 'rounded',
    eyeStyle: 'rounded',
    rectoLayout: 'Logo + Nom + Fonction + Société + Slogan',
    versoLayout: 'Téléphones + WhatsApp + Email + Site + QR Code droit',
    idealFor: 'Cadres, Avocats, Consultants, Notaires, Médecins'
  },
  {
    id: 'model_modern',
    title: '2. Moderne & Tech',
    category: 'Digital & Solutions',
    description: 'Look technologique épuré avec angles arrondis, accents bleus et disposition dynamique.',
    theme: 'matte_dark',
    bgColor: '#0f172a',
    textColor: '#f8fafc',
    accentColor: '#38bdf8',
    moduleStyle: 'smooth',
    eyeStyle: 'circle',
    rectoLayout: 'Badge Tech + Nom + Titre + Stack + QR Code discret',
    versoLayout: 'Réseaux Sociaux + Liens Pro + Coordonnées directes',
    idealFor: 'Développeurs, Ingénieurs, Startups, Studios Créatifs'
  },
  {
    id: 'model_minimal',
    title: '3. Minimaliste Épuré',
    category: 'Architecture & Design',
    description: 'Typographie aérée, espace négatif généreux, zéro superflu pour un impact direct.',
    theme: 'slate_minimal',
    bgColor: '#f8fafc',
    textColor: '#0f172a',
    accentColor: '#475569',
    moduleStyle: 'square',
    eyeStyle: 'square',
    rectoLayout: 'Nom épuré + Société + Typo fine',
    versoLayout: 'QR Code géant haute précision + 1 ligne contact',
    idealFor: 'Architectes, Designers, Photographes, Galeries'
  },
  {
    id: 'model_luxury',
    title: '4. Luxe Carbone',
    category: 'Prestige & VIP',
    description: 'Fond noir mat carbone profond rehaussé d\'accents dorés / platine haute définition.',
    theme: 'matte_dark',
    bgColor: '#090d16',
    textColor: '#f1f5f9',
    accentColor: '#f59e0b',
    moduleStyle: 'classy',
    eyeStyle: 'leaf',
    rectoLayout: 'Monogramme Doré + Nom en relief + Titre VIP',
    versoLayout: 'Lignes directes prioritaires + QR Code or bordé',
    idealFor: 'Dirigeants d\'entreprise, Immobilier de luxe, Joailliers, VIP'
  },
  {
    id: 'model_corporate',
    title: '5. Corporate & Finance',
    category: 'Banque & Conseil',
    description: 'Bleu marine royal institutionnel, structure rigoureuse et mentions légales claires.',
    theme: 'navy_prestige',
    bgColor: '#0a192f',
    textColor: '#f8fafc',
    accentColor: '#60a5fa',
    moduleStyle: 'square',
    eyeStyle: 'square',
    rectoLayout: 'Logo Corporate + Nom + Direction + Registre RCCM',
    versoLayout: 'Coordonnées Siège + Ligne directe + QR Code sécurisé',
    idealFor: 'Fonds d\'investissement, Banques, Cabinets d\'audit, PME'
  },
  {
    id: 'model_creative',
    title: '6. Créatif & Studio',
    category: 'Médias & Mode',
    description: 'Disposition asymétrique originale, jeux de contrastes forts et présence visuelle affirmée.',
    theme: 'burgundy_rich',
    bgColor: '#4a044e',
    textColor: '#fdf4ff',
    accentColor: '#f472b6',
    moduleStyle: 'dots',
    eyeStyle: 'circle',
    rectoLayout: 'Nom impactant + Portfolio URL + Accents graphiques',
    versoLayout: 'Galerie / Réseaux Sociaux + QR Code artistique',
    idealFor: 'Créateurs de contenu, Stylistes, Artistes, Agences de comm'
  },
  {
    id: 'model_recto_qr',
    title: '7. Recto QR Code / Verso Infos',
    category: 'Dualité Focus',
    description: 'Une face entièrement dédiée au scan instantané, l\'autre aux informations de lecture.',
    theme: 'white_classic',
    bgColor: '#ffffff',
    textColor: '#0f172a',
    accentColor: '#2563eb',
    moduleStyle: 'rounded',
    eyeStyle: 'rounded',
    rectoLayout: 'Grand QR Code centré + "SCANNEZ POUR ME CONTACTER"',
    versoLayout: 'Fiche complète imprimée (Nom, Société, Téléphones, Email, Adresse)',
    idealFor: 'Salons professionnels, Événements de networking rapide, Foires'
  },
  {
    id: 'model_center_qr',
    title: '8. QR Code Central Émeraude',
    category: 'Santé & Confiance',
    description: 'Nuances émeraude / vert profond symbolisant la confiance, l\'expertise et la santé.',
    theme: 'emerald_luxe',
    bgColor: '#064e3b',
    textColor: '#ecfdf5',
    accentColor: '#34d399',
    moduleStyle: 'rounded',
    eyeStyle: 'leaf',
    rectoLayout: 'Emblème médical / expertise + Nom + Spécialité',
    versoLayout: 'Horaires consultations + Urgences + QR Code central',
    idealFor: 'Cliniques, Médecins, Pharmacies, Cabinets d\'expertise'
  }
];

interface TemplateGalleryViewProps {
  onSelectTemplate: (templateId: CardModelId) => void;
  onBackToDashboard?: () => void;
}

export const TemplateGalleryView: React.FC<TemplateGalleryViewProps> = ({
  onSelectTemplate,
  onBackToDashboard
}) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer mr-1"
                title="Retour à l'accueil"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Accueil</span>
              </button>
            )}
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-rose-600" />
              Gabarits Professionnels
            </span>
            <span className="text-xs font-semibold text-slate-400">• 8 Modèles Prêts à l'Emploi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Catalogue des Modèles de Cartes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Choisissez parmi les gabarits optimisés pour l'impression 85×55 mm et 90×50 mm. Chaque modèle est entièrement personnalisable dans l'éditeur (couleurs, polices, logo, disposition recto/verso).
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CARD_TEMPLATES.map(tpl => {
          return (
            <div
              key={tpl.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                
                {/* Visual Card Preview Mockup */}
                <div 
                  className="h-44 p-4 flex flex-col justify-between relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{ backgroundColor: tpl.bgColor, color: tpl.textColor }}
                >
                  {/* Subtle Card Border / Sheen */}
                  <div className="absolute inset-0 border border-white/10 rounded-t-3xl pointer-events-none" />

                  {/* Header of Mini Card */}
                  <div className="flex items-center justify-between z-10">
                    <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-[10px] font-black">
                      AGB
                    </div>
                    <span 
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-current opacity-80"
                      style={{ color: tpl.accentColor }}
                    >
                      {tpl.category}
                    </span>
                  </div>

                  {/* Body Text Mockup */}
                  <div className="space-y-0.5 z-10">
                    <p className="text-xs font-black tracking-tight leading-none truncate">
                      Gilles Brice ATSÉ
                    </p>
                    <p className="text-[9px] opacity-80 truncate" style={{ color: tpl.accentColor }}>
                      Concepteur d'applications
                    </p>
                    <p className="text-[8px] opacity-60 truncate">
                      AGB Digital • +225 01 04 00 00 00
                    </p>
                  </div>

                  {/* Mini QR Placement Mockup */}
                  <div className="flex items-center justify-between z-10 pt-1 border-t border-current/15 text-[8px] opacity-75">
                    <span>Format 85×55 mm</span>
                    <div className="w-5 h-5 rounded-xs bg-white text-slate-900 flex items-center justify-center text-[7px] font-mono font-bold">
                      QR
                    </div>
                  </div>

                </div>

                {/* Card Template Info */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p><strong>Recto :</strong> {tpl.rectoLayout}</p>
                    <p><strong>Verso :</strong> {tpl.versoLayout}</p>
                    <p className="text-blue-700 pt-0.5"><strong>Idéal pour :</strong> {tpl.idealFor}</p>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => onSelectTemplate(tpl.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Utiliser ce Modèle</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
