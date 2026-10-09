/* @layer bridge-wasm @kind logic */
import { trackerState } from './tracker-state';

const notifyUnknownItems = (): void => {
  for (const fn of trackerState.unknownItemListeners) {
    try { fn(trackerState.unknownItems); } catch { continue; }
  }
};

export { notifyUnknownItems };
