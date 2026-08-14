import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface EmailStepProps {
  onSuccess: (email: string) => void;
}

export const EmailStep: React.FC<EmailStepProps> = ({ onSuccess }) => {
  const { loginWithPassword } = useAuth();
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'password') {
        if (!password.trim()) {
          setError('Please enter your password');
          setLoading(false);
          return;
        }
        await loginWithPassword(trimmedEmail, password);
      } else {
        await api.sendOtp(trimmedEmail);
        onSuccess(trimmedEmail);
      }
    } catch (err: any) {
      setError(err.message || (mode === 'password' ? 'Login failed. Check your email & password or try OTP.' : 'Failed to send OTP code.'));
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
          margin: '0 auto 1.2rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(225, 0, 255, 0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0, 242, 254, 0.3)'
        }}
      >
        <Sparkles style={{ width: '28px', height: '28px', color: 'var(--accent-cyan)' }} />
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>
        Talk beyond <span className="gradient-text">hesitation</span>
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
        {mode === 'password' ? 'Log in securely using your Email and Password.' : 'Enter your email to receive a single-use login or registration OTP.'}
      </p>

      {/* Context Badge for OTP */}
      {mode === 'otp' && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(0, 242, 254, 0.12)',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            borderRadius: '20px',
            padding: '0.35rem 0.85rem',
            fontSize: '0.75rem',
            color: 'var(--accent-cyan)',
            fontWeight: 700,
            marginBottom: '1.25rem',
            boxShadow: '0 0 12px rgba(0, 242, 254, 0.15)'
          }}
        >
          <Sparkles style={{ width: '13px', height: '13px' }} />
          <span>No Password Needed • Instant OTP Login / Register</span>
        </div>
      )}

      {/* Mode Selector Toggle */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'rgba(15, 7, 36, 0.8)',
          borderRadius: '14px',
          padding: '4px',
          marginBottom: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        <button
          type="button"
          onClick={() => { setMode('otp'); setError(null); }}
          style={{
            flex: 1,
            padding: '0.65rem 0.5rem',
            borderRadius: '10px',
            border: mode === 'otp' ? '1px solid rgba(0, 242, 254, 0.6)' : '1px solid transparent',
            background: mode === 'otp'
              ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)'
              : 'transparent',
            color: mode === 'otp' ? '#070b14' : 'var(--text-secondary)',
            fontSize: '0.825rem',
            fontWeight: mode === 'otp' ? 800 : 600,
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            boxShadow: mode === 'otp' ? '0 0 16px rgba(0, 242, 254, 0.45)' : 'none'
          }}
        >
          <ShieldCheck style={{ width: '16px', height: '16px', color: mode === 'otp' ? '#070b14' : 'var(--accent-cyan)' }} />
          <span>OTP Login / Register</span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '2px 5px',
              borderRadius: '4px',
              backgroundColor: mode === 'otp' ? '#070b14' : 'rgba(0, 242, 254, 0.15)',
              color: mode === 'otp' ? '#00f2fe' : 'var(--accent-cyan)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            FAST
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('password'); setError(null); }}
          style={{
            flex: 1,
            padding: '0.65rem 0.5rem',
            borderRadius: '10px',
            border: mode === 'password' ? '1px solid rgba(225, 0, 255, 0.5)' : '1px solid transparent',
            background: mode === 'password'
              ? 'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)'
              : 'transparent',
            color: mode === 'password' ? '#ffffff' : 'var(--text-muted)',
            fontSize: '0.825rem',
            fontWeight: mode === 'password' ? 800 : 600,
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            boxShadow: mode === 'password' ? '0 0 16px rgba(127, 0, 255, 0.35)' : 'none'
          }}
        >
          <KeyRound style={{ width: '15px', height: '15px' }} />
          <span>Password Login</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Mail
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem 1rem 0.85rem 2.75rem',
              backgroundColor: 'var(--bg-primary)',
              border: error ? '1px solid var(--color-error)' : (mode === 'otp' ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid var(--bg-glass-border)'),
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color var(--transition-fast)'
            }}
          />
        </div>

        {mode === 'password' && (
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
              placeholder="Enter your password"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.75rem',
                backgroundColor: 'var(--bg-primary)',
                border: error ? '1px solid var(--color-error)' : '1px solid var(--bg-glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color var(--transition-fast)'
              }}
            />
          </div>
        )}

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
          disabled={loading || !email.trim() || (mode === 'password' && !password.trim())}
          style={{
            width: '100%',
            padding: '0.9rem',
            background: mode === 'otp'
              ? 'linear-gradient(135deg, #00f2fe 0%, #00c6ff 100%)'
              : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: mode === 'otp' ? '#070b14' : '#ffffff',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: mode === 'otp'
              ? '0 0 20px rgba(0, 242, 254, 0.4)'
              : 'var(--shadow-glow)',
            opacity: loading || !email.trim() || (mode === 'password' && !password.trim()) ? 0.6 : 1,
            transition: 'all var(--transition-fast)'
          }}
        >
          {loading ? (
            <span>{mode === 'password' ? 'Logging in...' : 'Sending OTP code...'}</span>
          ) : (
            <>
              {mode === 'otp' ? (
                <>
                  <ShieldCheck style={{ width: '19px', height: '19px' }} />
                  <span>Send Single-Use Code (OTP)</span>
                </>
              ) : (
                <>
                  <span>Log In with Password</span>
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                </>
              )}
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: '1.25rem' }}>
        {mode === 'password' ? (
          <button
            type="button"
            onClick={() => { setMode('otp'); setError(null); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Forgot password? Login using OTP instead
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setMode('password'); setError(null); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-pink)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Have a password? Switch to Password Login
          </button>
        )}
      </div>
    </div>
  );
};
