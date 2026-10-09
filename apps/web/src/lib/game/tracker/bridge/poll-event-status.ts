/* @layer bridge-wasm @kind logic */
import { readEventStatus } from '../flag-polling';
import { eventStatusEqual } from '../event-status';
import { trackerState } from './tracker-state';
import type { WasmModule } from '../flag-polling';

const pollEventStatus = (mod: WasmModule): void => {
  const next = readEventStatus(mod, trackerState.currentInventory);
  if (!next || eventStatusEqual(trackerState.currentEventStatus, next)) return;
  trackerState.currentEventStatus = next;
  for (const fn of trackerState.eventStatusListeners) {
    try { fn(next); } catch { continue; }
  }
};

export { pollEventStatus };
