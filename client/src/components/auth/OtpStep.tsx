import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface OtpStepProps {
  email: string;
  onBack: () => void;
  onSuccess: (isNewUser: boolean) => void;
}

export const OtpStep: React.FC<OtpStepProps> = ({ email, onBack, onSuccess }) => {
  const { loginWithOtp } = useAuth();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of 6 digits
      const digits = value.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithOtp(email, fullOtp);
      onSuccess(res.isNewUser);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await api.sendOtp(email);
      setTimeLeft(300);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
      >
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        <span>Change Email</span>
      </button>

      <div
        style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.15), rgba(127, 0, 255, 0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(79, 172, 254, 0.3)'
        }}
      >
        <ShieldCheck style={{ width: '28px', height: '28px', color: 'var(--accent-violet)' }} />
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Check your email
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        We sent a 6-digit code to <strong style={{ color: 'var(--accent-cyan)' }}>{email}</strong>
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              style={{
                width: '42px',
                height: '50px',
                textAlign: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                backgroundColor: 'var(--bg-primary)',
                border: error ? '1px solid var(--color-error)' : '1px solid var(--bg-glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          ))}
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
          disabled={loading || otp.join('').length !== 6}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: 'var(--shadow-glow)',
            opacity: loading || otp.join('').length !== 6 ? 0.6 : 1
          }}
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>

      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}
      >
        <span>Expires in: <strong style={{ color: 'var(--text-primary)' }}>{formatTimer(timeLeft)}</strong></span>
        <button
          onClick={handleResend}
          disabled={resending || timeLeft > 240}
          style={{
            background: 'none',
            border: 'none',
            color: timeLeft > 240 ? 'var(--text-muted)' : 'var(--accent-cyan)',
            cursor: timeLeft > 240 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <RefreshCw style={{ width: '14px', height: '14px' }} />
          <span>{resending ? 'Sending...' : 'Resend Code'}</span>
        </button>
      </div>
    </div>
  );
};
