import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmojiPicker } from './EmojiPicker';
import { SleepingBanner } from './SleepingBanner';
import { ReportModal } from '../ReportModal';
import { moderationService } from '../../services/moderationService';
import { Send, Smile, BookmarkCheck, Bookmark, ArrowLeft, Shield, VolumeX, Ban, Flag } from 'lucide-react';

interface ChatWindowProps {
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const { user } = useAuth();
  const {
    activeChat,
    activeMessages,
    isTypingPeer,
    hasMoreMessages,
    fetchMessages,
    sendMessage,
    sendTyping,
    sendStopTyping,
    continueChat,
    saveChat
  } = useSocket();

  const [inputContent, setInputContent] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showSafetyMenu, setShowSafetyMenu] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isTypingPeer]);

  if (!activeChat) return null;

  const peer = activeChat.peer;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputContent(e.target.value);
    sendTyping(activeChat.id);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping(activeChat.id);
    }, 2000);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim()) return;

    sendMessage(activeChat.id, inputContent.trim());
    setInputContent('');
    sendStopTyping(activeChat.id);
    setShowEmojiPicker(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    setInputContent((prev) => prev + emoji);
  };

  const handleSaveConnection = async () => {
    setSaving(true);
    try {
      await saveChat(activeChat.id);
    } catch (err) {
      console.error('Failed to save connection:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBlock = async () => {
    if (!peer?.echoId) return;
    if (window.confirm(`Are you sure you want to block ${peer.username || peer.echoId}?`)) {
      try {
        await moderationService.blockUser(peer.echoId);
        onClose();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to block user');
      }
    }
  };

  const handleMute = async () => {
    if (!peer?.echoId) return;
    try {
      await moderationService.muteUser(peer.echoId);
      alert(`Muted notifications from ${peer.username || peer.echoId}`);
      setShowSafetyMenu(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to mute user');
    }
  };

  const isSaved = activeChat.isSaved || activeChat.status === 'saved';

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-[#0b061a] flex flex-col overflow-hidden animate-fade-in w-full h-full">
        {/* Header */}
        <div className="px-3 sm:px-5 py-3 bg-[#120a2a]/90 border-b border-white/10 flex items-center justify-between relative z-20 shrink-0 backdrop-blur-xl">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                💬
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0b061a] ${
                  peer?.presence === 'online'
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : peer?.presence === 'away'
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'bg-slate-500'
                }`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[200px]">
                  {peer?.username || 'Anonymous User'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-semibold shrink-0">
                  {peer?.echoId}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-white/50">
                <span
                  className={`capitalize font-medium ${
                    peer?.presence === 'online'
                      ? 'text-emerald-400'
                      : peer?.presence === 'away'
                      ? 'text-amber-400'
                      : 'text-white/40'
                  }`}
                >
                  {peer?.presence || 'offline'}
                </span>
                {peer?.locationLabel && <span className="truncate">• {peer.locationLabel}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 relative">
            <button
              onClick={handleSaveConnection}
              disabled={saving || isSaved}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : activeChat.saveRequests?.includes(user?._id || user?.id || '')
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/90'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px]">Saved 🤝</span>
                </>
              ) : activeChat.saveRequests?.includes(user?._id || user?.id || '') ? (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px]">Pending...</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-[11px]">{saving ? 'Saving...' : 'Save Chat'}</span>
                </>
              )}
            </button>

            {/* Safety Menu Button */}
            <button
              type="button"
              onClick={() => setShowSafetyMenu((prev) => !prev)}
              className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Safety Options"
            >
              <Shield className="w-4 h-4 text-violet-400" />
            </button>

            {showSafetyMenu && (
              <div className="absolute top-12 right-0 w-36 bg-[#1a1d2e] border border-white/15 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-1">
                <button
                  onClick={handleMute}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-xs text-slate-300 hover:bg-white/10 rounded-lg text-left cursor-pointer"
                >
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mute</span>
                </button>
                <button
                  onClick={handleBlock}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg text-left cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5 text-red-400" />
                  <span>Block</span>
                </button>
                <button
                  onClick={() => {
                    setShowSafetyMenu(false);
                    setShowReportModal(true);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg text-left cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Report</span>
                </button>
              </div>
            )}
          </div>
        </div>

          {/* Save Request Peer Alert Banner */}
          {!isSaved && activeChat.saveRequests?.some((id) => id !== (user?._id || user?.id)) && (
            <div className="px-4 py-2.5 bg-indigo-500/20 border-b border-indigo-500/30 flex items-center justify-between animate-fade-in shrink-0">
              <div className="flex items-center space-x-2 text-xs text-indigo-200">
                <span className="text-base">🤝</span>
                <span>
                  <strong className="text-white">{peer?.username}</strong> requested to save this connection permanently!
                </span>
              </div>
              <button
                onClick={handleSaveConnection}
                disabled={saving}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold rounded-lg shadow-sm transition-all shrink-0 ml-2 cursor-pointer"
              >
                Save Back
              </button>
            </div>
          )}

          {/* Message Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
            {hasMoreMessages && (
              <div className="text-center py-2">
                <button
                  onClick={() => fetchMessages(activeChat.id, activeMessages[0]?.createdAt)}
                  className="text-xs text-indigo-300 hover:underline font-mono cursor-pointer"
                >
                  Load previous messages...
                </button>
              </div>
            )}

            {activeMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isSelf={msg.sender.id === (user?._id || user?.id)}
              />
            ))}

            {isTypingPeer && <TypingIndicator username={peer?.username} />}

            <div ref={messagesEndRef} />
          </div>

          {/* Sleeping Status Overlay Banner */}
          {activeChat.status === 'sleeping' && (
            <SleepingBanner onContinue={() => continueChat(activeChat.id)} />
          )}

          {/* Input Bar - Always Accessible Above Navigation Bar */}
          <div className="relative p-3 bg-[#0e1017] border-t border-white/10 shrink-0 z-20">
            {showEmojiPicker && (
              <EmojiPicker
                onSelectEmoji={handleSelectEmoji}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}

            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputContent}
                onChange={handleInputChange}
                disabled={activeChat.status === 'sleeping'}
                placeholder={
                  activeChat.status === 'sleeping'
                    ? 'Conversation is sleeping. Tap Continue to wake up...'
                    : 'Talk beyond hesitation...'
                }
                className="flex-1 px-4 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!inputContent.trim() || activeChat.status === 'sleeping'}
                className="p-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl shadow-lg transition-all disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      <ReportModal
        isOpen={showReportModal}
        targetEchoId={peer?.echoId || ''}
        targetUsername={peer?.username}
        onClose={() => setShowReportModal(false)}
      />
    </>
  );
};
