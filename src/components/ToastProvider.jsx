import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { ToastContext } from '../contexts/toastContext';

const TIP_STIL = {
  info:    { icon: Info,          color: '#6E93C4', bg: 'rgba(110,147,196,0.1)',  border: 'rgba(110,147,196,0.25)' },
  success: { icon: CheckCircle,   color: '#34C08A', bg: 'rgba(52,192,138,0.1)', border: 'rgba(52,192,138,0.25)' },
  warning: { icon: AlertTriangle, color: '#D2894F', bg: 'rgba(210,137,79,0.1)', border: 'rgba(210,137,79,0.25)' },
  error:   { icon: XCircle,       color: '#DB5C4E', bg: 'rgba(219,92,78,0.1)',  border: 'rgba(219,92,78,0.25)' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type, message, options = {}) => {
    const id = crypto.randomUUID();
    setToasts(prev => [{ id, type, message }, ...prev].slice(0, 5));
    const duration = options.duration ?? 4000;
    if (duration > 0) window.setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  const value = useMemo(() => ({
    showToast, removeToast,
    info:    (msg, opts) => showToast('info', msg, opts),
    success: (msg, opts) => showToast('success', msg, opts),
    warning: (msg, opts) => showToast('warning', msg, opts),
    error:   (msg, opts) => showToast('error', msg, opts),
  }), [removeToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 24, zIndex: 120, width: 'min(360px, calc(100vw - 32px))', display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        {toasts.map((toast) => {
          const stil = TIP_STIL[toast.type] || TIP_STIL.info;
          const Icon = stil.icon;
          return (
            <div key={toast.id} style={{
              pointerEvents: 'auto',
              padding: '12px 16px',
              borderRadius: 16,
              background: `rgba(20,23,40,0.96)`,
              border: `1px solid ${stil.border}`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${stil.border}`,
              display: 'flex', alignItems: 'flex-start', gap: 12,
              animation: 'fadeSlideUp 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: stil.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={17} color={stil.color} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5, flex: 1, color: '#F2F4F5', paddingTop: 6 }}>{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} style={{ padding: 4, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6B7075', flexShrink: 0 }} aria-label="Kapat">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
