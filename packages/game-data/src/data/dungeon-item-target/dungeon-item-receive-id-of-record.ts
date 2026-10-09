/* @layer shared-game @kind logic */
import { getDungeon } from '../facade';
import { DUNGEON_ITEM_NATIVE_IDS, dungeonItemReceiveIdOf } from '../dungeon-item-receive-id';
import type { ItemRecord } from '../types';

const dungeonItemReceiveIdOfRecord = (record: ItemRecord | undefined): number | undefined => {
  if (record?.dungeonId === undefined || record.gameId?.receiveItemId === undefined) return undefined;
  const kind = DUNGEON_ITEM_NATIVE_IDS.indexOf(record.gameId.receiveItemId);
  if (kind === -1) return undefined;
  const palaceIndex = getDungeon(record.dungeonId).gameId.palaceIndex;
  return palaceIndex === undefined ? undefined : dungeonItemReceiveIdOf(kind, palaceIndex >> 1);
};

export { dungeonItemReceiveIdOfRecord };
