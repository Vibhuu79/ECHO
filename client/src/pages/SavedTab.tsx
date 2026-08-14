import React, { useState } from 'react';
import { Bookmark, Search, MessageCircle, MapPin, Smile, Trash2, HeartHandshake } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const SavedTab: React.FC = () => {
  const { conversations, setActiveChatId, deleteChat } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const savedList = conversations.saved || [];

  const filteredSaved = savedList.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const username = chat.peer?.username?.toLowerCase() || '';
    const echoId = chat.peer?.echoId?.toLowerCase() || '';
    return username.includes(q) || echoId.includes(q);
  });

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this saved connection?')) {
      setDeletingId(conversationId);
      try {
        await deleteChat(conversationId);
      } catch (err) {
        console.error('Failed to delete saved connection:', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-3 sm:p-4 max-w-2xl mx-auto pb-28 sm:pb-32 animate-fade-in relative w-full">
      {/* Header Banner */}
      <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 flex items-center gap-3 shadow-lg w-full max-w-full overflow-hidden shrink-0">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 shrink-0">
          <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span>Saved Connections</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-white/60 mt-0.5 leading-relaxed">
            Permanent connections established when both users agree to save the chat. These conversations never expire.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      {savedList.length > 0 && (
        <div className="relative w-full shrink-0">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved contacts by username or EchoID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      )}

      {/* Connections List */}
      {savedList.length === 0 ? (
        <div className="glass-card py-12 px-4 rounded-2xl border border-white/10 text-center flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-white/90">No saved connections yet</h3>
          <p className="text-xs text-white/60 max-w-xs leading-relaxed">
            During a conversation in Nearby, both you and your partner can tap <strong className="text-indigo-300 font-semibold">Save Chat</strong> to permanently preserve the connection.
          </p>
        </div>
      ) : filteredSaved.length === 0 ? (
        <div className="text-center py-8 text-white/40 text-xs">
          No saved connection matches "{searchQuery}"
        </div>
      ) : (
        <div className="space-y-2.5 w-full">
          {filteredSaved.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className="p-3 sm:p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/10 cursor-pointer transition-all hover:border-indigo-500/30 group w-full max-w-full overflow-hidden"
            >
              <div className="flex items-center space-x-2.5 sm:space-x-3.5 flex-1 min-w-0 mr-2">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
                    {chat.peer?.username ? chat.peer.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#12141d] ${
                      chat.peer?.presence === 'online'
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                        : chat.peer?.presence === 'away'
                        ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                        : 'bg-slate-500'
                    }`}
                    title={chat.peer?.presence || 'offline'}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[90px] sm:max-w-[160px]">
                      {chat.peer?.username || 'Anonymous User'}
                    </span>
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-semibold shrink-0">
                      {chat.peer?.echoId}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] text-white/50 mt-0.5">
                    {chat.peer?.mood && (
                      <span className="inline-flex items-center space-x-1 text-indigo-200 truncate">
                        <Smile className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{chat.peer.mood}</span>
                      </span>
                    )}
                    {chat.peer?.locationLabel && (
                      <span className="inline-flex items-center space-x-1 text-white/40 truncate">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">{chat.peer.locationLabel}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-white/60 truncate mt-0.5">
                    {chat.lastMessage?.text || <span className="italic text-white/30">No messages yet</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={(e) => handleDelete(e, chat.id)}
                  disabled={deletingId === chat.id}
                  className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                  title="Remove saved connection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 flex items-center space-x-1 shrink-0">
                  <MessageCircle className="w-3 h-3" />
                  <span>Chat</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
