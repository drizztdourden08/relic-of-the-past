/* @layer shared-game @kind logic */
/** Reverse gameId -> ItemRecord lookups, pre-built once per rebuild(). */
import type { ItemGameId, ItemRecord } from '../types';

const itemByReceiveId = new Map<number, ItemRecord>();

const rebuildItemIndex = (records: readonly ItemRecord[]): void => {
  itemByReceiveId.clear();
  for (const item of records) {
    if (item.gameId?.receiveItemId !== undefined) itemByReceiveId.set(item.gameId.receiveItemId, item);
  }
};

const itemByGameId = (match: Partial<ItemGameId>): ItemRecord | undefined =>
  match.receiveItemId !== undefined ? itemByReceiveId.get(match.receiveItemId) : undefined;

export { rebuildItemIndex, itemByGameId };
