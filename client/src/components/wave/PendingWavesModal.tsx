import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Hand, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

interface PendingWavesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PendingWavesModal: React.FC<PendingWavesModalProps> = ({ isOpen, onClose }) => {
  const { pendingWaves, acceptWave, ignoreWave, blockWave, setActiveChatId } = useSocket();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAccept = async (waveId: string) => {
    setLoadingId(waveId);
    try {
      const conversationId = await acceptWave(waveId);
      onClose();
      setActiveChatId(conversationId);
    } catch (err) {
      console.error('Accept Wave failed:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleIgnore = async (waveId: string) => {
    setLoadingId(waveId);
    try {
      await ignoreWave(waveId);
    } catch (err) {
      console.error('Ignore Wave failed:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleBlock = async (waveId: string) => {
    setLoadingId(waveId);
    try {
      await blockWave(waveId);
    } catch (err) {
      console.error('Block Wave failed:', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#12141d]/95 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Hand className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="text-base font-semibold text-white">Pending Waves 👋</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
              {pendingWaves.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {pendingWaves.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Hand className="w-12 h-12 text-white/20 mx-auto" />
              <p className="text-sm text-white/50">No pending wave requests right now.</p>
              <p className="text-xs text-white/30">People nearby will show up here when they wave at you!</p>
            </div>
          ) : (
            pendingWaves.map((wave) => (
              <div
                key={wave.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      👋
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-white">{wave.fromUser.username}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                          {wave.fromUser.echoId}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">
                        {wave.fromUser.locationLabel || 'Nearby'}
                        {wave.fromUser.mood ? ` • ${wave.fromUser.mood}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {wave.icebreaker && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200 flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>"{wave.icebreaker}"</span>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    onClick={() => handleBlock(wave.id)}
                    disabled={loadingId === wave.id}
                    className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors text-xs flex items-center space-x-1"
                    title="Block User"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleIgnore(wave.id)}
                    disabled={loadingId === wave.id}
                    className="px-3 py-2 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Ignore
                  </button>
                  <button
                    onClick={() => handleAccept(wave.id)}
                    disabled={loadingId === wave.id}
                    className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept & Chat</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
