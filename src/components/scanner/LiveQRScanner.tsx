import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  SwitchCamera, 
  Upload, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Flashlight,
  Sparkles,
  QrCode
} from 'lucide-react';

interface LiveQRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onOpenPublicId?: (publicId: string) => void;
}

export const LiveQRScanner: React.FC<LiveQRScannerProps> = ({
  onScanSuccess,
  onOpenPublicId
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    setError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.warn("Camera access warning:", err);
      setError(
        "Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur ou utilisez l'importation d'image ci-dessous."
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15); // A6
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio context might be restricted
    }

    if (navigator.vibrate) {
      navigator.vibrate(60);
    }
  };

  const tick = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(tick);
      return;
    }

    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx && videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        handleCodeDetected(code.data);
        return;
      }
    }

    animationFrameId.current = requestAnimationFrame(tick);
  };

  const handleCodeDetected = (data: string) => {
    playSuccessSound();
    setLastScannedResult(data);

    // Check if it matches a SMART QR public short link (e.g. /q/7F8A9K2P or #q/7F8A9K2P)
    const publicIdMatch = data.match(/(?:\/|#)q\/([a-zA-Z0-9_-]+)/i);
    if (publicIdMatch && publicIdMatch[1] && onOpenPublicId) {
      onOpenPublicId(publicIdMatch[1]);
    } else {
      onScanSuccess(data);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleCodeDetected(code.data);
          } else {
            alert("Aucun QR Code valide détecté sur cette image. Veuillez essayer avec une image plus nette.");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <QrCode className="w-6 h-6 text-blue-600" />
          <span>Scanner de QR Code Intelligent</span>
        </h2>
        <p className="text-xs text-slate-500">
          Pointez la caméra vers un QR Code pour ouvrir instantanément la fiche
        </p>
      </div>

      {/* Video Viewport Container */}
      <div className="relative aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 shadow-xl flex items-center justify-center">
        
        {/* Real Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
        />

        {/* Hidden Canvas for Decoding */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewport Overlay & Reticle */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Target Scanner Box */}
          <div className="relative w-64 h-64 border-2 border-blue-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]">
            
            {/* Corner brackets */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />

            {/* Laser scanning line */}
            <div className="absolute left-2 right-2 h-0.5 bg-linear-to-r from-transparent via-blue-400 to-transparent animate-pulse shadow-[0_0_8px_#3b82f6]" 
                 style={{
                   animation: 'scannerMove 2.2s infinite ease-in-out',
                   top: '50%'
                 }}
            />
          </div>
        </div>

        {/* Floating Controls inside Camera */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/10 hover:bg-slate-800 transition-colors cursor-pointer"
            title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={toggleCamera}
            className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/10 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Changer de caméra"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Error Message */}
        {error && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <p className="text-xs text-slate-300 max-w-sm">{error}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
            >
              Réessayer la Caméra
            </button>
          </div>
        )}

      </div>

      {/* Alternative: Image File Upload */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Importer une photo / capture d'écran</h4>
            <p className="text-[11px] text-slate-500">Décodez un QR Code depuis un fichier image (PNG, JPG, WebP)</p>
          </div>
        </div>

        <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-full cursor-pointer transition-colors whitespace-nowrap">
          Choisir un fichier
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Scanned Result Banner */}
      {lastScannedResult && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              QR Code Détecté avec succès
            </span>
            <button
              onClick={() => {
                setLastScannedResult(null);
                if (!isScanning) startCamera();
              }}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
            >
              Scanner un autre
            </button>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900 text-xs font-mono text-slate-800 dark:text-slate-200 break-all">
            {lastScannedResult}
          </div>

          <div className="flex items-center gap-2">
            {lastScannedResult.startsWith('http') ? (
              <a
                href={lastScannedResult}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Ouvrir le Lien</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(lastScannedResult);
                  alert("Texte copié dans le presse-papiers !");
                }}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Copier le contenu
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
