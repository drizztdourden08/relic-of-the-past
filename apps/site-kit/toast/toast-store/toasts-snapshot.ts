/* @layer site-kit @kind logic */
import type { ToastItem } from '@ds/primitives/Toast';
import { toastState } from './toast-state';

const toastsSnapshot = (): ToastItem[] => toastState.toasts;

export { toastsSnapshot };
