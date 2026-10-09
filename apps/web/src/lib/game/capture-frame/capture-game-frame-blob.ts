/* @layer bridge-wasm @kind logic */
import { CAPTURE_TIMEOUT_MS } from './capture-frame.constants';
import { captureState } from './capture-state';
import { clearPending } from './clear-pending';

const captureGameFrameBlob = (): Promise<Blob | null> =>
  new Promise((resolve) => {
    const superseded = captureState.pending;
    if (superseded) superseded(null);
    clearPending();
    captureState.pending = resolve;
    captureState.pendingTimer = setTimeout(() => {
      if (captureState.pending === resolve) {
        clearPending();
        resolve(null);
      }
    }, CAPTURE_TIMEOUT_MS);
  });

export { captureGameFrameBlob };
