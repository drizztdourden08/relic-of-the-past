/* @layer site-kit @kind component */
/**
 * The site's toasts, in the bottom-left corner so they never cover the uploads tray on the
 * right. The frame mounts it once on every page; anything shows one with `showToast`.
 */
import { useSyncExternalStore } from 'react';
import { ToastContainer } from '@ds/primitives/Toast';
import type { ToastItem } from '@ds/primitives/Toast';
import { dismissToast, subscribeToasts, toastsSnapshot } from '../../toast/toast-store';

const NO_TOASTS: ToastItem[] = [];
const serverSnapshot = () => NO_TOASTS;

const ToastLayer = () => {
  const toasts = useSyncExternalStore(subscribeToasts, toastsSnapshot, serverSnapshot);
  return <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-left" />;
};

export { ToastLayer };
