import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  Eye, 
  Printer, 
  Check, 
  Power, 
  Layers, 
  ExternalLink,
  QrCode,
  Users,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileDown,
  Loader2
} from 'lucide-react';
import { QRCodeItem, ClientProfile } from '../../types/qr';
import { getPublicQRUrl, getStoredClients } from '../../utils/storage';
import { exportDirectCardPDF } from '../../utils/pdfExport';

interface QRListViewProps {
  items: QRCodeItem[];
  clients?: ClientProfile[];
  onCreateNew: () => void;
  onEdit: (item: QRCodeItem) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (item: QRCodeItem) => void;
  onOpenSimulator: (item: QRCodeItem) => void;
  onOpenPrintStudio: (item: QRCodeItem) => void;
  onBackToDashboard?: () => void;
}

export const QRListView: React.FC<QRListViewProps> = ({
  items,
  clients = [],
  onCreateNew,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus,
  onOpenSimulator,
  onOpenPrintStudio,
  onBackToDashboard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportSuccessId, setExportSuccessId] = useState<string | null>(null);

  const handleQuickExportPDF = async (item: QRCodeItem) => {
    if (exportingId) return;
    try {
      setExportingId(item.id);
      setExportSuccessId(null);
      await exportDirectCardPDF(item);
      setExportSuccessId(item.id);
      setTimeout(() => setExportSuccessId(null), 3000);
    } catch (e) {
      console.error('Quick PDF export error:', e);
      onOpenPrintStudio(item);
    } finally {
      setExportingId(null);
    }
  };

  const allClients = clients.length > 0 ? clients : getStoredClients();

  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      item.title.toLowerCase().includes(q) ||
      item.publicId.toLowerCase().includes(q) ||
      (item.cardNumber || '').toLowerCase().includes(q) ||
      (item.content.fullName || '').toLowerCase().includes(q) ||
      (item.content.company || '').toLowerCase().includes(q) ||
      (item.content.primaryPhone || '').toLowerCase().includes(q)
    );

    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (publicId: string) => {
    const url = getPublicQRUrl(publicId);
    navigator.clipboard.writeText(url);
    setCopiedId(publicId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer mr-1"
                title="Retour à l'accueil"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Accueil</span>
              </button>
            )}
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              Catalogue de Production
            </span>
            <span className="text-xs font-semibold text-slate-400">• {items.length} cartes créées</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Cartes de Visite Connectées
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Supervisez l'ensemble des cartes physiques produites, leurs identifiants uniques vCard, tirages d'impression et statuts d'activation.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Carte</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titulaire, entreprise, N° de carte, ID public..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1">
          {[
            { id: 'all', label: 'Toutes les cartes' },
            { id: 'active', label: 'Actives' },
            { id: 'inactive', label: 'Suspendues' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

      </div>

      {/* Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <CreditCard className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">Aucune carte trouvée</h3>
            <p className="text-xs text-slate-500">
              Modifiez vos critères de recherche ou concevez une nouvelle carte de visite connectée.
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-xs transition-colors cursor-pointer"
          >
            Créer une Carte
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const isCopied = copiedId === item.publicId;
            const linkedClient = allClients.find(c => c.id === item.clientId);

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
              >
                {/* Header & Badges */}
                <div className="space-y-3">
                  
                  {/* Top line with Card Number & Status Switch */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {item.cardNumber || `CARD-${item.publicId}`}
                    </span>

                    <button
                      onClick={() => onToggleStatus(item)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] transition-colors cursor-pointer ${
                        item.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                      title="Cliquer pour basculer le statut"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span>{item.status === 'active' ? 'Active' : 'Suspendue'}</span>
                    </button>
                  </div>

                  {/* Visual Identity Preview */}
                  <div className="flex items-start gap-3.5 pt-1">
                    {item.content.photoUrl ? (
                      <img
                        src={item.content.photoUrl}
                        alt={item.title}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                      />
                    ) : item.styling.logoUrl ? (
                      <img
                        src={item.styling.logoUrl}
                        alt="Logo"
                        className="w-14 h-14 rounded-2xl object-contain bg-slate-50 p-2 border border-slate-200 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-xs">
                        {item.content.firstName?.[0] || 'V'}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {item.content.fullName || item.title}
                      </h3>
                      <p className="text-xs font-semibold text-blue-600 truncate">
                        {item.content.jobTitle || 'Professionnel'}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.content.company || 'Indépendant'}
                      </p>
                    </div>
                  </div>

                  {/* Info stats snippet */}
                  <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between text-[11px] text-slate-600 border border-slate-100">
                    <span>Scans : <strong className="text-slate-900 font-bold">{item.scanCount || 0}</strong></span>
                    <span className="font-mono text-slate-400">/c/{item.publicId}</span>
                    <span className="font-medium text-slate-500">{item.cardFormat || '85×55 mm'}</span>
                  </div>

                </div>

                {/* Primary Action Buttons Bar */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  {/* Direct PDF Recto/Verso Button */}
                  <button
                    onClick={() => handleQuickExportPDF(item)}
                    disabled={exportingId === item.id}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                      exportSuccessId === item.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                    title="Télécharger le document PDF Recto & Verso sur votre téléphone ou PC"
                  >
                    {exportingId === item.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Génération du PDF...</span>
                      </>
                    ) : exportSuccessId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>PDF Téléchargé !</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Télécharger PDF (Recto / Verso)</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onOpenSimulator(item)}
                      className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Simulateur Mobile du scan"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Aperçu</span>
                    </button>

                    <button
                      onClick={() => onEdit(item)}
                      className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Modifier le contenu ou le design"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Éditer</span>
                    </button>

                    <button
                      onClick={() => onOpenPrintStudio(item)}
                      className="py-2 px-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Studio d'impression / Planches A4"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Studio</span>
                    </button>
                  </div>

                  {/* Secondary Actions (Copy Link, Duplicate, Delete) */}
                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <button
                      onClick={() => handleCopyLink(item.publicId)}
                      className="text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Lien copié !' : 'Copier lien public'}</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onDuplicate(item.id)}
                        className="text-slate-400 hover:text-slate-800 font-medium cursor-pointer"
                        title="Dupliquer avec un nouvel identifiant"
                      >
                        Dupliquer
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Confirmez-vous la suppression définitive de "${item.title}" ?`)) {
                            onDelete(item.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Supprimer cette carte"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
