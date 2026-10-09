/* @layer bridge-wasm @kind logic */
import { trackerState } from './tracker-state';
import type { InventoryChangedListener } from './bridge.type';

const onInventoryChanged = (fn: InventoryChangedListener): () => void => {
  trackerState.inventoryListeners.add(fn);
  return () => trackerState.inventoryListeners.delete(fn);
};

export { onInventoryChanged };
