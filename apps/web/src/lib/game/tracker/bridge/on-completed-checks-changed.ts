/* @layer bridge-wasm @kind logic */
import { trackerState } from './tracker-state';
import type { CompletedChecksListener } from './bridge.type';

const onCompletedChecksChanged = (fn: CompletedChecksListener): () => void => {
  trackerState.completedChecksListeners.add(fn);
  return () => trackerState.completedChecksListeners.delete(fn);
};

export { onCompletedChecksChanged };
