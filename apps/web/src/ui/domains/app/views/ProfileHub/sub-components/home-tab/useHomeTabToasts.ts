/* @layer renderer-components @kind hook */
/** Local toast queue for the Home tab, separate from ProfileHub's own so the two
 *  unrelated features never share mutable state. */
import { useState, useCallback } from 'react';
import type { ToastItem, ToastVariant } from '@ds/primitives/Toast';

const TOAST_DURATION_MS = 4000;

const useHomeTabToasts = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, variant, duration: TOAST_DURATION_MS }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
};

export { useHomeTabToasts };
