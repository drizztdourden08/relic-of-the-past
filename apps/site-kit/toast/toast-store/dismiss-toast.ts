/* @layer site-kit @kind logic */
import { publishToasts } from './publish-toasts';
import { toastState } from './toast-state';

const dismissToast = (id: string) => publishToasts(toastState.toasts.filter((toast) => toast.id !== id));

export { dismissToast };
