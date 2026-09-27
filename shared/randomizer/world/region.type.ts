/* @layer shared-game @kind types */
/**
 * Types of the ported world graph (Archipelago worlds/alttp/Regions.py
 * `create_regions`, Dungeons.py `create_dungeons`): what the wiring in
 * build-world produces out of the records and what the graph sweep walks. A
 * region and an exit are still named; a location is its own key.
 */
import type { ConnectionId, DungeonId, ItemId, RegionId } from '@shared/game/data/types/ids';
import type { RegionType } from '@shared/game/data/types/region';
import type { LocationKey } from './location-key';

/**
 * One passage of the reachability graph (rules/tables/region-graph.data.ts): where it starts,
 * where it ends, and the name the rule tables key its requirement by.
 *
 * Both ends are region ids, because a region is a record. The passage itself stays NAMED: the
 * reference's exits are logical, one per rule, and every rule table keys by that name.
 */
interface RegionGraphRow {
  from: RegionId;
  to: RegionId;
  exit: string;
  /**
   * The crossing the record collection draws for this passage, where exactly one of them joins
   * the same pair of regions. Absent where none does, which is the honest shape for a mirror
   * spot, a retry from the menu or a wing boundary inside one room, and absent where several
   * do, because the pair alone cannot say which door this passage is.
   */
  connectionId?: ConnectionId;
}

/** A resolved location attached to a region. */
interface WorldLocation {
  key: LocationKey;
  region: RegionId;
  /** Exists only when the key-drop-shuffle option is on (python key_drop_data). */
  kdsOnly: boolean;
  /** Exists only when the capacity-upgrade-shuffle option is on (fairy-pond slots). */
  capacityOnly: boolean;
  /**
   * A slot of the rupee pond: one of the two fairy slots a legacy pond hands over (both
   * this and `capacityOnly`), or one of the numbered prize rungs
   * (pond/pond-locations.data.ts) every other mode replaces them with, present only while
   * the pond carries that many prizes.
   */
  pondSlot: boolean;
  /** Boss prize slot (crystal flag in the python location_table), never a pool item. */
  prize: boolean;
  /** Carries a logic event (address None in the python location_table), never a pool item. */
  event: boolean;
  /** For key-drop, capacity and npc-scope locations: the item sitting there in vanilla. */
  vanillaItem?: ItemId;
}

/**
 * A resolved exit: source region → target region, gated by a rule looked up by name.
 *
 * The two regions are ids, because a region is a record. The exit itself stays named: the
 * reference's exits are logical passages, one per rule, and the rule tables key by that name.
 */
interface Exit {
  name: string;
  source: RegionId;
  target: RegionId;
}

/** A wired region. Its identity comes from the record; the world-zone flags from the zone sweep. */
interface Region {
  id: RegionId;
  name: string;
  type: RegionType;
  locations: WorldLocation[];
  exits: Exit[];
  entrances: Exit[];
  isLightWorld: boolean;
  isDarkWorld: boolean;
}

/**
 * A dungeon as the rules and the fill see it: the record's own facts, with each restricted
 * item resolved to the pool name the fill carries, plus the regions it spans. Every field
 * is read off `DungeonRecord` and the region records; nothing here is a fact of its own.
 */
interface WorldDungeon {
  id: DungeonId;
  name: string;
  regions: readonly RegionId[];
  bigKey: ItemId | null;
  smallKey: ItemId;
  /** Small keys this dungeon owns with key drops ON (the record's own count). */
  smallKeyCount: number;
  map: ItemId | null;
  compass: ItemId | null;
}

export type {
  RegionGraphRow,
  WorldLocation,
  Exit,
  Region,
  WorldDungeon,
};
