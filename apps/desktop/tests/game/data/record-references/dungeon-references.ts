/* @layer tests @kind helper */
import type { DungeonRecord } from '@rotp/game-data';
import type { Sink } from './record-references.type';

const dungeonReferences = (dungeon: DungeonRecord, take: Sink): void => {
  take('check', 'bossCheckId', dungeon.bossCheckId);
  take('check', 'prizeCheckId', dungeon.prizeCheckId);
  take('actor', 'bossActorId', dungeon.bossActorId);
  take('item', 'medallionGate', dungeon.medallionGate);
  take('item', 'items.bigKey', dungeon.items.bigKey);
  take('item', 'items.smallKey', dungeon.items.smallKey);
  take('item', 'items.map', dungeon.items.map);
  take('item', 'items.compass', dungeon.items.compass);
  for (const id of dungeon.roomScreenIds) take('screen', 'roomScreenIds', id);
  for (const id of dungeon.regionIds) take('region', 'regionIds', id);
};

export { dungeonReferences };
