/* @layer site-kit @kind logic */
import type { ToastItem } from '@drizztdourden08/tessera/composites';
import { toastState } from './toast-state';

const publishToasts = (next: ToastItem[]) => {
  toastState.toasts = next;
  toastState.listeners.forEach((listener) => listener());
};

export { publishToasts };
