import React, { useState } from 'react';
import { 
  BarChart3, 
  Smartphone, 
  Globe, 
  Download, 
  Calendar, 
  ShieldCheck, 
  TrendingUp, 
  Compass, 
  Laptop, 
  Tablet, 
  Sparkles,
  Layers,
  Filter
} from 'lucide-react';
import { ScanEvent, QRCodeItem } from '../../types/qr';

interface AnalyticsViewProps {
  scans: ScanEvent[];
  qrItems: QRCodeItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  scans,
  qrItems
}) => {
  const [selectedQRId, setSelectedQRId] = useState<string>('all');

  const filteredScans = selectedQRId === 'all'
    ? scans
    : scans.filter(s => s.qrCodeId === selectedQRId);

  // Group by Device
  const deviceCounts = filteredScans.reduce((acc, scan) => {
    acc[scan.deviceType] = (acc[scan.deviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by OS
  const osCounts = filteredScans.reduce((acc, scan) => {
    acc[scan.os] = (acc[scan.os] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by Browser
  const browserCounts = filteredScans.reduce((acc, scan) => {
    acc[scan.browser] = (acc[scan.browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by City
  const cityCounts = filteredScans.reduce((acc, scan) => {
    const city = scan.city || 'Inconnue';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'ID,QRCode_ID,Timestamp,Device,OS,Browser,Country,City\n';
    const rows = filteredScans.map(s => 
      `"${s.id}","${s.qrCodeId}","${s.timestamp}","${s.deviceType}","${s.os}","${s.browser}","${s.country || ''}","${s.city || ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_qr_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Top Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Statistiques & Analytics de Scans</span>
          </h1>
          <p className="text-xs text-slate-500">
            Analyse anonymisée des consultations de vos fiches et QR Codes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedQRId}
            onChange={e => setSelectedQRId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs"
          >
            <option value="all">Tous les QR Codes ({qrItems.length})</option>
            {qrItems.map(q => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Scans Enregistrés</span>
          <p className="text-3xl font-black text-slate-800 mt-1">{filteredScans.length}</p>
          <p className="text-[11px] text-emerald-600 mt-2 font-semibold">✓ Taux d'engagement dynamique</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Part Mobile Direct</span>
          <p className="text-3xl font-black text-blue-600 mt-1">
            {filteredScans.length > 0 ? Math.round(((deviceCounts['mobile'] || 0) / filteredScans.length) * 100) : 0}%
          </p>
          <p className="text-[11px] text-slate-500 mt-2">Scannés via appareil photo natif</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Système Majoritaire</span>
          <p className="text-3xl font-black text-slate-800 mt-1">
            {Object.keys(osCounts).length > 0 ? Object.entries(osCounts).sort((a, b) => (Number(b[1]) - Number(a[1])))[0][0] : 'N/A'}
          </p>
          <p className="text-[11px] text-slate-500 mt-2">Système d'exploitation le plus fréquent</p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Device Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Répartition par Appareil</span>
          </h3>

          <div className="space-y-3">
            {[
              { id: 'mobile', label: 'Mobile Smartphone', count: deviceCounts['mobile'] || 0, icon: Smartphone, color: 'bg-blue-600' },
              { id: 'desktop', label: 'Ordinateur / Desktop', count: deviceCounts['desktop'] || 0, icon: Laptop, color: 'bg-slate-700' },
              { id: 'tablet', label: 'Tablette tactile', count: deviceCounts['tablet'] || 0, icon: Tablet, color: 'bg-emerald-600' },
            ].map(d => {
              const pct = filteredScans.length > 0 ? Math.round((d.count / filteredScans.length) * 100) : 0;
              return (
                <div key={d.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{d.label}</span>
                    <span className="text-slate-900 font-bold">{d.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operating Systems */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Systèmes d'Exploitation</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(osCounts).sort((a, b) => (Number(b[1]) - Number(a[1]))).slice(0, 5).map(([os, count]) => {
              const pct = filteredScans.length > 0 ? Math.round((Number(count) / filteredScans.length) * 100) : 0;
              return (
                <div key={os} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{os}</span>
                    <span className="text-slate-900 font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Top Villes & Régions</span>
          </h3>

          <div className="space-y-2.5">
            {Object.entries(cityCounts).sort((a, b) => (Number(b[1]) - Number(a[1]))).slice(0, 5).map(([city, count]) => (
              <div key={city} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">{city}</span>
                <span className="font-bold text-blue-600">{count} scans</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <p>
          <strong>Respect strict de la vie privée (RGPD) :</strong> Les données analytiques collectées sont strictement anonymisées (pas d'adresse IP complète conservée, pas de cookies de tracking publicitaire).
        </p>
      </div>

    </div>
  );
};
