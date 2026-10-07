/* @layer shared-game @kind logic */
/**
 * One dungeon as the rules and the fill see it, read off its record.
 *
 * The engine used to keep its own copy of every dungeon's keys, map, compass, small-key count
 * and wings. Those are facts about the dungeon, so they live on `DungeonRecord` and this shapes
 * them into the flat row the rules and the fill read, each item as its own id.
 *
 * The record collections are read directly, as the pond's eligibility rule reads the items:
 * this module is imported by world building, which runs before anything seeds the registry.
 */
import { all } from '@shared/game/data';
import type { DungeonId } from '@shared/game/data/types/ids';
import type { DungeonRecord } from '@shared/game/data/types';
import type { WorldDungeon } from './region.type';

const RECORD_BY_ID: ReadonlyMap<string, DungeonRecord> = new Map(all('dungeon').map((d) => [d.id, d]));

const worldDungeonOf = (id: DungeonId): WorldDungeon => {
  const record = RECORD_BY_ID.get(id);
  if (record === undefined) throw new Error(`no dungeon record: ${id}`);
  const smallKey = record.items.smallKey;
  if (smallKey === null) throw new Error(`dungeon ${id} names no small key`);
  return {
    id,
    name: record.name,
    // The record's own array order, which is the order the prefill pushes this dungeon's items in.
    regions: record.regionIds,
    bigKey: record.items.bigKey,
    smallKey,
    smallKeyCount: record.items.smallKeyCount,
    map: record.items.map,
    compass: record.items.compass,
  };
};

export { worldDungeonOf };
