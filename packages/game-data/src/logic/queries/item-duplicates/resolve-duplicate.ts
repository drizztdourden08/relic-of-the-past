/* @layer shared-game @kind logic */
import { getItem, getItemByGameId } from '../../../data';
import type { ItemId } from '../../../data';

const resolveDuplicate = (itemId: number, owned: ReadonlySet<ItemId>): number => {
  const item = getItemByGameId({ receiveItemId: itemId });
  if (!item?.aliasOf) return itemId;
  if (!owned.has(item.id)) return itemId;
  const altNativeId = getItem(item.aliasOf).gameId?.receiveItemId;
  return altNativeId ?? itemId;
};

export { resolveDuplicate };
