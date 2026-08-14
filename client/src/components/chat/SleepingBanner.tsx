import React, { useState } from 'react';
import { Moon, Play } from 'lucide-react';

interface SleepingBannerProps {
  onContinue: () => Promise<void>;
}

export const SleepingBanner: React.FC<SleepingBannerProps> = ({ onContinue }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await onContinue();
    } catch (err) {
      console.error('Failed to continue chat:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-4 my-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-2">
        <Moon className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <div>
          <span className="font-semibold text-amber-300">Conversation Sleeping 😴</span>
          <p className="text-[11px] text-amber-200/70">10 mins of inactivity. Continue talking?</p>
        </div>
      </div>
      <button
        onClick={handleContinue}
        disabled={loading}
        className="px-3 py-1.5 bg-amber-500 text-slate-950 font-semibold rounded-lg hover:bg-amber-400 transition-all flex items-center space-x-1 shadow-md text-xs shrink-0 disabled:opacity-50"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>{loading ? 'Waking...' : 'Continue'}</span>
      </button>
    </div>
  );
};
