/* @layer site-kit @kind logic */
import { toastState } from './toast-state';

const subscribeToasts = (listener: () => void) => {
  toastState.listeners.add(listener);
  return () => { toastState.listeners.delete(listener); };
};

export { subscribeToasts };
