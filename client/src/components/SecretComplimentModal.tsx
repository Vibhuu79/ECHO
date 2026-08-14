import React, { useState, useEffect } from 'react';
import { Sparkles, X, Clock, AlertCircle, Send, CheckCircle2, User } from 'lucide-react';
import { complimentService, ComplimentTemplate, ComplimentStatus } from '../services/complimentService';

interface SecretComplimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: {
    echoId: string;
    username: string;
  };
  nearbyUsers?: Array<{ echoId: string; username: string }>;
  onSuccess?: (msg: string) => void;
}

export const SecretComplimentModal: React.FC<SecretComplimentModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  nearbyUsers = [],
  onSuccess
}) => {
  const [status, setStatus] = useState<ComplimentStatus | null>(null);
  const [templates, setTemplates] = useState<ComplimentTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Vibe');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [targetEchoId, setTargetEchoId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (targetUser) {
        setTargetEchoId(targetUser.echoId);
      } else if (nearbyUsers.length > 0 && !targetEchoId) {
        setTargetEchoId(nearbyUsers[0].echoId);
      }
      loadInitialData();
    }
  }, [isOpen, targetUser]);

  const loadInitialData = async () => {
    if (templates.length === 0) {
      setFetching(true);
    }
    setError('');

    try {
      const [statusRes, templatesRes] = await Promise.all([
        complimentService.getStatus(),
        templates.length === 0 ? complimentService.getTemplates() : Promise.resolve(templates)
      ]);

      setStatus(statusRes);
      if (templates.length === 0 && templatesRes.length > 0) {
        setTemplates(templatesRes);
        setSelectedTemplateId(templatesRes[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load compliment data');
    } finally {
      setFetching(false);
    }
  };

  if (!isOpen) return null;

  const categories = Array.from(new Set(templates.map((t) => t.category)));
  const filteredTemplates = templates.filter((t) => t.category === selectedCategory);

  const formatCountdown = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const handleSend = async () => {
    if (!targetEchoId) {
      setError('Please select a recipient.');
      return;
    }
    if (!selectedTemplateId) {
      setError('Please select a compliment template.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await complimentService.sendCompliment(targetEchoId, selectedTemplateId);
      if (onSuccess) onSuccess(res.message);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send secret compliment.');
    } finally {
      setLoading(false);
    }
  };

  const formattedEchoId = (rawId: string) => {
    if (!rawId) return '';
    return rawId.startsWith('#') ? rawId : `#${rawId}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pb-20 sm:pb-28 pt-4 sm:pt-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="glass-card w-full max-w-md rounded-3xl border border-[var(--hyper-pink)]/40 shadow-[0_0_30px_rgba(255,0,127,0.25)] bg-[#120a2a] relative max-h-[80vh] sm:max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* FIXED HEADER (Never cut off at top) */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#120a2a] z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[var(--hyper-pink)]/20 border border-[var(--hyper-pink)]/40 text-[var(--hyper-pink)] shadow-[0_0_12px_rgba(255,0,127,0.3)] shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                Send Secret Compliment
              </h2>
              <p className="text-[11px] text-white/60">
                100% Anonymous • Delivered instantly • 1 per day
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE INNER BODY + SCROLLABLE FOOTER (Scrolls smoothly on laptop with extra bottom headroom) */}
        <div className="p-4 sm:p-5 pb-6 sm:pb-8 space-y-4 flex-1 overflow-y-auto min-h-0">
          {fetching && templates.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/60">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--hyper-pink)] border-t-transparent animate-spin" />
              <p className="text-xs font-semibold">Loading compliment templates...</p>
            </div>
          ) : (
            <>
              {/* Status Banner */}
              {status && (
                <div
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 shadow-md ${
                    status.available
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  }`}
                >
                  {status.available ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>✨ <strong>1 Secret Compliment</strong> available for today!</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                      <span>
                        ⏱️ Daily compliment sent! Next unlocks in <strong>{formatCountdown(status.resetInSeconds)}</strong>
                      </span>
                    </>
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Target User Recipient Selector */}
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1.5 uppercase tracking-wider">
                  Recipient (Nearby User)
                </label>
                {targetUser ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/15">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[var(--hyper-pink)]" />
                      <span className="text-xs font-bold text-white">@{targetUser.username}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30 font-bold">
                      {formattedEchoId(targetUser.echoId)}
                    </span>
                  </div>
                ) : (
                  <select
                    value={targetEchoId}
                    onChange={(e) => setTargetEchoId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-[var(--hyper-pink)] transition-all cursor-pointer"
                    disabled={!status?.available}
                  >
                    <option value="" disabled className="bg-[#120a2a]">-- Select a nearby user --</option>
                    {nearbyUsers.map((u) => (
                      <option key={u.echoId} value={u.echoId} className="bg-[#120a2a]">
                        {u.username} ({formattedEchoId(u.echoId)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Category Tabs */}
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1.5 uppercase tracking-wider">
                  Select Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          const firstInCat = templates.find((t) => t.category === cat);
                          if (firstInCat) setSelectedTemplateId(firstInCat.id);
                        }}
                        disabled={!status?.available}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-gradient-to-r from-[var(--hyper-pink)] to-[var(--electric-violet)] text-white border-pink-400 shadow-[0_0_12px_rgba(255,0,127,0.3)] scale-105'
                            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pre-Written Compliment Notes (Full Display) */}
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1.5 uppercase tracking-wider">
                  Choose Compliment Note
                </label>
                <div className="space-y-2">
                  {filteredTemplates.map((t) => {
                    const isSelected = selectedTemplateId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => status?.available && setSelectedTemplateId(t.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[var(--hyper-pink)]/20 border-[var(--hyper-pink)] text-white shadow-[0_0_15px_rgba(255,0,127,0.25)]'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <p className="text-xs font-medium italic leading-relaxed">
                          "{t.text}"
                        </p>
                        <div
                          className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-[var(--hyper-pink)] bg-[var(--hyper-pink)]'
                              : 'border-white/30'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Footer Buttons (Scrollable together inside body flow with bottom headroom) */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading || !status?.available || !targetEchoId || !selectedTemplateId}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--hyper-pink)] via-purple-600 to-[var(--electric-violet)] text-white text-xs font-extrabold shadow-[0_0_15px_rgba(255,0,127,0.4)] hover:shadow-[0_0_25px_rgba(255,0,127,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:scale-100"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending Compliment...' : 'Send Secret Compliment ✨'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
