/* @layer bridge-wasm @kind logic */
import { resetDashState } from '@rotp/input-mapping';
import { pollingState } from './polling-state';

const resetHapticPolling = (): void => {
  pollingState.prevHandlerState = 0;
  pollingState.prevMainModule = 0;
  pollingState.wasDashing = false;
  resetDashState();
};

export { resetHapticPolling };
