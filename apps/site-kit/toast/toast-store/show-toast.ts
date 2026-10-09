/* @layer site-kit @kind logic */
import { publishToasts } from './publish-toasts';
import { toastState } from './toast-state';
import { DEFAULT_DURATION_MS } from './toast-store.constants';
import type { ToastInput } from './toast-store.type';

const showToast = (input: ToastInput): string => {
  const id = `toast-${toastState.nextId++}`;
  publishToasts([...toastState.toasts, { duration: DEFAULT_DURATION_MS, ...input, id }]);
  return id;
};

export { showToast };
