import React from 'react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'compliment';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card toast-${toast.type} glass-panel`}>
          <div className="toast-icon">
            {toast.type === 'compliment' && '✨'}
            {toast.type === 'success' && '✅'}
            {toast.type === 'info' && 'ℹ️'}
            {toast.type === 'warning' && '⚠️'}
          </div>
          <div className="toast-body">
            {toast.title && <h4 className="toast-title">{toast.title}</h4>}
            <p className="toast-message">{toast.message}</p>
          </div>
          <button className="toast-close" onClick={() => onDismiss(toast.id)}>
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};
