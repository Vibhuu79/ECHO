import React, { useState, useEffect } from 'react';
import { Sparkles, X, RefreshCw, Heart, Award, Zap, Compass, Smile } from 'lucide-react';
import { complimentService, ReceivedCompliment } from '../../services/complimentService';

interface ReceivedComplimentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Vibe: <Sparkles className="w-4 h-4 text-pink-400" />,
  Focus: <Zap className="w-4 h-4 text-cyan-400" />,
  Creativity: <Compass className="w-4 h-4 text-purple-400" />,
  Kindness: <Heart className="w-4 h-4 text-rose-400" />,
  General: <Smile className="w-4 h-4 text-amber-400" />
};

export const ReceivedComplimentsModal: React.FC<ReceivedComplimentsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [compliments, setCompliments] = useState<ReceivedCompliment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCompliments();
    }
  }, [isOpen]);

  const fetchCompliments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await complimentService.getReceivedCompliments();
      setCompliments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load received compliments.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatRelativeTime = (dateStr: string) => {
    const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-16 sm:pb-20 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-md p-4 sm:p-5 rounded-2xl border border-[var(--hyper-pink)]/40 shadow-2xl relative max-h-[85vh] overflow-y-auto bg-[#120a2a] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[var(--hyper-pink)]/20 border border-[var(--hyper-pink)]/40 text-[var(--hyper-pink)] shadow-[0_0_12px_rgba(255,0,127,0.3)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Secret Compliments</h3>
              <p className="text-[11px] text-white/60">Anonymous notes of encouragement from nearby people</p>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-white/60">
              <RefreshCw className="w-6 h-6 animate-spin text-[var(--hyper-pink)]" />
              <p className="text-xs">Fetching your secret compliments...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/30">
              {error}
            </div>
          ) : compliments.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-white/40">
              <Award className="w-10 h-10 text-[var(--hyper-pink)]/40" />
              <p className="text-xs font-bold text-white/70">No Secret Compliments Yet</p>
              <p className="text-[11px] text-white/40 max-w-[220px]">
                Keep active on Echo! Someone nearby will send a secret compliment your way soon.
              </p>
            </div>
          ) : (
            compliments.map((comp) => {
              const icon = CATEGORY_ICONS[comp.category] || CATEGORY_ICONS['General'];
              return (
                <div
                  key={comp.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--hyper-pink)]/40 transition-all space-y-2 shadow-md relative group"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--hyper-pink)]/15 text-[var(--hyper-pink)] border border-[var(--hyper-pink)]/30 font-bold flex items-center gap-1.5">
                      {icon}
                      <span>{comp.category}</span>
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      {formatRelativeTime(comp.receivedAt)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-white/90 leading-relaxed italic">
                    "{comp.text}"
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-white/40 border-t border-white/5">
                    <span>From someone nearby</span>
                    <span>100% Anonymous</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
