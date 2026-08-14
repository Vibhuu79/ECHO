import React, { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { usePresence } from '../hooks/usePresence';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';
import { NearbyUser, MoodType } from '../types/discovery';
import { UserCard } from '../components/UserCard';
import { MoodSelectorModal } from '../components/MoodSelectorModal';
import { SendWaveModal } from '../components/wave/SendWaveModal';
import { SecretComplimentModal } from '../components/SecretComplimentModal';
import { ReceivedComplimentsModal } from '../components/profile/ReceivedComplimentsModal';
import { ReportModal } from '../components/ReportModal';
import { RadarScanAnimation } from '../components/RadarScanAnimation';
import { Sparkles, Smile, RefreshCw, AlertTriangle } from 'lucide-react';

interface NearbyTabProps {
  currentUser: {
    username: string;
    echoId: string;
    mood?: MoodType;
  };
}

const FILTER_MOODS: { label: string; value: MoodType | 'all' }[] = [
  { label: 'All Users', value: 'all' },
  { label: '🙂 Chill', value: 'chill' },
  { label: '📚 Studying', value: 'studying' },
  { label: '☕ Coffee', value: 'coffee' },
  { label: '💻 Coding', value: 'coding' },
  { label: '😴 Bored', value: 'bored' },
  { label: '🎮 Gaming', value: 'gaming' },
  { label: '😄 Free', value: 'free' }
];

export const NearbyTab: React.FC<NearbyTabProps> = ({ currentUser }) => {
  const { setActiveChatId } = useSocket();
  const { location, error: geoError, loading: geoLoading, refreshLocation } = useGeolocation();
  const [users, setUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchRadius, setSearchRadius] = useState<number>(200);
  const [selectedFilter, setSelectedFilter] = useState<MoodType | 'all'>('all');
  const [currentMood, setCurrentMood] = useState<MoodType>(currentUser.mood || null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState<boolean>(false);
  const [selectedWaveUser, setSelectedWaveUser] = useState<NearbyUser | null>(null);
  const [selectedComplimentUser, setSelectedComplimentUser] = useState<NearbyUser | null>(null);
  const [isComplimentModalOpen, setIsComplimentModalOpen] = useState<boolean>(false);
  const [isReceivedComplimentsModalOpen, setIsReceivedComplimentsModalOpen] = useState<boolean>(false);
  const [selectedReportUser, setSelectedReportUser] = useState<NearbyUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchNearbyUsers = useCallback(async (isManualTrigger = false, overrideRadius?: number) => {
    const radiusToUse = overrideRadius || searchRadius;
    if (isManualTrigger) {
      setRefreshing(true);
    }

    try {
      const res = await api.getNearbyUsers(
        location.latitude ?? undefined,
        location.longitude ?? undefined,
        radiusToUse
      );
      setUsers(res.users);
    } catch (err: any) {
      console.error('Failed to fetch nearby users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [location.latitude, location.longitude, searchRadius]);

  // Initial fetch when location resolves
  useEffect(() => {
    fetchNearbyUsers(false);
  }, [fetchNearbyUsers]);

  // Silent background polling every 10 seconds without flickering UI or showing spinners
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchNearbyUsers(false);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchNearbyUsers]);

  // Handle Socket.IO Real-time presence updates
  usePresence({
    onUserOnline: (payload) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === payload.userId
            ? { ...u, presenceStatus: 'online', presenceLabel: 'Active Now' }
            : u
        )
      );
    },
    onUserAway: (payload) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === payload.userId
            ? { ...u, presenceStatus: 'away', presenceLabel: 'Away' }
            : u
        )
      );
    },
    onUserOffline: (payload) => {
      setUsers((prev) =>
        prev.filter((u) => u.id !== payload.userId)
      );
    },
    onMoodUpdate: (payload) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === payload.userId
            ? { ...u, mood: (payload.mood as MoodType) || null }
            : u
        )
      );
    }
  });

  const handleMoodSelect = async (mood: MoodType) => {
    try {
      setCurrentMood(mood);
      await api.updateMood(mood);
      showToast(mood ? `Mood updated to ${mood}!` : 'Mood cleared');
    } catch (err) {
      console.error('Failed to update mood:', err);
    }
  };

  const handleWaveClick = (targetUser: NearbyUser) => {
    setSelectedWaveUser(targetUser);
  };

  const handleBlockSuccess = (echoId: string) => {
    setUsers((prev) => prev.filter((u) => u.echoId !== echoId));
    showToast('User blocked');
  };

  const handleRadarScanClick = async () => {
    if (refreshing) return;
    const nextRadius = searchRadius === 200 ? 300 : searchRadius === 300 ? 500 : 200;
    setSearchRadius(nextRadius);
    setRefreshing(true);
    showToast(`Scanning nearby nodes (~${nextRadius}m range)...`);
    refreshLocation();

    const scanPromise = fetchNearbyUsers(true, nextRadius);
    const minFiveSecDelay = new Promise((resolve) => setTimeout(resolve, 5000));

    await Promise.all([scanPromise, minFiveSecDelay]);
    setRefreshing(false);
  };

  const filteredUsers = users.filter((u) => {
    if (u.presenceStatus === 'offline') return false;
    if (selectedFilter === 'all') return true;
    return u.mood === selectedFilter;
  });

  return (
    <div className="flex flex-col space-y-4 p-3 sm:p-4 max-w-2xl mx-auto pb-24 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--hyper-pink)] text-white text-xs font-bold shadow-[0_0_20px_rgba(0,245,255,0.4)] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Cyber Profile Header Card */}
      <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-[var(--border-neon-glass)] bg-gradient-to-r from-[var(--electric-violet)]/15 via-[#130a2a] to-[var(--hyper-pink)]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
          <div className="relative shrink-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[var(--neon-cyan)] via-[var(--electric-violet)] to-[var(--hyper-pink)] p-[2px] shadow-[0_0_15px_rgba(0,245,255,0.3)]">
              <div className="w-full h-full rounded-full bg-[#0c0620] flex items-center justify-center text-white font-black text-base sm:text-lg">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[var(--acid-lime)] border-2 border-[#0c0620] shadow-[0_0_8px_var(--acid-lime)]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-extrabold text-white tracking-wide truncate">{currentUser.username}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30 font-bold shrink-0">
                {currentUser.echoId}
              </span>
            </div>
            <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-[var(--hyper-pink)] shrink-0" />
              <span className="truncate">{currentMood ? `Mood: ${currentMood}` : 'No mood active'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsReceivedComplimentsModalOpen(true)}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-[var(--hyper-pink)]/20 hover:bg-[var(--hyper-pink)]/30 text-pink-300 border border-pink-500/40 text-xs font-bold shadow-[0_0_12px_rgba(255,0,127,0.2)] hover:scale-105 transition-all flex items-center justify-center gap-1 cursor-pointer"
            title="View Received Secret Compliments"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--hyper-pink)] animate-pulse" />
            <span>Compliments</span>
          </button>

          <button
            onClick={() => setIsMoodModalOpen(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--electric-violet)] text-white text-xs font-bold shadow-[0_0_15px_rgba(0,245,255,0.25)] hover:shadow-[0_0_25px_rgba(0,245,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Smile className="w-3.5 h-3.5" />
            <span>{currentMood ? 'Change Mood' : 'Set Mood ＋'}</span>
          </button>
        </div>
      </div>

      {/* Mood Filter Multi-Row Wrap Bar */}
      <div className="flex flex-wrap items-center gap-1.5 py-1 px-0.5 max-w-full">
        {FILTER_MOODS.map((item) => {
          const isActive = selectedFilter === item.value;
          return (
            <button
              key={item.value}
              onClick={() => setSelectedFilter(item.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--hyper-pink)] to-[var(--electric-violet)] text-white shadow-[0_0_12px_rgba(255,0,127,0.4)] border border-pink-400/50 scale-105'
                  : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Location Permission Warning Banner */}
      {geoError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="leading-snug">{geoError}</p>
          </div>
          <button
            onClick={() => refreshLocation()}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-200 font-bold hover:bg-rose-500/30 shrink-0 transition-all"
          >
            Retry GPS
          </button>
        </div>
      )}

      {/* Radar Scanner & Feed Container */}
      <div className="space-y-3">
        {(loading || geoLoading) && users.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-white/60">
            <RefreshCw className="w-8 h-8 animate-spin text-[var(--neon-cyan)]" />
            <p className="text-xs font-semibold tracking-wide">Pinging nearby radar nodes...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass-card py-6 rounded-2xl border border-white/10">
            <RadarScanAnimation
              onScanClick={handleRadarScanClick}
              isScanning={refreshing}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onWaveClick={handleWaveClick}
                  onChatClick={(convId) => setActiveChatId(convId)}
                  onComplimentClick={(u) => {
                    setSelectedComplimentUser(u);
                    setIsComplimentModalOpen(true);
                  }}
                  onReportClick={(u) => setSelectedReportUser(u)}
                  onBlockSuccess={handleBlockSuccess}
                />
              ))}
            </div>

            {/* Radar Pulse Scan Action Button below user list & above footer */}
            <button
              onClick={handleRadarScanClick}
              disabled={refreshing}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[var(--neon-cyan)] via-[var(--electric-violet)] to-[var(--hyper-pink)] text-white text-xs font-extrabold tracking-wider uppercase shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,127,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>
                {refreshing
                  ? 'Scanning Nearby Nodes...'
                  : `Radar Pulse Scan (~${searchRadius}m range)`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <MoodSelectorModal
        currentMood={currentMood}
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        onSelectMood={handleMoodSelect}
      />

      <SendWaveModal
        user={selectedWaveUser}
        onClose={() => setSelectedWaveUser(null)}
      />

      <SecretComplimentModal
        isOpen={isComplimentModalOpen}
        onClose={() => {
          setIsComplimentModalOpen(false);
          setSelectedComplimentUser(null);
        }}
        targetUser={selectedComplimentUser ? { username: selectedComplimentUser.username, echoId: selectedComplimentUser.echoId } : undefined}
        nearbyUsers={users.map((u) => ({ username: u.username, echoId: u.echoId }))}
        onSuccess={(msg) => showToast(msg)}
      />

      <ReceivedComplimentsModal
        isOpen={isReceivedComplimentsModalOpen}
        onClose={() => setIsReceivedComplimentsModalOpen(false)}
      />

      <ReportModal
        isOpen={!!selectedReportUser}
        targetEchoId={selectedReportUser?.echoId || ''}
        targetUsername={selectedReportUser?.username}
        onClose={() => setSelectedReportUser(null)}
        onSuccess={() => showToast('Report submitted successfully')}
      />
    </div>
  );
};
