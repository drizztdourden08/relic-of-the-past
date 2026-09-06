/* @layer shared-game @kind logic */
/**
 * Which dungeon a dungeon-flavoured item belongs to, as the targeted receive
 * id the core grants it by (dungeon-item-receive-id.ts).
 *
 * Read entirely off the records: a family is whatever carries one of the four
 * native receive ids, and its target is the dungeon its own `dungeonId` points
 * at. No name parsing, so a renamed record still resolves and a record with no
 * dungeon of its own (the universal key, which no mode this engine rolls ever
 * places) has no target.
 */
import { findOne, getDungeon } from './facade';
import { DUNGEON_ITEM_NATIVE_IDS, dungeonItemReceiveIdOf } from './dungeon-item-receive-id';
import type { ItemRecord } from './types';

/** The targeted id for one record; undefined for anything outside the four families. */
const dungeonItemReceiveIdOfRecord = (record: ItemRecord | undefined): number | undefined => {
  if (record?.dungeonId === undefined || record.gameId?.receiveItemId === undefined) return undefined;
  const kind = DUNGEON_ITEM_NATIVE_IDS.indexOf(record.gameId.receiveItemId);
  if (kind === -1) return undefined;
  const palaceIndex = getDungeon(record.dungeonId).gameId.palaceIndex;
  return palaceIndex === undefined ? undefined : dungeonItemReceiveIdOf(kind, palaceIndex >> 1);
};

/** Pool-item name → targeted id; undefined for any name outside the four families. */
const dungeonItemReceiveIdOfName = (standardItemName: string): number | undefined =>
  dungeonItemReceiveIdOfRecord(findOne('item', (item) => item.randomizerName === standardItemName));

export { dungeonItemReceiveIdOfName, dungeonItemReceiveIdOfRecord };
