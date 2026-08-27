import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Check, 
  ShieldCheck, 
  AlertTriangle,
  Server,
  FileJson,
  RotateCcw
} from 'lucide-react';
import { 
  exportFullDatabaseJSON, 
  importFullDatabaseJSON, 
  syncCardsWithServer,
  getStoredClients,
  getStoredQRCodes,
  getStoredHistory,
  getStoredScans
} from '../../utils/storage';

interface BackupViewProps {
  onDataRestored: () => void;
  onResetDemoData: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  onDataRestored,
  onResetDemoData
}) => {
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [syncingServer, setSyncingServer] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const clientsCount = getStoredClients().length;
  const cardsCount = getStoredQRCodes().length;
  const scansCount = getStoredScans().length;
  const historyCount = getStoredHistory().length;

  const handleExportJSON = () => {
    const json = exportFullDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_qr_vcard_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importFullDatabaseJSON(content);
        if (success) {
          alert("Base de données restaurée avec succès !");
          onDataRestored();
        } else {
          alert("Erreur lors de la lecture du fichier JSON de sauvegarde.");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleManualSync = async () => {
    setSyncingServer(true);
    setSyncResult(null);
    try {
      const merged = await syncCardsWithServer();
      setSyncResult(`Synchronisation réussie : ${merged.length} cartes actives et à jour sur le serveur API.`);
      onDataRestored();
    } catch (e) {
      setSyncResult("Erreur lors de la communication avec le serveur API.");
    } finally {
      setSyncingServer(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Sécurité & Persistance
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Sauvegarde & Restauration des Données
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Exportez l'intégralité de vos clients, cartes de visite, personnalisations graphiques et historiques pour une sécurité totale.
          </p>
        </div>
      </div>

      {/* Database State Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Clients</span>
          <span className="text-2xl font-black text-slate-900">{clientsCount}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Cartes vCard</span>
          <span className="text-2xl font-black text-blue-600">{cardsCount}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Scans Enregistrés</span>
          <span className="text-2xl font-black text-emerald-600">{scansCount}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Événements Journal</span>
          <span className="text-2xl font-black text-slate-700">{historyCount}</span>
        </div>
      </div>

      {/* Main Actions Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Exporter une Sauvegarde Complète (JSON)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Téléchargez un fichier JSON unique contenant l'ensemble de votre base : clients, cartes produites, liens dynamiques et journal d'audit.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger la Sauvegarde JSON</span>
          </button>
        </div>

        {/* Import / Restore Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Restaurer depuis une Sauvegarde JSON
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Importez un fichier JSON de sauvegarde précédemment généré pour rétablir instantanément vos fiches et configurations.
            </p>
          </div>

          <label className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Sélectionner le Fichier JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

      </div>

      {/* Server API Real-time Sync */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Synchronisation Serveur API & URLs Publiques</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Les cartes sont automatiquement synchronisées avec le serveur central (`/api/cards`) afin que tout smartphone scannant un QR Code accède en permanence à la fiche même sans cache local.
            </p>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncingServer}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingServer ? 'animate-spin text-blue-600' : ''}`} />
            <span>Synchroniser maintenant</span>
          </button>
        </div>

        {syncResult && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncResult}</span>
          </div>
        )}
      </div>

      {/* Danger Zone: Reset to Initial Demo Data */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Zone de Réinitialisation</span>
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Recharger les données modèles par défaut de l'application (Fiches AGB, ICG Africa, Dr. Bamba).
          </p>
          <button
            onClick={() => {
              if (window.confirm("Voulez-vous recharger les données modèles par défaut ?")) {
                onResetDemoData();
              }
            }}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Recharger les Données Modèles
          </button>
        </div>
      </div>

    </div>
  );
};
