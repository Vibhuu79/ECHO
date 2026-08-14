import React, { useState, useEffect, useCallback } from 'react';
import { Zap, RefreshCw, Plus, MapPin, Users, Clock, Compass, Shield, Lock } from 'lucide-react';
import { api } from '../services/api';
import { Spark } from '../types/spark';
import { useSocket } from '../context/SocketContext';
import { CreateSparkModal } from '../components/spark/CreateSparkModal';
import { SparkRoomModal } from '../components/spark/SparkRoomModal';

const SUGGESTED_SPARKS = [
  '☕ Anyone for chai?',
  '💻 Need React / TS help',
  '🎮 Valorant / BGMI squad',
  '📚 Library study session',
  '🍔 Lunch at canteen?'
];

interface SparkFeedItemProps {
  spark: Spark;
  onJoin: (spark: Spark) => void;
  onEnter: (sparkId: string) => void;
}

const SparkFeedItem: React.FC<SparkFeedItemProps> = ({ spark, onJoin, onEnter }) => {
  const [remainingSec, setRemainingSec] = useState<number>(() => {
    const expiresAt = new Date(spark.expiresAt).getTime();
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  });

  useEffect(() => {
    const calc = () => {
      const expiresAt = new Date(spark.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemainingSec(diff);
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [spark.expiresAt]);

  const formatRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-white/10 hover:border-[var(--hyper-pink)]/40 transition-all duration-300 shadow-xl flex flex-col gap-3 relative group w-full max-w-full overflow-hidden box-sizing-border">
      {/* Card Header: Row 1 (Creator Identity) & Row 2 (Badges) */}
      <div className="flex flex-col gap-2.5 w-full">
        {/* Creator Info */}
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--hyper-pink)] to-[var(--electric-violet)] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
              {spark.creator.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-white truncate max-w-[110px] sm:max-w-[180px]">@{spark.creator.username}</span>
                <span className="text-[10px] font-mono text-[var(--neon-cyan)] font-bold shrink-0">{spark.creator.echoId}</span>
              </div>
              <span className="text-[10px] text-white/50 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[var(--neon-cyan)] shrink-0" />
                <span className="truncate">Within {spark.distance}</span>
              </span>
            </div>
          </div>

          {/* Member count badge */}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-500/10 border border-pink-500/30 text-pink-300 flex items-center gap-1 shrink-0">
            <Users className="w-3 h-3" />
            <span>
              {spark.memberCount}/{spark.maxMembers}
            </span>
          </span>
        </div>

        {/* Room Timing & Visibility Badges Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Privacy Access Badge */}
          {spark.isPrivate ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center gap-1 shrink-0">
              <Lock className="w-3 h-3" />
              <span>Private Room (PIN)</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 shrink-0">
              <span>🌐 Public</span>
            </span>
          )}

          {/* Visibility Radius */}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center gap-1 shrink-0" title="Configured Visibility Radius">
            <Compass className="w-3 h-3 text-indigo-400" />
            <span>~{spark.radius || 200}m radius</span>
          </span>

          {/* Total Created Duration */}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-white/70 flex items-center gap-1 shrink-0" title="Created Duration">
            <Clock className="w-3 h-3 text-white/50" />
            <span>{spark.durationMinutes}m room</span>
          </span>

          {/* Live Remaining Time */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 shrink-0 ${
              remainingSec <= 60
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                : 'bg-[var(--neon-cyan)]/15 border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)]'
            }`}
            title="Live Time Remaining"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] animate-ping" />
            <span>{formatRemaining(remainingSec)} left</span>
          </span>
        </div>
      </div>

      {/* Intent Content */}
      <div className="text-sm font-bold text-white leading-snug bg-white/[0.03] p-3 rounded-xl border border-white/5 flex flex-col gap-1.5">
        <div>"{spark.text}"</div>
        {spark.placeName && (
          <div className="flex items-center gap-1 text-[11px] text-[var(--hyper-pink)] font-semibold border-t border-white/5 pt-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Meetup: {spark.placeName}</span>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-1 text-[10px] text-white/50">
          <Shield className="w-3 h-3 text-[var(--neon-cyan)]" />
          <span>Auto-expiring mini room</span>
        </div>

        {spark.isJoined ? (
          <button
            onClick={() => onEnter(spark.id)}
            className="px-4 py-2 rounded-xl bg-[var(--neon-cyan)]/20 border border-[var(--neon-cyan)]/40 text-[var(--neon-cyan)] text-xs font-bold hover:bg-[var(--neon-cyan)]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,245,255,0.2)]"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Enter Room</span>
          </button>
        ) : (
          <button
            onClick={() => onJoin(spark)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--hyper-pink)] to-[var(--electric-violet)] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,0,127,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {spark.isPrivate ? <Lock className="w-3.5 h-3.5 text-purple-300" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{spark.isPrivate ? 'Enter PIN & Join' : 'Join Room'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const SparksTab: React.FC = () => {
  const { activeSparkId, joinSparkRoom, setActiveSparkId } = useSocket();
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [privatePromptSpark, setPrivatePromptSpark] = useState<Spark | null>(null);
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  // Fetch geolocation
  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Browser location access is required to discover nearby Sparks.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      },
      (err) => {
        console.error('Location error:', err);
        setError('Location permission denied. Please allow GPS location to see nearby Sparks.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Fetch nearby sparks
  const fetchSparks = useCallback(async () => {
    if (!userCoords) return;

    try {
      setRefreshing(true);
      setError(null);
      const res = await api.getNearbySparks(userCoords.latitude, userCoords.longitude, 200, 20);
      setSparks(res.data.sparks || []);
    } catch (err: any) {
      console.error('Failed to fetch nearby sparks:', err);
      setError(err.message || 'Could not load nearby sparks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userCoords]);

  useEffect(() => {
    if (userCoords) {
      fetchSparks();
    }
  }, [userCoords, fetchSparks]);

  const handleJoin = async (spark: Spark) => {
    if (spark.isPrivate) {
      setPrivatePromptSpark(spark);
      setPasskeyInput('');
      setPasskeyError(null);
      return;
    }

    try {
      await joinSparkRoom(spark.id);
    } catch (err: any) {
      alert(err.message || 'Failed to join spark room');
    }
  };

  const handleConfirmPasskeyJoin = async () => {
    if (!privatePromptSpark) return;
    if (!passkeyInput || !/^\d{4}$/.test(passkeyInput.trim())) {
      setPasskeyError('Please enter a valid 4-digit PIN.');
      return;
    }

    try {
      setPasskeyError(null);
      await joinSparkRoom(privatePromptSpark.id, passkeyInput.trim());
      setPrivatePromptSpark(null);
      setPasskeyInput('');
    } catch (err: any) {
      setPasskeyError(err.message || 'Incorrect PIN or banned from room.');
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-3 sm:p-4 max-w-2xl mx-auto pb-24 animate-fade-in relative">
      {/* Cyber Header Banner - Ultra Compact Horizontal Bar */}
      <div className="glass-card px-3 sm:px-4 py-2.5 rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-500/15 via-purple-600/15 to-cyan-500/15 flex items-center justify-between shadow-xl gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-[var(--hyper-pink)] to-[var(--electric-violet)] text-white shadow-[0_0_15px_rgba(255,0,127,0.4)] shrink-0">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
            <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-wide shrink-0">
              Nearby Sparks
            </h2>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 shrink-0 font-bold">
              ~200m
            </span>
            <span className="hidden sm:inline text-[11px] text-white/50 truncate">
              • Temporary intent mini rooms
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={fetchSparks}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
            title="Refresh Sparks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-[var(--hyper-pink)] to-[var(--electric-violet)] text-white text-xs font-extrabold shadow-[0_0_15px_rgba(255,0,127,0.35)] hover:shadow-[0_0_25px_rgba(255,0,127,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Spark</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 shadow-lg">
          <Compass className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-white/60">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--hyper-pink)]" />
          <p className="text-xs font-semibold tracking-wide">Scanning nearby perimeter (~200m) for Sparks...</p>
        </div>
      ) : sparks.length === 0 ? (
        /* Empty State Card */
        <div className="glass-card py-10 px-6 rounded-2xl border border-white/10 text-center flex flex-col items-center gap-4 shadow-xl">
          <div className="p-4 rounded-full bg-gradient-to-tr from-[var(--hyper-pink)]/20 to-[var(--electric-violet)]/20 border border-pink-500/30 text-[var(--hyper-pink)] shadow-[0_0_20px_rgba(255,0,127,0.25)]">
            <Zap className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">No Active Sparks Nearby</h3>
            <p className="text-xs text-white/60 max-w-xs mt-1 leading-relaxed">
              Be the first to ignite a conversation around you! Tap a quick suggestion below:
            </p>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap justify-center gap-2 max-w-sm my-1">
            {SUGGESTED_SPARKS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/40 hover:bg-white/10 text-white/80 text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[var(--hyper-pink)] via-[var(--electric-violet)] to-[var(--neon-cyan)] text-white text-xs font-extrabold tracking-wide shadow-[0_0_25px_rgba(255,0,127,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Spark</span>
          </button>
        </div>
      ) : (
        /* Sparks List Feed */
        <div className="space-y-3">
          {sparks.map((spark) => (
            <SparkFeedItem
              key={spark.id}
              spark={spark}
              onJoin={handleJoin}
              onEnter={(id) => setActiveSparkId(id)}
            />
          ))}
        </div>
      )}

      {/* Private Room Passkey PIN Prompt Modal */}
      {privatePromptSpark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-xs p-5 rounded-2xl border border-purple-500/40 shadow-2xl bg-[#120a2a] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Private Spark Room</h3>
              <p className="text-xs text-white/60 mt-0.5">
                Enter the 4-digit passkey to join @{privatePromptSpark.creator.username}'s room
              </p>
            </div>

            <input
              type="text"
              maxLength={4}
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 1234"
              className="w-full px-4 py-2 rounded-xl bg-black/60 border border-purple-500/50 text-white text-center font-mono tracking-widest text-lg focus:outline-none focus:border-purple-400 font-bold"
            />

            {passkeyError && (
              <p className="text-xs text-rose-400 font-medium break-words px-1">{passkeyError}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPrivatePromptSpark(null)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-white/70 hover:text-white font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPasskeyJoin}
                disabled={passkeyInput.length !== 4}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg transition disabled:opacity-50"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Spark Modal */}
      <CreateSparkModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchSparks}
        userCoords={userCoords}
      />

      {/* Active Spark Room Modal */}
      <SparkRoomModal
        isOpen={!!activeSparkId}
        onClose={() => setActiveSparkId(null)}
      />
    </div>
  );
};
