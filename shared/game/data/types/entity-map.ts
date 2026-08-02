/* @layer shared-game @kind types */
import type { EntityKind } from './ids';
import type { ScreenRecord } from './screen';
import type { ConnectionRecord } from './connection';
import type { CheckRecord } from './check';
import type { ItemRecord } from './item';
import type { DungeonRecord } from './dungeon';
import type { AreaRecord, LocationRecord } from './region';
import type { ActorRecord } from './actor';
import type { TagRecord } from './tag';
import type { ItemGroupRecord } from './item-group';
import type { EnumerationEntry } from './enumeration';

/** Maps each EntityKind to its record shape, so find()/findOne() stay typed. */
interface EntityRecordMap {
  screen: ScreenRecord;
  connection: ConnectionRecord;
  check: CheckRecord;
  item: ItemRecord;
  dungeon: DungeonRecord;
  area: AreaRecord;
  location: LocationRecord;
  actor: ActorRecord;
  tag: TagRecord;
  'item-group': ItemGroupRecord;
  enumeration: EnumerationEntry;
}

type EntityOf<K extends EntityKind> = EntityRecordMap[K];

export type { EntityOf, EntityRecordMap };
