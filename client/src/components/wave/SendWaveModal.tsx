import React, { useState, useEffect } from 'react';
import { NearbyUser, IcebreakerItem } from '../../types';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Hand, MessageSquare, X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface SendWaveModalProps {
  user: NearbyUser | null;
  onClose: () => void;
}

export const SendWaveModal: React.FC<SendWaveModalProps> = ({ user, onClose }) => {
  const { sendWave } = useSocket();
  const [icebreakers, setIcebreakers] = useState<IcebreakerItem[]>([]);
  const [selectedIcebreaker, setSelectedIcebreaker] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.getIcebreakers()
        .then((res) => setIcebreakers(res.icebreakers || []))
        .catch((err) => console.error('Failed to load icebreakers:', err));
    }
  }, [user]);

  if (!user) return null;

  const handleSendWave = async () => {
    setLoading(true);
    setError(null);
    try {
      const iceBreakerToUse = customText.trim() || (selectedIcebreaker ? icebreakers.find(i => i.id === selectedIcebreaker || i._id === selectedIcebreaker)?.text : undefined);
      await sendWave(user.echoId, iceBreakerToUse);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send Wave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#12141d]/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-white/10">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xl shadow-lg">
            👋
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white">{user.username}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                {user.echoId}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              {user.contextLabel || 'Nearby'} • {user.distance} away
            </p>
            {user.mood && (
              <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/80">
                Mood: {user.mood}
              </span>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h4 className="text-lg font-medium text-white">Wave Sent Successfully! 👋</h4>
            <p className="text-xs text-white/60">You will be notified when {user.username} accepts.</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Wave Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Choose an Icebreaker Question (Optional)</span>
                </label>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {icebreakers.map((item) => {
                    const itemId = item.id || item._id || item.text;
                    const isSelected = selectedIcebreaker === itemId;
                    return (
                      <button
                        key={itemId}
                        type="button"
                        onClick={() => {
                          setSelectedIcebreaker(isSelected ? null : itemId);
                          setCustomText('');
                        }}
                        className={`w-full text-left p-3 text-xs rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        "{item.text}"
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Or Write Custom Icebreaker</span>
                </label>
                <input
                  type="text"
                  maxLength={150}
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value);
                    if (e.target.value) setSelectedIcebreaker(null);
                  }}
                  placeholder="Hey, noticed you're coding too!"
                  className="w-full px-3 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendWave}
                  disabled={loading}
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Hand className="w-4 h-4" />
                      <span>Send Wave 👋</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
