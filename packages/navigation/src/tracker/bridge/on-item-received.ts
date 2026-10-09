/* @layer bridge-wasm @kind logic */
import { trackerState } from './tracker-state';
import type { ItemReceivedListener } from './bridge.type';

const onItemReceived = (fn: ItemReceivedListener): () => void => {
  trackerState.itemListeners.add(fn);
  return () => trackerState.itemListeners.delete(fn);
};

export { onItemReceived };
