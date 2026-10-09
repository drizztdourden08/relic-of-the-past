/* @layer bridge-wasm @kind logic */
import {
  asNativeReceiveId, dungeonItemReceiveIdOfRecord, getItem, progressiveReceiveIdOfItem,
  upgradeReceiveIdOfItem,
} from '@shared/game/data';

const resolveAssignedItemId = (itemId: string): number | undefined => {
  const virtual = progressiveReceiveIdOfItem(itemId) ?? upgradeReceiveIdOfItem(itemId);
  if (virtual !== undefined) return virtual;
  const record = getItem(itemId);
  const targetedAtOwnDungeon = dungeonItemReceiveIdOfRecord(record);
  if (targetedAtOwnDungeon !== undefined) return targetedAtOwnDungeon;
  if (record.gameId?.receiveItemId !== undefined) return asNativeReceiveId(record.gameId.receiveItemId);
  if (record.aliasOf !== undefined) return asNativeReceiveId(getItem(record.aliasOf).gameId?.receiveItemId);
  return undefined;
};

export { resolveAssignedItemId };
