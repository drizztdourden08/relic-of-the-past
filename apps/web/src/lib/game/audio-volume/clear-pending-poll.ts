/* @layer bridge-wasm @kind logic */
import { volumeState } from './volume-state';

const clearPendingPoll = (): void => {
  if (volumeState.pendingPollId !== null) {
    clearInterval(volumeState.pendingPollId);
    volumeState.pendingPollId = null;
  }
};

export { clearPendingPoll };
