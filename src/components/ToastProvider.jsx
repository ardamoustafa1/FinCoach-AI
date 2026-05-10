import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { ToastContext } from '../contexts/toastContext';

const TIP_STIL = {
  info: {
    icon: Info,
    cls: 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300',
    iconCls: 'text-blue-500',
  },
  success: {
    icon: CheckCircle,
    cls: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    iconCls: 'text-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    cls: 'border-warn-500/25 bg-warn-500/10 text-warn-700 dark:text-warn-400',
    iconCls: 'text-warn-500',
  },
  error: {
    icon: XCircle,
    cls: 'border-danger-500/25 bg-danger-500/10 text-danger-600 dark:text-danger-400',
    iconCls: 'text-danger-500',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((type, message, options = {}) => {
    const id = crypto.randomUUID();
    const toast = { id, type, message };
    setToasts(prev => [toast, ...prev].slice(0, 5));

    const duration = options.duration ?? 4000;
    if (duration > 0) {
      window.setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, [removeToast]);

  const value = useMemo(() => ({
    showToast,
    removeToast,
    info: (message, options) => showToast('info', message, options),
    success: (message, options) => showToast('success', message, options),
    warning: (message, options) => showToast('warning', message, options),
    error: (message, options) => showToast('error', message, options),
  }), [removeToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-20 z-[120] w-[min(360px,calc(100vw-32px))] space-y-3 pointer-events-none">
        {toasts.map((toast) => {
          const stil = TIP_STIL[toast.type] || TIP_STIL.info;
          const Icon = stil.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl shadow-surface-950/10 backdrop-blur-xl animate-fade-in-up ${stil.cls}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${stil.iconCls}`} />
                <p className="text-sm font-semibold leading-5 flex-1">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-lg hover:bg-white/30 dark:hover:bg-surface-900/30 transition-colors cursor-pointer"
                  aria-label="Bildirimi kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
