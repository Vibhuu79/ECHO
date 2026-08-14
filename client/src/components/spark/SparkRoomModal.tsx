import React, { useState, useEffect, useRef } from 'react';
import { Zap, X, Users, Clock, Send, LogOut, Trash2, AlertTriangle, MapPin, Crown, UserX, Lock, ShieldAlert } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

interface SparkRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SparkRoomModal: React.FC<SparkRoomModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const {
    activeSpark,
    sparkMembers,
    sparkMessages,
    sparkWarning,
    sendSparkMessage,
    leaveSparkRoom,
    deleteSparkRoom,
    kickSparkMember
  } = useSocket();

  const [inputContent, setInputContent] = useState('');
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [memberToKick, setMemberToKick] = useState<{ id: string; username: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Countdown timer effect
  useEffect(() => {
    if (!activeSpark) return;

    const calcRemaining = () => {
      const expiresAt = new Date(activeSpark.expiresAt).getTime();
      const diffSec = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemainingTime(diffSec);
    };

    calcRemaining();
    const interval = setInterval(calcRemaining, 1000);
    return () => clearInterval(interval);
  }, [activeSpark]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sparkMessages]);

  if (!isOpen || !activeSpark) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    sendSparkMessage(activeSpark.id, inputContent.trim());
    setInputContent('');
  };

  const handleLeave = async () => {
    await leaveSparkRoom(activeSpark.id);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this Spark room for everyone?')) {
      await deleteSparkRoom(activeSpark.id);
      onClose();
    }
  };

  const handleConfirmKick = async () => {
    if (!memberToKick) return;
    const target = memberToKick;
    setMemberToKick(null);
    try {
      await kickSparkMember(activeSpark.id, target.id);
    } catch (err: any) {
      alert(err.message || 'Failed to kick member.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#070314] flex flex-col overflow-hidden animate-fade-in w-full h-full">
      {/* Sleek 2-Tier Mobile-Optimized Header */}
      <div className="border-b border-white/10 bg-[#0e0724]/95 shrink-0 backdrop-blur-xl">
        {/* Tier 1: Main Header Bar */}
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Back / Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-[var(--hyper-pink)] to-[var(--electric-violet)] text-white shrink-0 shadow-md">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>

            <h3 className="text-xs sm:text-sm font-extrabold text-white truncate min-w-0">
              {activeSpark.text}
            </h3>
          </div>

          {/* Action Controls Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Live Timer */}
            <div
              className={`px-2 py-1 rounded-xl text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 border ${
                remainingTime <= 60
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-bounce'
                  : 'bg-white/10 border-white/20 text-[var(--neon-cyan)]'
              }`}
              title="Time Remaining"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(remainingTime)}</span>
            </div>

            {/* Members Toggle Button */}
            <button
              onClick={() => setShowMembersDrawer(!showMembersDrawer)}
              className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
                showMembersDrawer
                  ? 'bg-[var(--neon-cyan)]/30 border-[var(--neon-cyan)] text-white shadow-[0_0_10px_rgba(0,245,255,0.3)]'
                  : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
              }`}
              title="View Members List"
            >
              <Users className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
              <span>{sparkMembers.length}/20</span>
            </button>

            {/* Delete / Leave Button */}
            {activeSpark.isCreator ? (
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 border border-rose-500/30 transition-colors cursor-pointer"
                title="Delete Spark Room"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleLeave}
                className="p-1.5 rounded-xl bg-white/10 text-white/70 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 transition-colors cursor-pointer"
                title="Leave Spark Room"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: Metadata Sub-Header Bar */}
        <div className="px-3 py-1.5 sm:px-4 bg-white/[0.03] border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-white/70 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Host Identity Badge */}
            <div className="flex items-center gap-1">
              <span className="text-white/50">Host:</span>
              <span className="font-bold text-white">@{activeSpark.creator.username}</span>
              <span className="font-mono text-[var(--neon-cyan)] text-[9px]">{activeSpark.creator.echoId}</span>
              {activeSpark.isCreator && (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30 flex items-center gap-0.5 ml-0.5">
                  <Crown className="w-2.5 h-2.5" /> You (Host)
                </span>
              )}
            </div>

            {/* Privacy Badge */}
            {activeSpark.isPrivate ? (
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold flex items-center gap-1 text-[9px]">
                <Lock className="w-2.5 h-2.5" /> Private
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1 text-[9px]">
                🌐 Public
              </span>
            )}

            {/* Distance Bucket */}
            <span className="px-1.5 py-0.5 rounded bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30 font-mono font-bold text-[9px]">
              {activeSpark.distance}
            </span>
          </div>

          {/* Optional Meetup Point */}
          {activeSpark.placeName && (
            <div className="flex items-center gap-1 text-[var(--hyper-pink)] font-semibold truncate max-w-[220px] sm:max-w-xs">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">Meetup: {activeSpark.placeName}</span>
            </div>
          )}
        </div>
      </div>

      {/* 1-Minute Warning Banner */}
      {sparkWarning && sparkWarning.sparkId === activeSpark.id && (
        <div className="bg-rose-500/20 border-b border-rose-500/30 p-2 text-center text-xs font-bold text-rose-300 flex items-center justify-center space-x-1.5 animate-pulse shrink-0">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>⚠️ Room expiring in less than 1 minute! Say your last words.</span>
        </div>
      )}

      {/* Main Body (Chat Feed + Members Drawer) */}
      <div className="flex-1 overflow-hidden flex relative min-h-0">
        {/* Messages Feed */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
          {sparkMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-white/40 space-y-2 py-8">
              <Zap className="w-8 h-8 text-[var(--hyper-pink)]/50" />
              <p className="text-xs">No messages yet in this Spark room.</p>
              <p className="text-[11px] text-white/30">Break the ice and start talking!</p>
            </div>
          ) : (
            sparkMessages.map((msg) => {
              const isMe = msg.sender.id === (user?._id || user?.id);

              if (msg.type === 'system') {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-white/50">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {!isMe && (
                    <div className="flex items-center justify-between w-full max-w-[85%] sm:max-w-[75%] mb-1 px-1 gap-2">
                      <div className="flex items-center space-x-1.5 min-w-0 truncate">
                        <span className="text-xs font-bold text-[var(--neon-cyan)] truncate">@{msg.sender.username}</span>
                        <span className="text-[10px] font-mono text-white/40 shrink-0">{msg.sender.echoId}</span>
                        {msg.sender.id === activeSpark.creator.id && (
                          <span className="text-[9px] text-amber-300 bg-amber-500/20 px-1 rounded flex items-center gap-0.5 shrink-0" title="Host">
                            <Crown className="w-2.5 h-2.5" /> Host
                          </span>
                        )}
                      </div>

                      {/* Direct Host Kick Action Next to User Message */}
                      {activeSpark.isCreator && msg.sender.id !== activeSpark.creator.id && (
                        <button
                          type="button"
                          onClick={() => setMemberToKick({ id: msg.sender.id, username: msg.sender.username })}
                          className="px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 text-[9px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                          title="Kick member from room"
                        >
                          <UserX className="w-2.5 h-2.5" />
                          <span>Kick</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] ${
                      isMe
                        ? 'bg-gradient-to-r from-[var(--electric-violet)] to-indigo-600 text-white rounded-br-none shadow-md'
                        : 'bg-white/10 text-white border border-white/15 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word]">{msg.content}</p>
                  </div>
                  <span className="text-[9px] text-white/30 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Members Drawer Overlay Panel */}
        {showMembersDrawer && (
          <div className="w-72 bg-[#0c061e]/95 border-l border-white/10 p-4 overflow-y-auto space-y-3 animate-fade-in shrink-0 z-30 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
                <span>Room Members ({sparkMembers.length})</span>
              </span>
              <span className="text-[10px] text-white/40 font-mono">Max 20</span>
            </div>
            <div className="space-y-2">
              {sparkMembers.map((member) => {
                const isHost = member.id === activeSpark.creator.id;
                const isMe = member.id === (user?._id || user?.id);

                return (
                  <div
                    key={member.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[var(--neon-cyan)] to-[var(--electric-violet)] text-[10px] font-bold flex items-center justify-center text-white shrink-0">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                          <span>@{member.username}</span>
                          {isHost && (
                            <span title="Host">
                              <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-[var(--neon-cyan)]">{member.echoId}</div>
                      </div>
                    </div>

                    {/* Host Kick Button in Member Drawer */}
                    {activeSpark.isCreator && !isMe && !isHost && (
                      <button
                        type="button"
                        onClick={() => setMemberToKick({ id: member.id, username: member.username })}
                        className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                        title="Kick member & block from re-joining"
                      >
                        <UserX className="w-3 h-3" />
                        <span>Kick</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Room Message Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#0a051b] flex items-center space-x-2 shrink-0 z-20">
        <input
          type="text"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder="Send message to Spark room..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-[var(--hyper-pink)] focus:ring-1 focus:ring-[var(--hyper-pink)] transition-all"
        />
        <button
          type="submit"
          disabled={!inputContent.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-[var(--hyper-pink)] to-[var(--electric-violet)] text-white disabled:opacity-40 disabled:pointer-events-none hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Custom Host Kick Confirmation Warning Modal */}
      {memberToKick && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-sm p-5 rounded-2xl border border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.3)] bg-[#12071b] text-center space-y-4 relative">
            {/* Warning Icon Header */}
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">Host Kick Warning</h3>
              <p className="text-xs text-white/70 mt-1">
                Are you sure you want to kick <span className="font-bold text-rose-300">@{memberToKick.username}</span>?
              </p>
            </div>

            {/* Permanent Ban Notification Box */}
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-left space-y-1">
              <div className="text-[11px] font-extrabold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                <UserX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Permanent Ban Notice</span>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed">
                This user will be immediately removed from the room and <span className="font-bold text-rose-300 underline">will NOT be able to join this Spark room again</span>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setMemberToKick(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmKick}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserX className="w-4 h-4" />
                <span>Kick & Ban User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
