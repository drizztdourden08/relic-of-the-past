/* @layer shared-game @kind logic */
/**
 * Vanilla duplicate-item rule (Link_HandleChest, player.c:3850): a handful of
 * chest items swap to an alternate when the primary is already owned. The lamp
 * chest hands out 5 Rupees once you have a lamp.
 *
 * Lives here because FOUR things name a chest's contents: the simulator's
 * delivery, the sim log, the overlay annotation and the C hook. The first three
 * must apply this rule from one place or the overlay promises a Lamp the run will
 * never deliver; the C hook applies the same rule as a backstop.
 *
 * The alternate mapping itself lives on the item record (`ItemRecord.aliasOf`)
 * instead of a separate table here. This reads it via the facade.
 */
import { getItem, getItemByGameId } from '../../data';
import type { ItemId } from '../../data';

/**
 * The item this chest actually yields, given what the player already carries.
 * `itemId` is the NATIVE receive index (the chest's own byte); `owned` is the
 * tracker's set of dataset ids. It used to be a set of display names, which meant
 * asking "already owned?" of a string two records can share.
 */
const resolveDuplicate = (itemId: number, owned: ReadonlySet<ItemId>): number => {
  const item = getItemByGameId({ receiveItemId: itemId });
  if (!item?.aliasOf) return itemId;
  if (!owned.has(item.id)) return itemId;
  const altNativeId = getItem(item.aliasOf).gameId?.receiveItemId;
  return altNativeId ?? itemId;
};

/** True when this item would be swapped out, which a caller may want to say. */
const isDuplicated = (itemId: number, owned: ReadonlySet<ItemId>): boolean =>
  resolveDuplicate(itemId, owned) !== itemId;

const itemLabel = (itemId: number): string =>
  getItemByGameId({ receiveItemId: itemId })?.randomizerName ?? `item 0x${itemId.toString(16)}`;

export { isDuplicated, itemLabel, resolveDuplicate };
