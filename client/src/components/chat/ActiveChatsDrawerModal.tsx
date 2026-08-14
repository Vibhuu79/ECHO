import React, { useState } from 'react';
import { MessageCircle, X, Search, ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { ConversationItem } from '../../types/chat.types';

interface ActiveChatsDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationItem[];
  activeChatId: string | null;
  onSelectChat: (conversationId: string) => void;
}

export const ActiveChatsDrawerModal: React.FC<ActiveChatsDrawerModalProps> = ({
  isOpen,
  onClose,
  conversations,
  activeChatId,
  onSelectChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredConversations = conversations.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const username = chat.peer?.username?.toLowerCase() || '';
    const echoId = chat.peer?.echoId?.toLowerCase() || '';
    return username.includes(q) || echoId.includes(q);
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#120a2a]/95 border-t border-indigo-500/30 rounded-t-3xl shadow-[0_-10px_40px_rgba(99,102,241,0.4)] backdrop-blur-xl flex flex-col max-h-[85vh] overflow-hidden animate-slide-up pb-16 sm:pb-4">
        {/* Drawer Drag Indicator & Header */}
        <div className="pt-3 pb-2 px-5 flex flex-col items-center border-b border-white/10 shrink-0 relative bg-black/30">
          <div className="w-12 h-1 bg-white/20 rounded-full mb-3" />

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Active Chats</span>
                </h3>
                <p className="text-[11px] text-white/50">Tap any chat to launch full-screen view</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar (if 2+ chats) */}
        {conversations.length > 2 && (
          <div className="p-3 border-b border-white/5 bg-white/[0.02]">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search active chats by name or EchoID..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Active Conversations Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0">
          {conversations.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Zap className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-semibold text-white/80">No active conversations</h4>
              <p className="text-xs text-white/50 max-w-xs leading-relaxed">
                Wave 👋 at people nearby or join a Spark room to start talking!
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/40">
              No active chat matches "{searchQuery}"
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isCurrentActive = activeChatId === chat.id;
              const hasUnread = Boolean(chat.unreadCount && chat.unreadCount > 0);
              return (
                <div
                  key={chat.id}
                  onClick={() => {
                    onSelectChat(chat.id);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isCurrentActive
                      ? 'bg-indigo-600/25 border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                      : hasUnread
                      ? 'bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-pink-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1 mr-2">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 p-[2px] shadow-md">
                        <div className="w-full h-full rounded-full bg-[#0d0722] flex items-center justify-center text-white font-extrabold text-sm">
                          {chat.peer?.username ? chat.peer.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0d0722] ${
                          chat.peer?.presence === 'online'
                            ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                            : chat.peer?.presence === 'away'
                            ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                            : 'bg-slate-500'
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[180px]">
                          {chat.peer?.username || 'Anonymous User'}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-semibold shrink-0">
                          {chat.peer?.echoId}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-white/50 mt-0.5">
                        <span
                          className={`capitalize font-medium ${
                            chat.peer?.presence === 'online'
                              ? 'text-emerald-400'
                              : chat.peer?.presence === 'away'
                              ? 'text-amber-400'
                              : 'text-white/40'
                          }`}
                        >
                          {chat.peer?.presence || 'offline'}
                        </span>
                        {chat.peer?.locationLabel && <span className="truncate">• {chat.peer.locationLabel}</span>}
                      </div>

                      <p className={`text-xs truncate mt-1 ${hasUnread ? 'text-pink-300 font-bold' : 'text-white/70'}`}>
                        {chat.lastMessage?.text || <span className="italic text-white/40">Tap to send message...</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {hasUnread && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-mono font-extrabold text-[11px] shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse">
                        {chat.unreadCount} new
                      </span>
                    )}
                    <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-white/10 bg-black/40 text-center shrink-0">
          <p className="text-[11px] text-white/40 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>End-to-end ephemeral & saved connections</span>
          </p>
        </div>
      </div>
    </div>
  );
};
