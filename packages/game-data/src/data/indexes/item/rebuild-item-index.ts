/* @layer shared-game @kind logic */
import type { ItemRecord } from '../../types';
import { itemIndexMaps } from './item-index-maps';

const rebuildItemIndex = (records: readonly ItemRecord[]): void => {
  itemIndexMaps.byReceiveId.clear();
  for (const item of records) {
    if (item.gameId?.receiveItemId !== undefined) itemIndexMaps.byReceiveId.set(item.gameId.receiveItemId, item);
  }
};

export { rebuildItemIndex };
