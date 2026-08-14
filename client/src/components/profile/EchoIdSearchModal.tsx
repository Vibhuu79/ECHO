import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';

interface EchoIdSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendWave: (targetEchoId: string, username: string) => void;
}

export const EchoIdSearchModal: React.FC<EchoIdSearchModalProps> = ({
  isOpen,
  onClose,
  onSendWave
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'scanner'>('search');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setSearchResult(null);
      setSearchInput('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'scanner' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [activeTab, isOpen]);

  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setErrorMsg('Camera permission denied or unavailable. Use manual code search below.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch || searchInput).trim();
    if (!code) return;

    setLoading(true);
    setErrorMsg(null);
    setSearchResult(null);

    try {
      const res = await api.searchByEchoId(code);
      if (!res.found) {
        setErrorMsg(res.message || 'No user found with this Echo ID.');
      } else {
        setSearchResult(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900/95 border border-cyan-500/30 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">Find Nearby Echo ID</h3>
            <p className="text-xs text-slate-400">Connect via 6-digit code or QR Scanner</p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-800/70 rounded-xl p-1 my-4 border border-slate-700/60">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔍 Code Search
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'scanner'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📷 QR Camera Scanner
          </button>
        </div>

        {/* Tab 1: Manual Code Search */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Echo ID (e.g. #4BH8WU)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 font-mono tracking-wider"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading || !searchInput.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-3 rounded-xl transition disabled:opacity-50 text-sm flex items-center justify-center"
              >
                {loading ? '...' : 'Search'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Camera Scanner */}
        {activeTab === 'scanner' && (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-full h-56 bg-black rounded-2xl overflow-hidden border-2 border-cyan-500/40 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Scanner Reticle Overlay */}
              <div className="absolute inset-0 border-[32px] border-black/40 pointer-events-none flex items-center justify-center">
                <div className="w-36 h-36 border-2 border-pink-500 rounded-xl animate-pulse flex items-center justify-center">
                  <div className="w-full h-0.5 bg-pink-500 shadow-[0_0_12px_#ec4899] animate-ping" />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center">
              Position the Echo ID QR Code inside the box
            </p>
          </div>
        )}

        {/* Error / Status Messages */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Search Results Display */}
        {searchResult && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-800/90 border border-cyan-500/30 space-y-3 animate-fade-in">
            {searchResult.user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold border-2 border-slate-700 shadow-md">
                    {searchResult.user.avatarIcon || '⚡'}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">@{searchResult.user.username}</h4>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800">
                        {searchResult.user.echoId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs mt-1">
                      {searchResult.inRange ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          🟢 In Nearby Range ({searchResult.user.distance})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-cyan-400 font-medium">
                          🌐 Global Search Result ({searchResult.user.distance})
                        </span>
                      )}
                      {searchResult.user.contextLabel && (
                        <span className="text-slate-400">• {searchResult.user.contextLabel}</span>
                      )}
                    </div>
                  </div>
                </div>

                {searchResult.user.vibeStatusNote && (
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
                    <span>💬</span>
                    <span className="italic">"{searchResult.user.vibeStatusNote}"</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    onSendWave(searchResult.user.echoId, searchResult.user.username);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  👋 Send Wave to @{searchResult.user.username}
                </button>
              </>
            ) : (
              <div className="text-center py-2 space-y-2">
                <div className="text-amber-400 text-xs font-semibold flex items-center justify-center gap-1">
                  <span>⚠️</span> {searchResult.message || 'User is out of nearby interaction radius (>1km).'}
                </div>
                <p className="text-[11px] text-slate-400">
                  Echo is built for nearby interaction. User must be in range or enable Global Search.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
