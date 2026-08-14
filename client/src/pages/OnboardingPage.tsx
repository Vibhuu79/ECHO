import React, { useState } from 'react';
import { EmailStep } from '../components/auth/EmailStep';
import { OtpStep } from '../components/auth/OtpStep';
import { UsernameStep } from '../components/auth/UsernameStep';
import { Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { registrationToken, isNewUser } = useAuth();
  const [step, setStep] = useState<'email' | 'otp' | 'username'>(() => {
    return (registrationToken || isNewUser) ? 'username' : 'email';
  });
  const [email, setEmail] = useState('');

  const handleEmailSuccess = (enteredEmail: string) => {
    setEmail(enteredEmail);
    setStep('otp');
  };

  const handleOtpSuccess = (isNewUser: boolean) => {
    if (isNewUser) {
      setStep('username');
    } else {
      onComplete();
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '1.25rem 1rem 4rem',
        position: 'relative',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        boxSizing: 'border-box'
      }}
    >
      {/* Echo Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Radio style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px' }} className="gradient-text">
            Echo
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Context-Aware Nearby Interactions
        </div>
      </div>

      {/* Step Container */}
      <div style={{ width: '100%', maxWidth: '380px' }}>
        {step === 'email' && <EmailStep onSuccess={handleEmailSuccess} />}
        {step === 'otp' && (
          <OtpStep
            email={email}
            onBack={() => setStep('email')}
            onSuccess={handleOtpSuccess}
          />
        )}
        {step === 'username' && <UsernameStep onSuccess={onComplete} />}
      </div>
    </div>
  );
};
