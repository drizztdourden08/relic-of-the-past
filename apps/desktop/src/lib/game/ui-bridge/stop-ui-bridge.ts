/* @layer bridge-wasm @kind logic */
import { resetHapticPolling } from '../haptic-polling';
import { uiBridgeState } from './ui-bridge-state';

const stopUIBridge = (): void => {
  if (uiBridgeState.rafId !== null) {
    cancelAnimationFrame(uiBridgeState.rafId);
    uiBridgeState.rafId = null;
  }

  uiBridgeState.prevState = null;
  uiBridgeState.storeUpdater = null;
  resetHapticPolling();
};

export { stopUIBridge };
