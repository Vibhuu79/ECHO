import React, { useState, useEffect } from 'react';
import { moderationService, BlockedUserDTO, MutedUserDTO } from '../services/moderationService';

interface SafetySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetySettingsModal: React.FC<SafetySettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'blocked' | 'muted'>('blocked');
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserDTO[]>([]);
  const [mutedUsers, setMutedUsers] = useState<MutedUserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLists();
    }
  }, [isOpen]);

  const fetchLists = async () => {
    setLoading(true);
    setError(null);
    try {
      const [blocked, muted] = await Promise.all([
        moderationService.getBlockedUsers(),
        moderationService.getMutedUsers()
      ]);
      setBlockedUsers(blocked);
      setMutedUsers(muted);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch safety settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (echoId: string) => {
    try {
      await moderationService.unblockUser(echoId);
      setBlockedUsers((prev) => prev.filter((u) => u.echoId !== echoId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to unblock user');
    }
  };

  const handleUnmute = async (echoId: string) => {
    try {
      await moderationService.unmuteUser(echoId);
      setMutedUsers((prev) => prev.filter((u) => u.echoId !== echoId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to unmute user');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card" style={{ maxWidth: '480px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🛡️</span> Safety & Privacy Settings
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.7 }}>
              Manage your blocked and muted connections
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setActiveTab('blocked')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'blocked' ? '#8b5cf6' : 'transparent',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🚫 Blocked ({blockedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('muted')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'muted' ? '#8b5cf6' : 'transparent',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🔕 Muted ({mutedUsers.length})
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.7 }}>Loading safety lists...</div>
        ) : activeTab === 'blocked' ? (
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {blockedUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', opacity: 0.6, fontSize: '0.9rem' }}>
                No blocked users. You have not blocked anyone.
              </div>
            ) : (
              blockedUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{user.echoId}</div>
                  </div>
                  <button
                    onClick={() => handleUnblock(user.echoId)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mutedUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', opacity: 0.6, fontSize: '0.9rem' }}>
                No muted users. Notifications are active for all users.
              </div>
            ) : (
              mutedUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{user.echoId}</div>
                  </div>
                  <button
                    onClick={() => handleUnmute(user.echoId)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Unmute
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.5rem 1.25rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
