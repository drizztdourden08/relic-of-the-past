/* @layer bridge-wasm @kind logic */
import { getItemByGameId } from '@shared/game/data';
import { log } from '../../../log-bus';
import { notifyUnknownItems } from './notify-unknown-items';
import { pollInventoryState } from './poll-inventory-state';
import { trackerState } from './tracker-state';
import type { UnknownItemEntry } from './bridge.type';

const handleItemReceived = (itemId: number, method: number): void => {
  const item = getItemByGameId({ receiveItemId: itemId });
  if (item) {
    log.app(`[Tracker] Item received: ${item.id} ${item.name} (0x${itemId.toString(16)}, method=${method})`);
    for (const fn of trackerState.itemListeners) {
      try { fn(item.id, itemId, method); } catch { continue; }
    }
  } else {
    log.app(`[Tracker] Unknown item id 0x${itemId.toString(16)} (method=${method})`);
    const entry: UnknownItemEntry = { id: itemId, method, timestamp: Date.now() };
    trackerState.unknownItems = [...trackerState.unknownItems, entry];
    notifyUnknownItems();
  }
  queueMicrotask(() => pollInventoryState());
};

export { handleItemReceived };
