import React, { useState } from 'react';
import { UserCheck, Lock, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UsernameStepProps {
  onSuccess: () => void;
}

export const UsernameStep: React.FC<UsernameStepProps> = ({ onSuccess }) => {
  const { registerUsername } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidLength = username.length >= 3 && username.length <= 20;
  const isValidChars = /^[a-zA-Z0-9._]*$/.test(username);
  const isValidUsername = isValidLength && isValidChars;
  const isValidPassword = password.length >= 6;
  const isMatchingPassword = password === confirmPassword;

  const isFormValid = isValidUsername && isValidPassword && isMatchingPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidUsername) {
      setError('Username must be 3-20 characters long and contain only letters, numbers, dots, or underscores.');
      return;
    }

    if (!isValidPassword) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!isMatchingPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerUsername(username.trim(), password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(225, 0, 255, 0.15), rgba(0, 242, 254, 0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(225, 0, 255, 0.3)'
        }}
      >
        <Sparkles style={{ width: '28px', height: '28px', color: 'var(--accent-pink)' }} />
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Create your <span className="gradient-text">Identity & Password</span>
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Choose a display name and password. You can log in using either Password or OTP next time.
      </p>

      {/* Identity Preview Card */}
      <div
        className="glass-card"
        style={{
          padding: '1rem',
          marginBottom: '1.25rem',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          borderColor: 'rgba(0, 242, 254, 0.2)'
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#fff'
          }}
        >
          {username ? username.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            {username || 'your_username'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
            #A8KD2F (auto-assigned)
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* STEP 1: Set Username Prominent Card */}
        <div
          style={{
            backgroundColor: 'rgba(0, 242, 254, 0.05)',
            border: '1.5px solid rgba(0, 242, 254, 0.4)',
            borderRadius: '16px',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            textAlign: 'left',
            boxShadow: '0 4px 20px rgba(0, 242, 254, 0.12)',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <UserCheck style={{ width: '15px', height: '15px' }} />
              <span>Step 1: Set Anonymous Username</span>
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                color: isValidUsername ? '#00E676' : 'var(--text-muted)',
                fontWeight: 700
              }}
            >
              {username.length}/20 chars
            </span>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                position: 'absolute',
                left: '14px',
                color: 'var(--accent-cyan)',
                fontWeight: 900,
                fontSize: '1.1rem',
                pointerEvents: 'none'
              }}
            >
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="cool_panda"
              disabled={loading}
              maxLength={20}
              style={{
                width: '100%',
                padding: '0.9rem 1rem 0.9rem 2.4rem',
                backgroundColor: '#080b16',
                border: isValidUsername
                  ? '1.5px solid #00f2fe'
                  : error
                  ? '1.5px solid var(--color-error)'
                  : '1px solid rgba(0, 242, 254, 0.3)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '1.05rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                outline: 'none',
                boxShadow: isValidUsername ? '0 0 14px rgba(0, 242, 254, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
        </div>

        {/* STEP 2: Account Security Section */}
        <div style={{ textAlign: 'left', marginTop: '0.2rem' }}>
          <span
            style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.6rem',
              display: 'block'
            }}
          >
            Step 2: Set Account Password
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Password Field */}
            <div style={{ position: 'relative' }}>
              <Lock
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  width: '18px',
                  height: '18px'
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password (min 6 chars)"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: error ? '1px solid var(--color-error)' : '1px solid var(--bg-glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Confirm Password Field */}
            <div style={{ position: 'relative' }}>
              <Lock
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  width: '18px',
                  height: '18px'
                }}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: error ? '1px solid var(--color-error)' : '1px solid var(--bg-glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Validation Checks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', textAlign: 'left', fontSize: '0.775rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isValidUsername ? 'var(--color-success)' : 'var(--text-muted)' }}>
            {isValidUsername ? <Check style={{ width: '14px', height: '14px' }} /> : <AlertCircle style={{ width: '14px', height: '14px' }} />}
            <span>Username: 3-20 letters/numbers/dots/underscores</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isValidPassword ? 'var(--color-success)' : 'var(--text-muted)' }}>
            {isValidPassword ? <Check style={{ width: '14px', height: '14px' }} /> : <AlertCircle style={{ width: '14px', height: '14px' }} />}
            <span>Password: At least 6 characters</span>
          </div>
          {password.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isMatchingPassword ? 'var(--color-success)' : 'var(--color-error)' }}>
              {isMatchingPassword ? <Check style={{ width: '14px', height: '14px' }} /> : <AlertCircle style={{ width: '14px', height: '14px' }} />}
              <span>Passwords match</span>
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(255, 77, 77, 0.12)',
              border: '1px solid rgba(255, 77, 77, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 0.9rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              textAlign: 'left',
              color: '#FF6B6B',
              fontSize: '0.825rem',
              lineHeight: '1.4',
              maxWidth: '100%',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
              boxSizing: 'border-box'
            }}
          >
            <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ flex: 1, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              {error}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isFormValid}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
            boxShadow: 'var(--shadow-glow)',
            opacity: loading || !isFormValid ? 0.6 : 1,
            marginTop: '0.5rem'
          }}
        >
          {loading ? 'Entering Echo...' : 'Complete Registration'}
        </button>
      </form>
    </div>
  );
};
