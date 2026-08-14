import React from 'react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  echoId: string;
  username: string;
  onOpenScanner?: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  echoId,
  username,
  onOpenScanner
}) => {
  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(echoId);
    alert(`Echo ID ${echoId} copied to clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900/90 border border-cyan-500/30 p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold w-8 h-8 rounded-full bg-slate-800/60 flex items-center justify-center transition"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Your Echo ID Card</h3>
        <p className="text-xs text-slate-400 mb-6">Scan with Echo Camera to connect instantly</p>

        {/* QR Code Container */}
        <div className="bg-white p-5 rounded-2xl mx-auto w-56 h-56 flex flex-col items-center justify-center shadow-lg border border-slate-200 mb-4">
          <svg
            className="w-44 h-44"
            viewBox="0 0 256 256"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Styled QR Code SVG Pattern */}
            <rect width="256" height="256" fill="white" />
            <rect x="16" y="16" width="64" height="64" rx="8" fill="#0f172a" />
            <rect x="32" y="32" width="32" height="32" rx="4" fill="white" />
            <rect x="40" y="40" width="16" height="16" rx="2" fill="#ec4899" />

            <rect x="176" y="16" width="64" height="64" rx="8" fill="#0f172a" />
            <rect x="192" y="32" width="32" height="32" rx="4" fill="white" />
            <rect x="200" y="40" width="16" height="16" rx="2" fill="#06b6d4" />

            <rect x="16" y="176" width="64" height="64" rx="8" fill="#0f172a" />
            <rect x="32" y="192" width="32" height="32" rx="4" fill="white" />
            <rect x="40" y="200" width="16" height="16" rx="2" fill="#ec4899" />

            {/* Decorative QR Grid Blocks */}
            <rect x="96" y="24" width="16" height="48" rx="4" fill="#0f172a" />
            <rect x="128" y="16" width="32" height="16" rx="4" fill="#06b6d4" />
            <rect x="144" y="48" width="16" height="32" rx="4" fill="#ec4899" />

            <rect x="24" y="96" width="48" height="16" rx="4" fill="#0f172a" />
            <rect x="88" y="88" width="80" height="80" rx="12" fill="#0f172a" />
            <circle cx="128" cy="128" r="24" fill="#ec4899" />

            <rect x="184" y="96" width="48" height="16" rx="4" fill="#06b6d4" />
            <rect x="200" y="128" width="32" height="32" rx="4" fill="#0f172a" />

            <rect x="96" y="184" width="32" height="16" rx="4" fill="#06b6d4" />
            <rect x="144" y="176" width="48" height="16" rx="4" fill="#0f172a" />
            <rect x="176" y="200" width="40" height="40" rx="6" fill="#ec4899" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 mb-6">
          <span className="text-slate-300 font-medium">@{username}</span>
          <span className="text-cyan-400 font-mono font-bold">{echoId}</span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={copyToClipboard}
            className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            📋 Copy ID Code ({echoId})
          </button>

          {onOpenScanner && (
            <button
              onClick={() => {
                onClose();
                onOpenScanner();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-semibold transition shadow-lg flex items-center justify-center gap-2"
            >
              📷 Open QR Code Scanner
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
