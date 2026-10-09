/* @layer bridge-wasm @kind logic */
import { trackerState } from './tracker-state';
import type { UnknownItemListener } from './bridge.type';

const onUnknownItem = (fn: UnknownItemListener): () => void => {
  trackerState.unknownItemListeners.add(fn);
  return () => trackerState.unknownItemListeners.delete(fn);
};

export { onUnknownItem };
