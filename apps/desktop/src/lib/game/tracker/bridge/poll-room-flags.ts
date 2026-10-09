/* @layer bridge-wasm @kind logic */
import { getModule } from '@rotp/game-core';
import { log } from '../../../log-bus';
import { readCompletedChecks } from '../flag-polling';
import { setsEqual } from '../inventory';
import { pollEventStatus } from './poll-event-status';
import { trackerState } from './tracker-state';

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
      for (const fn of trackerState.completedChecksListeners) {
        try { fn(newCompleted); } catch { continue; }
      }
    }
  } catch {
    return;
  }
};

export { pollRoomFlags };
