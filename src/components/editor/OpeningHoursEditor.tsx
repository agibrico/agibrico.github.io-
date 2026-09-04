import React from 'react';
import { Clock } from 'lucide-react';
import { OpeningHourDay } from '../../types/qr';

interface OpeningHoursEditorProps {
  hours: OpeningHourDay[];
  onChange: (hours: OpeningHourDay[]) => void;
}

export const OpeningHoursEditor: React.FC<OpeningHoursEditorProps> = ({ hours, onChange }) => {
  const updateDay = (index: number, field: keyof OpeningHourDay, value: any) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    onChange(newHours);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-emerald-600" />
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Horaires d'Ouverture</h5>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {hours.map((oh, idx) => (
          <div key={oh.day} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
            oh.isOpen ? 'bg-white border-emerald-100 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-80'
          }`}>
            <div className="w-20">
              <span className={`text-[11px] font-black uppercase tracking-wide ${oh.isOpen ? 'text-slate-900' : 'text-slate-400'}`}>
                {oh.day}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-1">
              {/* Interrupteur Ouvert/Fermé */}
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={oh.isOpen}
                  onChange={e => updateDay(idx, 'isOpen', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className={`ms-2 text-[10px] font-bold uppercase ${oh.isOpen ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {oh.isOpen ? 'Ouvert' : 'Fermé'}
                </span>
              </label>

              {oh.isOpen && (
                <div className="flex items-center gap-2 ml-auto animate-in fade-in slide-in-from-right-2 duration-200">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-400 uppercase ml-1">Début</span>
                    <input
                      type="time"
                      value={oh.openTime}
                      onChange={e => updateDay(idx, 'openTime', e.target.value)}
                      className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono font-bold text-slate-700 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <span className="text-slate-300 mt-3">—</span>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-400 uppercase ml-1">Fin</span>
                    <input
                      type="time"
                      value={oh.closeTime}
                      onChange={e => updateDay(idx, 'closeTime', e.target.value)}
                      className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono font-bold text-slate-700 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
