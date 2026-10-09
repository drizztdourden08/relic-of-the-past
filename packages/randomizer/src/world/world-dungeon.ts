/* @layer shared-game @kind logic */
import { DUNGEON_RECORD_BY_ID } from './world-dungeon.constants';
import type { DungeonId } from '@rotp/game-data';
import type { WorldDungeon } from './region.type';

const worldDungeonOf = (id: DungeonId): WorldDungeon => {
  const record = DUNGEON_RECORD_BY_ID.get(id);
  if (record === undefined) throw new Error(`no dungeon record: ${id}`);
  const smallKey = record.items.smallKey;
  if (smallKey === null) throw new Error(`dungeon ${id} names no small key`);
  return {
    id,
    name: record.name,
    regions: record.regionIds,
    bigKey: record.items.bigKey,
    smallKey,
    smallKeyCount: record.items.smallKeyCount,
    map: record.items.map,
    compass: record.items.compass,
  };
};

export { worldDungeonOf };
