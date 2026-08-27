import React from 'react';
import { 
  Clock, 
  History, 
  Plus, 
  Edit3, 
  Trash2, 
  Printer, 
  Download, 
  RefreshCw, 
  CheckCircle2,
  Lock,
  UserCheck,
  CreditCard
} from 'lucide-react';
import { HistoryLogItem } from '../../types/qr';

interface HistoryViewProps {
  historyLogs: HistoryLogItem[];
  onClearHistory?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyLogs
}) => {
  const getActionBadge = (action: HistoryLogItem['action']) => {
    switch (action) {
      case 'create_card':
        return { label: 'Création Carte', icon: Plus, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'update_card':
        return { label: 'Modification Carte', icon: Edit3, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'create_client':
        return { label: 'Nouveau Client', icon: UserCheck, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'update_client':
        return { label: 'Mise à jour Client', icon: Edit3, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'print_card':
        return { label: 'Impression Réalisée', icon: Printer, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'status_change':
        return { label: 'Changement Statut', icon: Lock, bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'export_backup':
      case 'restore_backup':
        return { label: 'Sauvegarde / Restauration', icon: Download, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { label: 'Opération', icon: History, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-blue-600" />
              Journal d'Audit Concepteur
            </span>
            <span className="text-xs font-semibold text-slate-400">• {historyLogs.length} événements enregistrés</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Historique de Production des Cartes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Suivi chronologique des créations de clients, personnalisations de cartes, tirages d'impression et modifications de coordonnées.
          </p>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pl-6">
          {historyLogs.map((log) => {
            const badge = getActionBadge(log.action);
            const Icon = badge.icon;

            return (
              <div key={log.id} className="relative group">
                
                {/* Node Dot */}
                <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                </div>

                <div className="space-y-1.5 bg-slate-50 border border-slate-100 p-4 rounded-2xl group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} inline-flex items-center gap-1`}>
                      <Icon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>

                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(log.timestamp)}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {log.title}
                  </h4>

                  {log.details && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {log.details}
                    </p>
                  )}
                </div>

              </div>
            );
          })}

          {historyLogs.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Aucun historique enregistré pour le moment.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
