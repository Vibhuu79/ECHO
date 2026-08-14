import React, { useState } from 'react';
import { Radio, MapPin, Zap, Bookmark, LogOut, Shield, Hand, Copy, Check, ArrowRight, Search, Edit3, MessageCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { OnboardingPage } from './pages/OnboardingPage';
import { NearbyTab } from './pages/NearbyTab';
import { SavedTab } from './pages/SavedTab';
import { SparksTab } from './pages/SparksTab';
import { PendingWavesModal } from './components/wave/PendingWavesModal';
import { SendWaveModal } from './components/wave/SendWaveModal';
import { ChatWindow } from './components/chat/ChatWindow';
import { ActiveChatsDrawerModal } from './components/chat/ActiveChatsDrawerModal';
import { DraggableChatFab } from './components/chat/DraggableChatFab';
import { SafetySettingsModal } from './components/SafetySettingsModal';
import { ProfileDrawerModal } from './components/profile/ProfileDrawerModal';
import { ReceivedComplimentsModal } from './components/profile/ReceivedComplimentsModal';
import { QrCodeModal } from './components/profile/QrCodeModal';
import { EchoIdSearchModal } from './components/profile/EchoIdSearchModal';
import { MoodType, NearbyUser } from './types/discovery';
import './App.css';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, isNewUser, logout, loading, refreshProfile } = useAuth();
  const {
    pendingWaves,
    conversations,
    totalUnreadCount,
    activeChat,
    activeSparkId,
    setActiveChatId,
  } = useSocket();

  const [activeTab, setActiveTab] = useState<'nearby' | 'sparks' | 'saved'>('nearby');
  const [showId, setShowId] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showReceivedComplimentsModal, setShowReceivedComplimentsModal] = useState(false);
  const [showPendingWaves, setShowPendingWaves] = useState(false);
  const [showSafetySettings, setShowSafetySettings] = useState(false);
  const [showActiveChatsDrawer, setShowActiveChatsDrawer] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [waveTargetUser, setWaveTargetUser] = useState<NearbyUser | null>(null);

  const handleCopyEchoId = (echoId: string) => {
    navigator.clipboard.writeText(echoId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleInitiateSearchWave = (targetEchoId: string, username: string) => {
    setWaveTargetUser({
      id: targetEchoId,
      username,
      echoId: targetEchoId,
      distance: '~150m',
      contextLabel: 'Nearby',
      mood: null,
      presenceStatus: 'online',
      presenceLabel: 'Active Now'
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
          Loading Echo...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || isNewUser) {
    return <OnboardingPage onComplete={() => refreshProfile()} />;
  }

  const allActiveChats = [...conversations.active, ...conversations.saved];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-logo">
          <Radio className="brand-icon glow-pulse" />
          <span className="gradient-text">ECHO</span>
        </div>

        {/* User Identity & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {/* Echo ID Quick Search Button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-cyan-400 transition-colors flex items-center justify-center shrink-0"
            title="Search Echo ID / QR Scanner"
            style={{ background: 'var(--bg-glass-card)', border: '1px solid var(--bg-glass-border)' }}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Pending Waves Button */}
          <button
            onClick={() => setShowPendingWaves(true)}
            className="relative p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors flex items-center justify-center shrink-0"
            title="Pending Waves"
            style={{ background: 'var(--bg-glass-card)', border: '1px solid var(--bg-glass-border)' }}
          >
            <Hand className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            {pendingWaves.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {pendingWaves.length}
              </span>
            )}
          </button>

          {/* Active Chats Button (Direct Laptop Header Access) */}
          <button
            onClick={() => setShowActiveChatsDrawer(true)}
            className="relative p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            title="Open Active Chats"
            style={{ background: 'var(--bg-glass-card)', border: '1px solid var(--bg-glass-border)' }}
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 text-[9px] font-extrabold rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse">
                {totalUnreadCount}
              </span>
            )}
          </button>

          {/* Safety Settings Button */}
          <button
            onClick={() => setShowSafetySettings(true)}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors flex items-center justify-center shrink-0"
            title="Safety Settings"
            style={{ background: 'var(--bg-glass-card)', border: '1px solid var(--bg-glass-border)' }}
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
          </button>

          {/* User Identity Chip -> Opens Full Profile Customizer */}
          <button
            onClick={() => setShowProfileDrawer(true)}
            className="px-2 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1 text-white cursor-pointer text-xs shrink-0 hover:bg-white/10 transition max-w-[110px] sm:max-w-[160px]"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[var(--neon-cyan)] to-[var(--electric-violet)] flex items-center justify-center font-extrabold text-[10px] text-white shrink-0">
              {user?.avatarIcon || (user?.username ? user.username.charAt(0).toUpperCase() : 'U')}
            </div>
            <span className="font-semibold truncate text-[11px] sm:text-xs">@{user?.username}</span>
            <span className="hidden sm:inline text-[var(--neon-cyan)] font-mono text-[10px] shrink-0">
              {user?.echoId}
            </span>
          </button>

          <button
            onClick={logout}
            title="Log out"
            className="p-1 text-white/50 hover:text-white transition-colors cursor-pointer shrink-0 ml-0.5"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Identity Drawer Modal */}
      {showId && (
        <div className="glass-card m-3 p-4 rounded-2xl border border-[var(--neon-cyan)]/40 bg-gradient-to-br from-[#160b33] via-[#0f0724] to-[#1a0c3b] shadow-2xl space-y-4 animate-fade-in relative z-40">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
              <span>Your Anonymous Identity</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--acid-lime)]/20 text-[var(--acid-lime)] border border-[var(--acid-lime)]/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--acid-lime)] animate-ping" />
              <span>Active</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--neon-cyan)] via-[var(--electric-violet)] to-[var(--hyper-pink)] p-[2px] shadow-[0_0_15px_rgba(0,245,255,0.3)] shrink-0">
              <div className="w-full h-full rounded-full bg-[#0c0620] flex items-center justify-center text-white font-black text-lg">
                {user?.avatarIcon || (user?.username ? user.username.charAt(0).toUpperCase() : 'U')}
              </div>
            </div>
            <div>
              <div className="text-base font-extrabold text-white tracking-wide">
                @{user?.username}
              </div>
              <p className="text-[11px] text-white/50">Visible to nearby users</p>
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/10 p-3 rounded-xl flex items-center justify-between gap-2">
            <span className="text-xs text-white/60 font-semibold">EchoID Code:</span>
            <button
              onClick={() => user?.echoId && handleCopyEchoId(user.echoId)}
              className="px-3 py-1.5 rounded-lg bg-[var(--neon-cyan)]/15 border border-[var(--neon-cyan)]/40 text-[var(--neon-cyan)] font-mono font-bold text-xs flex items-center gap-2 hover:bg-[var(--neon-cyan)]/25 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,245,255,0.2)] shrink-0"
              title="Click to copy EchoID"
            >
              <span>{user?.echoId}</span>
              {copiedId ? (
                <Check className="w-3.5 h-3.5 text-[var(--acid-lime)]" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-70" />
              )}
            </button>
          </div>

          <button
            onClick={() => {
              setShowId(false);
              setShowProfileDrawer(true);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-lg hover:bg-cyan-500/30 transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <span>Edit Username & Customize Profile</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'nearby' && user && (
          <NearbyTab
            currentUser={{
              username: user.username,
              echoId: user.echoId,
              mood: (user.mood as MoodType) || null
            }}
          />
        )}

        {activeTab === 'sparks' && <SparksTab />}

        {activeTab === 'saved' && <SavedTab />}
      </main>

      {/* Draggable Active Chats Badge (FAB) - Always visible floating button */}
      {!activeChat && !activeSparkId && (
        <DraggableChatFab
          unreadCount={totalUnreadCount}
          onClick={() => setShowActiveChatsDrawer(true)}
        />
      )}

      {/* Active Chats Drawer Modal */}
      <ActiveChatsDrawerModal
        isOpen={showActiveChatsDrawer}
        onClose={() => setShowActiveChatsDrawer(false)}
        conversations={allActiveChats}
        activeChatId={activeChat?.id || null}
        onSelectChat={(id) => setActiveChatId(id)}
      />

      {/* Navigation Tabs */}
      <nav className="nav-tabs-placeholder">
        <div
          className={`nav-item ${activeTab === 'nearby' ? 'active' : ''}`}
          onClick={() => setActiveTab('nearby')}
        >
          <MapPin size={20} />
          <span>Nearby</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'sparks' ? 'active' : ''}`}
          onClick={() => setActiveTab('sparks')}
        >
          <Zap size={20} />
          <span>Sparks</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <Bookmark size={20} />
          <span>Saved</span>
        </div>
      </nav>

      {/* Pending Waves Modal */}
      <PendingWavesModal
        isOpen={showPendingWaves}
        onClose={() => setShowPendingWaves(false)}
      />

      {/* Safety Settings Modal */}
      <SafetySettingsModal
        isOpen={showSafetySettings}
        onClose={() => setShowSafetySettings(false)}
      />

      {/* Profile Customizer Drawer Modal */}
      {user && (
        <ProfileDrawerModal
          isOpen={showProfileDrawer}
          onClose={() => setShowProfileDrawer(false)}
          user={user}
          onUserUpdated={() => refreshProfile()}
          onOpenQrCard={() => setShowQrModal(true)}
          onOpenSearchModal={() => setShowSearchModal(true)}
          onOpenReceivedCompliments={() => setShowReceivedComplimentsModal(true)}
        />
      )}

      {/* Received Compliments Modal */}
      <ReceivedComplimentsModal
        isOpen={showReceivedComplimentsModal}
        onClose={() => setShowReceivedComplimentsModal(false)}
      />

      {/* QR Code Sharing Modal */}
      {user && (
        <QrCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          echoId={user.echoId}
          username={user.username}
          onOpenScanner={() => setShowSearchModal(true)}
        />
      )}

      {/* Echo ID & QR Camera Search Modal */}
      <EchoIdSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSendWave={handleInitiateSearchWave}
      />

      {/* Send Wave Modal (from Search) */}
      {waveTargetUser && (
        <SendWaveModal
          user={waveTargetUser}
          onClose={() => setWaveTargetUser(null)}
        />
      )}

      {/* Active Chat Window */}
      {activeChat && (
        <ChatWindow onClose={() => setActiveChatId(null)} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="ambient-bg-mesh">
          <div className="mesh-blob mesh-blob-1" />
          <div className="mesh-blob mesh-blob-2" />
          <div className="mesh-blob mesh-blob-3" />
        </div>
        <MainAppContent />
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
