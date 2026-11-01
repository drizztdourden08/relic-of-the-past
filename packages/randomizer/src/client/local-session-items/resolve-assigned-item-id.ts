/* @layer bridge-wasm @kind logic */
import { dungeonItemReceiveIdOfRecord, getItem, progressiveReceiveIdOfItem, upgradeReceiveIdOfItem } from '@rotp/game-data';
import { receiveIdOf } from '../item-lookup/receive-id-of';

const resolveAssignedItemId = (itemId: string): number | undefined => {
  const virtual = progressiveReceiveIdOfItem(itemId) ?? upgradeReceiveIdOfItem(itemId);
  if (virtual !== undefined) return virtual;
  const record = getItem(itemId);
  const targetedAtOwnDungeon = dungeonItemReceiveIdOfRecord(record);
  if (targetedAtOwnDungeon !== undefined) return targetedAtOwnDungeon;
  return receiveIdOf(record);
};

export { resolveAssignedItemId };
