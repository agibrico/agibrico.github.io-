import React from 'react';
import { X, Smartphone, ExternalLink } from 'lucide-react';
import { QRCodeItem } from '../../types/qr';
import { PublicScannedPage } from '../public/PublicScannedPage';
import { getPublicQRUrl } from '../../utils/storage';

interface PhoneSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: QRCodeItem | null;
}

export const PhoneSimulatorModal: React.FC<PhoneSimulatorModalProps> = ({
  isOpen,
  onClose,
  item
}) => {
  if (!isOpen || !item) return null;

  const publicUrl = getPublicQRUrl(item.publicId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center max-w-full">
        
        {/* Top Floating Control Bar */}
        <div className="flex items-center justify-between w-full max-w-md mb-3 px-2 text-white">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold">Simulateur Mobile du Scan</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              <span>Lien Public</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Smartphone Shell Frame */}
        <div className="w-[360px] sm:w-[390px] h-[720px] max-h-[82vh] bg-slate-900 border-8 border-slate-800 rounded-[45px] shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-white/10">
          
          {/* Dynamic Island / Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-end px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
          </div>

          {/* Screen Content Viewport */}
          <div className="flex-1 overflow-y-auto w-full pt-2">
            <PublicScannedPage qrItem={item} isSimulator={true} />
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-full py-2 bg-slate-950 flex justify-center shrink-0 z-20">
            <div className="w-28 h-1 bg-slate-600 rounded-full" />
          </div>

        </div>

      </div>
    </div>
  );
};
