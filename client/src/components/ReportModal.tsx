import React, { useState } from 'react';
import { moderationService, ReportCategory } from '../services/moderationService';

interface ReportModalProps {
  isOpen: boolean;
  targetEchoId: string;
  targetUsername?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: { label: string; value: ReportCategory; description: string }[] = [
  { label: 'Spam', value: 'spam', description: 'Repeated messages, unwanted advertising, or bots.' },
  { label: 'Harassment', value: 'harassment', description: 'Bullying, offensive language, or persistent unwanted attention.' },
  { label: 'Inappropriate Content', value: 'inappropriate_content', description: 'NSFW text, explicit language, or hate speech.' },
  { label: 'Fake Identity', value: 'fake_identity', description: 'Impersonating another person or entity.' },
  { label: 'Other', value: 'other', description: 'Any other safety concern not listed above.' }
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  targetEchoId,
  targetUsername,
  onClose,
  onSuccess
}) => {
  const [category, setCategory] = useState<ReportCategory>('harassment');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await moderationService.submitReport(targetEchoId, category, context.trim());
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card" style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🛡️</span> Report User
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.7 }}>
              Reporting <strong style={{ color: '#a78bfa' }}>{targetUsername || targetEchoId}</strong> ({targetEchoId})
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Report Submitted</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0 }}>
              Thank you for keeping the Echo community safe. Our safety engine has logged this report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1rem'
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Select Reason:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: category === cat.value ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                    background: category === cat.value ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: category === cat.value ? '#c4b5fd' : '#fff' }}>
                    {cat.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.2rem' }}>{cat.description}</div>
                </div>
              ))}
            </div>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Additional Context (Optional):
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe what happened..."
              maxLength={500}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                resize: 'none',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                marginBottom: '1.5rem'
              }}
            />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
                style={{ padding: '0.6rem 1.2rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
