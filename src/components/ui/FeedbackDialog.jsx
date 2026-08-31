import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { MsIcon } from './MsIcon';

const ICONS = {
  success: 'check_circle',
  danger: 'error',
  warning: 'warning',
  info: 'info',
};

export function FeedbackDialog({ open, tone = 'success', title, message, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="overlay" onClick={onClose} role="presentation">
      <div
        className={`feedback-dialog feedback-${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="feedback-icon" aria-hidden="true">
          <MsIcon name={ICONS[tone] || ICONS.info} filled />
        </span>
        <h2 id="feedback-title">{title}</h2>
        {message ? <p>{message}</p> : null}
        <Button onClick={onClose}>{tone === 'danger' ? 'Close' : 'Done'}</Button>
      </div>
    </div>,
    document.body
  );
}
