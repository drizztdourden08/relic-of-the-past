/* @layer bridge-wasm @kind logic */
export { ITEM_ID_TO_NAME } from '@shared/game/items/id-map';
export type { RawInventoryState } from './inventory';
export { parseInventoryBuffer, inventoryToItemSet } from './inventory';
export type { UnknownItemEntry } from './bridge';
export {
  initTrackerBridge,
  destroyTrackerBridge,
  onItemReceived,
  onInventoryChanged,
  onUnknownItem,
  onCompletedChecksChanged,
  getCurrentInventory,
  getCompletedChecks,
  getUnknownItems,
  loadUnknownItems,
  pollInventoryState,
  pollRoomFlags,
} from './bridge';
