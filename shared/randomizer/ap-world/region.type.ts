/* @layer shared-game @kind types */
/**
 * Types of the ported world graph. The raw *Def shapes mirror the rows
 * transcribed from the reference generator (tests/fixtures/ap-source/
 * Regions.py `create_regions`, Dungeons.py `create_dungeons`); the resolved
 * shapes are what the wiring in build-world produces and the graph sweep
 * walks. Name strings live in the *.data.ts files, never here.
 */

type ApRegionType = 'light' | 'dark' | 'cave' | 'dungeon';

/** Raw region row: one python create_*_region call, minus hint flavor text. */
interface ApRegionDef {
  name: string;
  type: ApRegionType;
  locations: readonly string[];
  exits: readonly string[];
}

/** One wiring row — python (exitname, regionname): [entranceName, targetRegion]. */
type ApConnection = readonly [string, string];

/** A resolved location attached to a region. */
interface ApLocation {
  name: string;
  region: string;
  /** Exists only when the key-drop-shuffle option is on (python key_drop_data). */
  kdsOnly: boolean;
  /** Exists only when the capacity-upgrade-shuffle option is on (fairy-pond slots). */
  capacityOnly: boolean;
  /**
   * A prize slot of the rupee pond (pond/pond-locations.data.ts) — present
   * only while the pond carries that many prizes. The reference's two names
   * are both this and `capacityOnly`; the rest are ours.
   */
  pondSlot: boolean;
  /** Boss prize slot (crystal flag in the python location_table), never a pool item. */
  prize: boolean;
  /** Carries a logic event (address None in the python location_table), never a pool item. */
  event: boolean;
  /** For key-drop, capacity and npc-scope locations: the pool item sitting there in vanilla. */
  vanillaItem?: string;
}

/** A resolved exit: source region → target region, gated by a rule looked up by name. */
interface ApExit {
  name: string;
  source: string;
  target: string;
}

/** A wired region. The world-zone flags are computed by the zone sweep. */
interface ApRegion {
  name: string;
  type: ApRegionType;
  locations: ApLocation[];
  exits: ApExit[];
  entrances: ApExit[];
  isLightWorld: boolean;
  isDarkWorld: boolean;
}

/** Raw dungeon row: one python make_dungeon call (open mode). */
interface ApDungeonDef {
  name: string;
  regions: readonly string[];
  bigKey: string | null;
  smallKey: string;
  /** Small keys this dungeon owns with key drops ON (the python base count). */
  smallKeyCount: number;
  map: string | null;
  compass: string | null;
  /** Vanilla boss (boss shuffle is off in the baseline). null for the first castle. */
  boss: string | null;
  /** Name of this dungeon's prize location, when it awards one. */
  prizeLocation: string | null;
}

export type {
  ApRegionType,
  ApRegionDef,
  ApConnection,
  ApLocation,
  ApExit,
  ApRegion,
  ApDungeonDef,
};
