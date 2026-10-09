/* @layer site-kit @kind logic */
import type { ToastItem } from '@ds/primitives/Toast';
import { toastState } from './toast-state';

const publishToasts = (next: ToastItem[]) => {
  toastState.toasts = next;
  toastState.listeners.forEach((listener) => listener());
};

export { publishToasts };
