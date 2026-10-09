/* @layer bridge-wasm @kind logic */
import { captureState } from './capture-state';

const clearPending = (): void => {
  if (captureState.pendingTimer) {
    clearTimeout(captureState.pendingTimer);
    captureState.pendingTimer = null;
  }
  captureState.pending = null;
};

export { clearPending };
