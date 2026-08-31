import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { FeedbackDialog } from './FeedbackDialog';

const ToastContext = createContext(null);

let toastId = 0;

function shouldUseModal(toast) {
  if (toast.as === 'toast') return false;
  if (toast.as === 'modal') return true;
  return toast.tone === 'success' || toast.tone === 'danger';
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [alert, setAlert] = useState(null);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const closeAlert = useCallback(() => setAlert(null), []);

  const push = useCallback((toast) => {
    const next = { tone: 'info', ...toast };
    if (shouldUseModal(next)) {
      setAlert({
        tone: next.tone,
        title: next.title || (next.tone === 'danger' ? 'Something went wrong' : 'Done'),
        message: next.message,
      });
      return;
    }
    const id = ++toastId;
    setToasts((current) => [...current, { id, ...next }]);
    window.setTimeout(() => dismiss(id), next.duration || 4200);
  }, [dismiss]);

  useEffect(() => {
    if (!alert) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') closeAlert();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [alert, closeAlert]);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="toast-stack" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.tone}`}>
              <Icon name={toast.tone === 'success' ? 'check' : toast.tone === 'danger' ? 'alert' : 'info'} size={16} />
              <div>
                {toast.title ? <strong>{toast.title}</strong> : null}
                {toast.message ? <p>{toast.message}</p> : null}
              </div>
              <button type="button" className="icon-btn" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
      <FeedbackDialog
        open={Boolean(alert)}
        tone={alert?.tone}
        title={alert?.title}
        message={alert?.message}
        onClose={closeAlert}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
