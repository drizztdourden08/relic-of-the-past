/**
 * Toast — non-blocking notification rendered via Portal into the toast layer.
 *
 * Renders in the bottom-right corner. Supports danger/warning/info variants.
 * Provides a close button. Can auto-dismiss after a timeout.
 */

import { useState, useEffect, useCallback } from 'react';
import { Portal } from '../Portal';
import './Toast.css';

export type ToastVariant = 'danger' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number; // ms, 0 = persistent until dismissed
}

interface ToastProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

function Toast({ item, onDismiss }: ToastProps): JSX.Element {
  const [exiting, setExiting] = useState(false);
  const variant = item.variant ?? 'info';

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(item.id), 200);
  }, [item.id, onDismiss]);

  useEffect(() => {
    if (item.duration && item.duration > 0) {
      const timer = setTimeout(dismiss, item.duration);
      return () => clearTimeout(timer);
    }
  }, [item.duration, dismiss]);

  return (
    <div className={`toast toast--${variant} ${exiting ? 'toast--exiting' : ''}`}>
      <span className="toast__message">{item.message}</span>
      <button className="toast__close" onClick={dismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps): JSX.Element | null {
  if (toasts.length === 0) return null;

  return (
    <Portal layer="toast">
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} item={t} onDismiss={onDismiss} />
        ))}
      </div>
    </Portal>
  );
}
