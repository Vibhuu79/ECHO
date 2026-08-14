import React, { useState } from 'react';
import { Zap, X, Clock, MapPin, AlertCircle, Compass, Lock, Globe } from 'lucide-react';
import { api } from '../../services/api';

interface CreateSparkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userCoords: { latitude: number; longitude: number } | null;
}

const QUICK_SUGGESTIONS = [
  'Anyone for chai? ☕',
  'Need help with React / JS 💻',
  'Heading to cafeteria, join? 🍕',
  'Quick chess game at Quad ♟️',
  'Bored in library, let\'s talk 📚'
];

export const CreateSparkModal: React.FC<CreateSparkModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userCoords
}) => {
  const [text, setText] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [radius, setRadius] = useState<number>(200);
  const [accessType, setAccessType] = useState<'public' | 'private'>('public');
  const [passkey, setPasskey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.length < 3 || text.length > 140) {
      setError('Spark intent must be between 3 and 140 characters.');
      return;
    }

    if (!userCoords) {
      setError('Location access required to post a Spark.');
      return;
    }

    if (accessType === 'private') {
      if (!passkey || !/^\d{4}$/.test(passkey.trim())) {
        setError('Private rooms require a 4-digit numeric PIN (e.g. 1234).');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      await api.createSpark(
        text.trim(),
        duration,
        userCoords.latitude,
        userCoords.longitude,
        radius,
        placeName.trim() || undefined,
        accessType,
        accessType === 'private' ? passkey.trim() : undefined
      );
      setText('');
      setPlaceName('');
      setPasskey('');
      setAccessType('public');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create spark');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-24 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-md p-4 sm:p-5 rounded-2xl border border-[var(--neon-cyan)]/40 shadow-2xl relative max-h-[78vh] sm:max-h-[82vh] overflow-y-auto bg-[#120a2a] custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[var(--hyper-pink)]/20 border border-[var(--hyper-pink)]/40 text-[var(--hyper-pink)] shadow-[0_0_12px_rgba(255,0,127,0.3)]">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Create a Spark</h3>
              <p className="text-[11px] text-white/60 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[var(--neon-cyan)] shrink-0" />
                <span>Nearby ~200m • GPS coordinates hidden</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          {/* Quick Suggestions */}
          <div>
            <label className="block text-[11px] font-bold text-white/70 mb-1.5 uppercase tracking-wider">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setText(suggestion)}
                  className="px-2.5 py-1 text-xs rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-[var(--neon-cyan)]/20 hover:border-[var(--neon-cyan)]/50 transition-all text-left cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Intent Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">
                Intent Text
              </label>
              <span className={`text-[10px] ${text.length > 140 ? 'text-rose-400 font-bold' : 'text-white/40'}`}>
                {text.length} / 140
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What are you up to or looking for? (e.g., Anyone for coffee?)"
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-1 focus:ring-[var(--neon-cyan)] transition-all resize-none"
            />
          </div>

          {/* Optional Meetup Place Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--hyper-pink)]" />
                <span>Meetup Place / Location</span>
                <span className="text-[10px] text-white/40 normal-case font-normal">(Optional)</span>
              </label>
              <span className={`text-[10px] ${placeName.length > 60 ? 'text-rose-400 font-bold' : 'text-white/40'}`}>
                {placeName.length} / 60
              </span>
            </div>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g. Campus Canteen, Block B Stairs, Library 2nd Floor"
              maxLength={60}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[var(--hyper-pink)] focus:ring-1 focus:ring-[var(--hyper-pink)] transition-all"
            />
          </div>

          {/* Room Access Control (Public vs Private Passkey) */}
          <div>
            <label className="block text-[11px] font-bold text-white/70 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Room Privacy</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setAccessType('public')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  accessType === 'public'
                    ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>🌐 Public (Open)</span>
              </button>

              <button
                type="button"
                onClick={() => setAccessType('private')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  accessType === 'private'
                    ? 'bg-gradient-to-r from-purple-500/30 to-pink-600/30 border-purple-400 text-purple-300'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>🔒 Private (PIN)</span>
              </button>
            </div>

            {accessType === 'private' && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-1.5">
                <label className="block text-[11px] font-bold text-purple-300">
                  Set 4-Digit Passkey PIN:
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1234"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-purple-500/50 text-white text-center font-mono tracking-widest text-sm focus:outline-none focus:border-purple-400 font-bold"
                />
                <p className="text-[10px] text-purple-300/70">
                  Share this 4-digit PIN with nearby friends so they can join your room.
                </p>
              </div>
            )}
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-[11px] font-bold text-white/70 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
              <span>Room Active Duration</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[10, 20, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    duration === mins
                      ? 'bg-gradient-to-r from-[var(--neon-cyan)] to-blue-600 text-white border-[var(--neon-cyan)] shadow-[0_0_12px_rgba(0,245,255,0.3)]'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {mins === 60 ? '1 Hour' : `${mins} min`}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Radius Selector */}
          <div>
            <label className="block text-[11px] font-bold text-white/70 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[var(--hyper-pink)]" />
              <span>Visibility Radius</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[50, 100, 200].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    radius === r
                      ? 'bg-gradient-to-r from-[var(--hyper-pink)] to-[var(--electric-violet)] text-white border-pink-400 shadow-[0_0_12px_rgba(255,0,127,0.3)]'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  ~{r}m range
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons - Prominent, Fully Visible at the End */}
          <div className="flex items-center justify-end gap-3 pt-3 pb-2 border-t border-white/10 sticky bottom-0 bg-[#120a2a]/95 backdrop-blur-md -mx-1 px-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || text.trim().length < 3 || text.trim().length > 140}
              className="px-5 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-[var(--hyper-pink)] via-[var(--electric-violet)] to-[var(--neon-cyan)] text-white shadow-[0_0_20px_rgba(255,0,127,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{loading ? 'Publishing...' : 'Publish Spark ⚡'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
