/* @layer shared-game @kind types */
import type { ActorId, CheckId, DungeonId, ItemId, RegionId, ScreenId } from './ids';
import type { ReviewMark } from './review';

interface DungeonGameId {
  palaceIndex?: number;
  bossRoomId?: number;
}

/**
 * The restricted items this dungeon owns. `smallKeyCount` is how many small keys exist when
 * every key drop is shuffled; with drops off, one key per drop location stays out of the pool.
 * A dungeon with no big key, map or compass says so with null.
 */
interface DungeonItems {
  bigKey: ItemId | null;
  smallKey: ItemId | null;
  smallKeyCount: number;
  map: ItemId | null;
  compass: ItemId | null;
}

/**
 * Closes a real gap the audit found: boss/prize/medallion facts for the same
 * dungeons were duplicated across checks/dungeons.ts and a second independent
 * room-flag table in checks/flags/room.ts, with medallion requirements living
 * in a third place. One record now.
 */
interface DungeonRecord {
  id: DungeonId;
  gameId: DungeonGameId;
  /** The one name this dungeon answers to. */
  name: string;
  /**
   * The file stem this dungeon's records live under, in both
   * `screens/<world>-world/dungeons/` and `connections/<world>-world/dungeons/`.
   * Carried on the record so a destination path is selected from a `DungeonId`
   * and never derived from a display name, because a rename must not move a file.
   */
  fileStem: string;
  /** Keys, map and compass: what the engine used to keep in its own dungeon table. */
  items: DungeonItems;
  /** The first castle has no boss of its own. */
  bossCheckId?: CheckId;
  /** The two tower dungeons: no prize. */
  prizeCheckId?: CheckId;
  /**
   * The boss this dungeon holds while boss placement is vanilla. The first castle has none.
   *
   * The actor, never a name: a defeat rule is looked up by it (`rules/tables/bosses.data.ts`),
   * and a name would be a second spelling of an actor the dataset already holds.
   */
  bossActorId?: ActorId;
  /** e.g. Ether for Misery Mire. */
  medallionGate?: ItemId;
  roomScreenIds: readonly ScreenId[];
  /**
   * The wings of the reachability partition this dungeon spans. ARRAY ORDER IS LOAD-BEARING:
   * it is the order the reference creates the regions in, and the fill's prefill pass pushes
   * this dungeon's restricted items in it, so a reordering moves items.
   */
  regionIds: readonly RegionId[];
  review?: ReviewMark;
}

export type { DungeonGameId, DungeonItems, DungeonRecord };
