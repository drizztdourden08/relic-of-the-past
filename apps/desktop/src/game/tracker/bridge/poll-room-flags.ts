/* @layer bridge-wasm @kind logic */
import { getModule } from '@rotp/game-core';
import { log } from '../../../log-bus';
import { readCompletedChecks, setsEqual, pollEventStatus, trackerState } from '@rotp/navigation';
import { notifyListeners } from './notify-listeners';

const ignoreRoomFlagReadFailure = (): void => undefined;

const pollRoomFlags = (force = false): void => {
  const mod = getModule();
  if (!mod) return;

  try {
    const newCompleted = readCompletedChecks(mod, trackerState.currentInventory);
    if (!newCompleted) return;
    pollEventStatus(mod);

    if (force || !setsEqual(trackerState.currentCompletedChecks, newCompleted)) {
      log.app(`[Tracker] Completed checks: ${newCompleted.size} (was ${trackerState.currentCompletedChecks.size})`);
      trackerState.currentCompletedChecks = newCompleted;
      notifyListeners(trackerState.completedChecksListeners, newCompleted);
    }
  } catch {
    ignoreRoomFlagReadFailure();
  }
};

export { pollRoomFlags };
