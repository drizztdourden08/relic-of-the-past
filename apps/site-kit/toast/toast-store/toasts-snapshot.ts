/* @layer site-kit @kind logic */
import type { ToastItem } from '@drizztdourden08/tessera/composites';
import { toastState } from './toast-state';

const toastsSnapshot = (): ToastItem[] => toastState.toasts;

export { toastsSnapshot };
