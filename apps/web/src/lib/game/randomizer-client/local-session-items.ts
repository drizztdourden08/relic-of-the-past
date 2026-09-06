/* @layer bridge-wasm @kind logic */
/**
 * Local session item helpers: resolve an assigned dataset item id to the
 * receive-item index the core understands, and to a display name. The
 * progressive families and the counter upgrades have no native id: they
 * resolve to the reserved virtual ranges every grant seam translates, so a
 * progressive copy lands on the next tier from live inventory at grant time. A
 * dungeon-flavoured record resolves to the targeted id naming its own dungeon,
 * so the grant credits that dungeon wherever the item was found.
 */

import {
  asNativeReceiveId, dungeonItemReceiveIdOfRecord, getItem, progressiveReceiveIdOfItem,
  upgradeReceiveIdOfItem,
} from '@shared/game/data';

const resolveAssignedItemId = (itemId: string): number | undefined => {
  const virtual = progressiveReceiveIdOfItem(itemId) ?? upgradeReceiveIdOfItem(itemId);
  if (virtual !== undefined) return virtual;
  const record = getItem(itemId);
  // A dungeon-flavoured record answers with the targeted id of its own dungeon, the same
  // reading item-lookup.ts gives the name, because its native id would credit whichever dungeon
  // the player happens to be standing in.
  const targeted = dungeonItemReceiveIdOfRecord(record);
  if (targeted !== undefined) return targeted;
  if (record.gameId?.receiveItemId !== undefined) return asNativeReceiveId(record.gameId.receiveItemId);
  if (record.aliasOf !== undefined) return asNativeReceiveId(getItem(record.aliasOf).gameId?.receiveItemId);
  return undefined;
};

const assignedItemName = (itemId: string): string => getItem(itemId).randomizerName;

export { assignedItemName, resolveAssignedItemId };
