/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback } from 'react';
import type { ToastProps } from './Toast.type';
import './Toast.css';

const Toast = (props: ToastProps) => {
  const { item, onDismiss } = props;
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
    <div className={`toast toast--${variant} ${exiting ? 'toast--exiting' : ''}`} role="status" aria-label={item.content ? item.message : undefined}>
      {item.content
        ? <div className="toast__content">{item.content}</div>
        : <span className="toast__message">{item.message}</span>}
      <button className="toast__close" onClick={dismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
};

export { Toast };
