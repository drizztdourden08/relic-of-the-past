/* @layer site-kit @kind logic */
import type { ToastState } from './toast-store.type';

const toastState: ToastState = { toasts: [], nextId: 1, listeners: new Set() };

export { toastState };
