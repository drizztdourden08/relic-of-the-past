/* @layer bridge-wasm @kind logic */
import { clearPendingPoll } from './clear-pending-poll';
import { disarmGestureResume } from './disarm-gesture-resume';
import { volumeState } from './volume-state';

const resetMasterVolume = (): void => {
  volumeState.gainNode = null;
  volumeState.pendingVolume = null;
  clearPendingPoll();
  disarmGestureResume();
};

export { resetMasterVolume };
