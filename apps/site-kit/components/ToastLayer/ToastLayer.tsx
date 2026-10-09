/* @layer site-kit @kind component */
import { useSyncExternalStore } from 'react';
import { ToastContainer } from '@drizztdourden08/tessera/composites';
import { dismissToast, subscribeToasts, toastsSnapshot } from '../../toast/toast-store';
import { NO_TOASTS } from './ToastLayer.constants';

const serverSnapshot = () => NO_TOASTS;

const ToastLayer = () => {
  const toasts = useSyncExternalStore(subscribeToasts, toastsSnapshot, serverSnapshot);
  return <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-left" />;
};

export { ToastLayer };
