/* @layer shared-game @kind logic */
import { getDungeon } from '../facade';
import { dungeonItemReceiveIdOf } from '../dungeon-item-receive-id';
import type { ItemRecord } from '../types';
import { DUNGEON_ITEM_KIND_OF_SPRITE } from './dungeon-item-kind-of-sprite.constants';

const dungeonItemReceiveIdOfRecord = (record: ItemRecord | undefined): number | undefined => {
  if (record?.dungeonId === undefined || record.spriteId === undefined) return undefined;
  const kind = DUNGEON_ITEM_KIND_OF_SPRITE[record.spriteId];
  if (kind === undefined) return undefined;
  const palaceIndex = getDungeon(record.dungeonId).gameId.palaceIndex;
  return palaceIndex === undefined ? undefined : dungeonItemReceiveIdOf(kind, palaceIndex >> 1);
};

export { dungeonItemReceiveIdOfRecord };
