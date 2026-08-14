import React, { useState } from 'react';
import { NearbyUser, MoodType } from '../types/discovery';
import { Shield, Flag, Ban, VolumeX, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import { moderationService } from '../services/moderationService';

interface UserCardProps {
  user: NearbyUser;
  onWaveClick?: (user: NearbyUser) => void;
  onChatClick?: (conversationId: string) => void;
  onComplimentClick?: (user: NearbyUser) => void;
  onReportClick?: (user: NearbyUser) => void;
  onBlockSuccess?: (echoId: string) => void;
}

const MOOD_EMOJI_MAP: Record<NonNullable<MoodType>, { emoji: string; label: string }> = {
  chill: { emoji: '🙂', label: 'Chill' },
  studying: { emoji: '📚', label: 'Studying' },
  coffee: { emoji: '☕', label: 'Coffee Break' },
  coding: { emoji: '💻', label: 'Coding' },
  bored: { emoji: '😴', label: 'Bored' },
  gaming: { emoji: '🎮', label: 'Gaming' },
  free: { emoji: '😄', label: 'Free' }
};

const AURA_GRADIENTS: Record<string, string> = {
  cyberpunk: 'from-[var(--neon-cyan)] via-[var(--electric-violet)] to-[var(--hyper-pink)] shadow-[0_0_15px_rgba(0,245,255,0.4)]',
  sunrise: 'from-amber-400 via-rose-500 to-orange-500 shadow-[0_0_15px_rgba(251,191,36,0.4)]',
  lavender: 'from-indigo-400 via-purple-500 to-pink-400 shadow-[0_0_15px_rgba(129,140,248,0.4)]',
  midnight: 'from-blue-600 via-indigo-600 to-slate-800 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
};

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onWaveClick,
  onChatClick,
  onComplimentClick,
  onReportClick,
  onBlockSuccess
}) => {
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const moodInfo = user.mood ? MOOD_EMOJI_MAP[user.mood] : null;

  const auraGradientClass =
    AURA_GRADIENTS[user.auraTheme || 'cyberpunk'] || AURA_GRADIENTS['cyberpunk'];

  const getPresenceDotColor = () => {
    switch (user.presenceStatus) {
      case 'online':
        return '#39FF14'; // Acid lime
      case 'away':
        return '#FFE600'; // Yellow
      case 'offline':
      default:
        return '#6B7280'; // Gray
    }
  };

  const handleBlock = async () => {
    if (window.confirm(`Are you sure you want to block ${user.username} (${user.echoId})?`)) {
      try {
        await moderationService.blockUser(user.echoId);
        if (onBlockSuccess) onBlockSuccess(user.echoId);
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to block user');
      }
    }
  };

  const handleMute = async () => {
    try {
      await moderationService.muteUser(user.echoId);
      alert(`Muted notifications from ${user.username}`);
      setShowSafetyMenu(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to mute user');
    }
  };

  return (
    <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-white/10 hover:border-[var(--neon-cyan)]/40 transition-all duration-300 shadow-lg relative group">
      <div className="flex items-center justify-between gap-2">
        {/* User Avatar + Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr ${auraGradientClass} p-[2px]`}>
              <div className="w-full h-full rounded-full bg-[#0d0722] flex items-center justify-center text-white font-extrabold text-sm sm:text-base">
                {user.avatarIcon ? (
                  <span className="text-base sm:text-lg">{user.avatarIcon}</span>
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <span
              className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-[#0d0722] shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: getPresenceDotColor() }}
              title={user.presenceLabel}
            />
          </div>

          {/* User Metadata: 2 Compact Horizontal Rows */}
          <div className="min-w-0 flex-1 space-y-1">
            {/* Row 1: Username + Echo ID + Distance */}
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide truncate">{user.username}</h3>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30 font-bold shrink-0">
                {user.echoId}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15 font-bold shrink-0">
                {user.distance}
              </span>
            </div>

            {/* Row 2: Location Context Label */}
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-white/60">
              <MapPin className="w-3 h-3 text-[var(--hyper-pink)] shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-[200px] font-medium">{user.contextLabel}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Direct Chat 💬 if already connected, else Wave 👋) + Secret Compliment ✨ & Safety Options */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {onComplimentClick && (
            <button
              type="button"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--hyper-pink)]/15 border border-[var(--hyper-pink)]/30 hover:bg-[var(--hyper-pink)]/30 text-[var(--hyper-pink)] transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105"
              onClick={() => onComplimentClick(user)}
              title={`Send Secret Compliment ✨ to ${user.username}`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {user.hasExistingConnection && user.conversationId && onChatClick ? (
            <button
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-extrabold text-[11px] sm:text-xs shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer"
              onClick={() => onChatClick(user.conversationId!)}
              title={`Open chat with ${user.username}`}
            >
              <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Chat</span>
            </button>
          ) : (
            <button
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[var(--hyper-pink)] to-[var(--electric-violet)] text-white font-bold text-sm sm:text-lg shadow-[0_0_15px_rgba(255,0,127,0.35)] hover:shadow-[0_0_25px_rgba(255,0,127,0.6)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              onClick={() => onWaveClick?.(user)}
              title={`Send Wave 👋 to ${user.username}`}
            >
              👋
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSafetyMenu((prev) => !prev)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer"
            title="Safety Options"
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Safety Dropdown Menu */}
      {showSafetyMenu && (
        <div className="absolute top-14 right-3 bg-[#130a2a] border border-white/20 rounded-xl p-1.5 z-30 shadow-2xl flex flex-col gap-1 min-w-[130px] animate-fade-in">
          <button
            onClick={handleMute}
            className="flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:bg-white/10 rounded-lg text-left transition-colors cursor-pointer"
          >
            <VolumeX size={14} /> Mute
          </button>
          <button
            onClick={handleBlock}
            className="flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg text-left transition-colors cursor-pointer"
          >
            <Ban size={14} /> Block
          </button>
          <button
            onClick={() => {
              setShowSafetyMenu(false);
              onReportClick?.(user);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg text-left transition-colors cursor-pointer"
          >
            <Flag size={14} /> Report
          </button>
        </div>
      )}

      {/* Mood & Ephemeral Vibe Note Badges */}
      {(moodInfo || user.vibeStatusNote) && (
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-2 flex-wrap">
          {moodInfo && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--electric-violet)]/20 text-[var(--neon-cyan)] border border-[var(--electric-violet)]/40 font-semibold flex items-center gap-1.5">
              <span>{moodInfo.emoji}</span>
              <span>{moodInfo.label}</span>
            </span>
          )}

          {user.vibeStatusNote && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/15 font-medium flex items-center gap-1.5 max-w-full">
              <span>✨</span>
              <span className="italic truncate">{user.vibeStatusNote}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
