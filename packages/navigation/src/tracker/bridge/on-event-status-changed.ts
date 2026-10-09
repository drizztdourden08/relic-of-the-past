/* @layer bridge-wasm @kind logic */
import { trackerState } from './tracker-state';
import type { EventStatusListener } from './bridge.type';

const onEventStatusChanged = (fn: EventStatusListener): () => void => {
  trackerState.eventStatusListeners.add(fn);
  return () => trackerState.eventStatusListeners.delete(fn);
};

export { onEventStatusChanged };
