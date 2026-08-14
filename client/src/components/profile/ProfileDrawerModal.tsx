import React, { useState, useEffect } from 'react';
import { User } from '../../types/auth';
import { api } from '../../services/api';

interface ProfileDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdated: (updatedUser: User) => void;
  onOpenQrCard: () => void;
  onOpenSearchModal: () => void;
  onOpenReceivedCompliments?: () => void;
}

const AURA_THEMES = [
  { id: 'cyberpunk', name: 'Cyberpunk', bg: 'from-cyan-500 to-pink-500', glow: 'shadow-cyan-500/50' },
  { id: 'sunrise', name: 'Sunrise', bg: 'from-amber-400 to-rose-500', glow: 'shadow-amber-500/50' },
  { id: 'lavender', name: 'Lavender', bg: 'from-indigo-400 to-purple-500', glow: 'shadow-indigo-500/50' },
  { id: 'midnight', name: 'Midnight', bg: 'from-blue-600 to-slate-800', glow: 'shadow-blue-500/50' }
];

const AVATAR_ICONS = ['⚡', '☕', '🎮', '🎧', '🚀', '📚', '🍕', '💻', '🌌', '🔥'];

export const ProfileDrawerModal: React.FC<ProfileDrawerModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  onOpenQrCard,
  onOpenSearchModal,
  onOpenReceivedCompliments
}) => {
  const [username, setUsername] = useState(user.username || '');
  const [auraTheme, setAuraTheme] = useState(user.auraTheme || 'cyberpunk');
  const [avatarIcon, setAvatarIcon] = useState(user.avatarIcon || '⚡');
  const [vibeNote, setVibeNote] = useState(user.vibeStatus?.note || '');
  const [vibeDuration, setVibeDuration] = useState(2);
  const [allowGlobalSearch, setAllowGlobalSearch] = useState(user.allowGlobalIdSearch || false);
  const [isGhostMode, setIsGhostMode] = useState(user.isGhostMode || false);

  const [spinningName, setSpinningName] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password Sub-Section State
  const [pwdSubTab, setPwdSubTab] = useState<'change' | 'otp'>('change');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAuraTheme(user.auraTheme || 'cyberpunk');
      setAvatarIcon(user.avatarIcon || '⚡');
      setVibeNote(user.vibeStatus?.note || '');
      setAllowGlobalSearch(user.allowGlobalIdSearch || false);
      setIsGhostMode(user.isGhostMode || false);
      setCurrentPassword('');
      setNewPassword('');
      setOtpCode('');
      setOtpSent(false);
      setPwdError(null);
      setPwdSuccess(null);
    }
  }, [user, isOpen]);

  const handleChangePassword = async () => {
    setPwdLoading(true);
    setPwdError(null);
    setPwdSuccess(null);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPwdSuccess(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPwdError(err.message || 'Failed to update password');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleRequestResetOtp = async () => {
    setPwdLoading(true);
    setPwdError(null);
    setPwdSuccess(null);
    try {
      await api.sendOtp(user.email);
      setOtpSent(true);
      setPwdSuccess(`OTP verification code sent to ${user.email}`);
    } catch (err: any) {
      setPwdError(err.message || 'Failed to send OTP code');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleResetPasswordOtp = async () => {
    setPwdLoading(true);
    setPwdError(null);
    setPwdSuccess(null);
    try {
      const res = await api.resetPasswordWithOtp(user.email, otpCode.trim(), newPassword.trim());
      setPwdSuccess(res.message || 'Password has been set successfully!');
      setOtpCode('');
      setNewPassword('');
      setOtpSent(false);
    } catch (err: any) {
      setPwdError(err.message || 'Failed to reset password');
    } finally {
      setPwdLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentAura = AURA_THEMES.find((t) => t.id === auraTheme) || AURA_THEMES[0];

  const handleSpinName = async () => {
    setSpinningName(true);
    try {
      const newName = await api.getRandomUsername();
      setUsername(newName);
    } catch {
      // Fallback local randomizer
      const fallbackNames = ['QuantumNapper', 'CaffeineOverlord', 'SyntaxGhost', 'MidnightCoder'];
      setUsername(fallbackNames[Math.floor(Math.random() * fallbackNames.length)]);
    } finally {
      setSpinningName(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updated = await api.updateProfile({
        username,
        auraTheme,
        avatarIcon,
        vibeStatusNote: vibeNote,
        vibeStatusDurationHours: vibeDuration,
        allowGlobalIdSearch: allowGlobalSearch,
        isGhostMode: isGhostMode
      });

      onUserUpdated(updated);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/95 border border-cyan-500/30 p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              🛡️ Anonymous Identity
            </h3>
            <p className="text-xs text-slate-400">Change display username anytime • Echo ID remains permanent</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Avatar & Echo ID Preview Card */}
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Dynamic Avatar with Aura Glow */}
            <div className={`relative w-16 h-16 rounded-full bg-gradient-to-tr ${currentAura.bg} p-1 shadow-lg ${currentAura.glow}`}>
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-2xl">
                {avatarIcon}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">@{username || 'anonymous'}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800">
                  {user.echoId}
                </span>
                {isGhostMode && (
                  <span className="text-[10px] font-semibold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800">
                    👻 Ghost Mode
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              onClick={onOpenQrCard}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-600 flex items-center justify-center gap-1 cursor-pointer"
            >
              📱 QR
            </button>

            <button
              onClick={onOpenSearchModal}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold transition border border-cyan-500/40 flex items-center justify-center gap-1 cursor-pointer"
            >
              🔍 Find
            </button>

            {onOpenReceivedCompliments && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReceivedCompliments();
                }}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-semibold transition border border-pink-500/40 flex items-center justify-center gap-1 cursor-pointer"
              >
                ✨ Compliments
              </button>
            )}
          </div>
        </div>

        {/* Section 1: Username & Vibe Randomizer */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            1. Display Username (Change Anytime)
          </label>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-3 text-slate-500 font-semibold">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="enter_username"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <button
              onClick={handleSpinName}
              disabled={spinningName}
              className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 shrink-0"
              title="Generate a funny random username"
            >
              🎲 Spin Funny Name
            </button>
          </div>

          {/* Recent Username Presets */}
          {user.recentUsernames && user.recentUsernames.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 mr-1">Recent:</span>
              {user.recentUsernames.map((prevName, idx) => (
                <button
                  key={idx}
                  onClick={() => setUsername(prevName)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  @{prevName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Visual Aura & Avatar Icon */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            2. Avatar Icon & Aura Theme
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AURA_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setAuraTheme(theme.id)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  auraTheme === theme.id
                    ? 'border-cyan-400 bg-cyan-950/60 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${theme.bg}`} />
                {theme.name}
              </button>
            ))}
          </div>

          {/* Avatar Emoji Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {AVATAR_ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setAvatarIcon(icon)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition border ${
                  avatarIcon === icon
                    ? 'border-pink-500 bg-pink-950/60 scale-105'
                    : 'border-slate-800 bg-slate-800/60 hover:bg-slate-700'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Ephemeral Vibe Note */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            3. Ephemeral Vibe Note (1-Line Status)
          </label>

          <input
            type="text"
            maxLength={40}
            value={vibeNote}
            onChange={(e) => setVibeNote(e.target.value)}
            placeholder='e.g., "Stuck on Leetcode #347 💻" or "Chai break ☕"'
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
          />

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Auto-expires after duration:</span>
            <div className="flex gap-2">
              {[2, 4, 8].map((hrs) => (
                <button
                  key={hrs}
                  onClick={() => setVibeDuration(hrs)}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    vibeDuration === hrs
                      ? 'border-cyan-400 bg-cyan-950 text-cyan-300'
                      : 'border-slate-800 bg-slate-800 text-slate-400'
                  }`}
                >
                  {hrs} hours
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Stealth & Privacy Controls */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            4. Stealth & Privacy Controls
          </label>

          {/* Ghost Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div>
              <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
                👻 Stealth / Ghost Mode
              </h5>
              <p className="text-[11px] text-slate-400">Hide location & presence from Nearby feed</p>
            </div>
            <button
              onClick={() => setIsGhostMode(!isGhostMode)}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${
                isGhostMode ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isGhostMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Global Search Privacy Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div>
              <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
                🌐 Allow Global Echo ID Search
              </h5>
              <p className="text-[11px] text-slate-400">Default: Nearby only (within 1km)</p>
            </div>
            <button
              onClick={() => setAllowGlobalSearch(!allowGlobalSearch)}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${
                allowGlobalSearch ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  allowGlobalSearch ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 5: Password & Account Security */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            5. Account Security & Password
          </label>

          <div className="flex bg-slate-800/60 rounded-xl p-1 border border-slate-700/80">
            <button
              type="button"
              onClick={() => { setPwdSubTab('change'); setPwdError(null); setPwdSuccess(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                pwdSubTab === 'change' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔑 Change Password
            </button>
            <button
              type="button"
              onClick={() => { setPwdSubTab('otp'); setPwdError(null); setPwdSuccess(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                pwdSubTab === 'otp' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📲 Forgot Password (OTP)
            </button>
          </div>

          {pwdSubTab === 'change' ? (
            <div className="space-y-2 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="password"
                placeholder="New Password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={pwdLoading || !currentPassword.trim() || !newPassword.trim()}
                className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
              >
                {pwdLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          ) : (
            <div className="space-y-2 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60">
              {!otpSent ? (
                <div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Send a verification code to <span className="text-cyan-300 font-semibold">{user.email}</span> to create a new password.
                  </p>
                  <button
                    type="button"
                    onClick={handleRequestResetOtp}
                    disabled={pwdLoading}
                    className="w-full py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {pwdLoading ? 'Sending OTP...' : 'Send OTP Verification Code'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-emerald-400">
                    OTP sent to {user.email}! Enter the 6-digit code below to set your new password.
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 text-center font-mono tracking-widest"
                  />
                  <input
                    type="password"
                    placeholder="New Password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="px-3 py-2 rounded-xl bg-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-600 transition"
                    >
                      Resend Code
                    </button>
                    <button
                      type="button"
                      onClick={handleResetPasswordOtp}
                      disabled={pwdLoading || otpCode.length !== 6 || !newPassword.trim()}
                      className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-600/30"
                    >
                      {pwdLoading ? 'Resetting Password...' : 'Create & Save New Password'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {pwdError && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
              {pwdError}
            </div>
          )}
          {pwdSuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs text-center font-medium">
              {pwdSuccess}
            </div>
          )}
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs text-center font-medium">
            {successMsg}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-slate-950 font-bold text-sm shadow-xl transition disabled:opacity-50"
        >
          {saving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </div>
    </div>
  );
};
