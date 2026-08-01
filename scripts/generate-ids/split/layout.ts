/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Where a record lives. Every assignment is TOTAL and DETERMINISTIC, derived
 * from the record's own geography — the same two-level hierarchy the folders
 * follow — so no record needs a hand-written home. File stems come from
 * slugifying the record's own name, which reproduces the file names already on
 * disk exactly (13 dungeons, 17 overworld areas).
 */
import type { SeedArea, SeedCheck, SeedDungeon, SeedItem, SeedScreen } from './seed-types';

const slugify = (name: string): string =>
  name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const INTERIOR_FILE: Record<string, string> = {
  house: 'houses', cave: 'caves', shop: 'shops', fairy: 'fairy', well: 'wells',
  passage: 'passages', hint: 'hints', gamble: 'gamble', special: 'special',
};

const ITEM_CATEGORY_FILE: Record<string, string> = {
  weapon: 'weapons',
  equipment: 'equipment', bottle: 'equipment', upgrade: 'equipment',
  medallion: 'progression', crystal: 'progression', event: 'progression',
  key: 'dungeon-items',
  junk: 'junk',
};

/** Deeper wins when a crossing joins two different kinds of screen. */
const DEPTH: Record<string, number> = { dungeon: 3, interior: 2, overworld: 1 };

interface Geography {
  screenById: Map<string, SeedScreen>;
  /** areaId → file stem, from the area's own name. */
  areaStem: Map<string, string>;
  /** screenId → the dungeon that lists it in roomScreenIds. */
  dungeonIdByScreen: Map<string, string>;
  /** dungeonId → file stem, from the dungeon's own name. */
  dungeonStem: Map<string, string>;
}

const buildGeography = (screens: readonly SeedScreen[], areas: readonly SeedArea[], dungeons: readonly SeedDungeon[]): Geography => {
  const dungeonIdByScreen = new Map<string, string>();
  for (const d of dungeons) for (const sid of d.roomScreenIds) dungeonIdByScreen.set(sid, d.id);
  return {
    screenById: new Map(screens.map(s => [s.id, s])),
    areaStem: new Map(areas.map(a => [a.id, slugify(a.randomizerName)])),
    dungeonIdByScreen,
    dungeonStem: new Map(dungeons.map(d => [d.id, slugify(d.randomizerName)])),
  };
};

/**
 * The bucket a screen belongs to, inside its world folder. An overworld screen
 * whose areaId names no real area is not in a geographic area at all — it lands
 * in `special`, which is where the old hierarchy already kept it.
 */
const screenBucket = (screen: SeedScreen, geo: Geography): string => {
  if (screen.kind === 'dungeon') {
    const dungeonId = geo.dungeonIdByScreen.get(screen.id);
    const stem = dungeonId ? geo.dungeonStem.get(dungeonId) : undefined;
    if (!stem) throw new Error(`dungeon screen ${screen.id} belongs to no dungeon`);
    return `dungeons/${stem}`;
  }
  if (screen.kind === 'overworld') {
    const stem = geo.areaStem.get(screen.areaId);
    return stem ? `overworld/${stem}` : 'special';
  }
  const file = screen.interiorKind ? INTERIOR_FILE[screen.interiorKind] : undefined;
  if (!file) throw new Error(`interior screen ${screen.id} has no usable interiorKind`);
  return file;
};

const screenFile = (screen: SeedScreen, geo: Geography): string =>
  `screens/${screen.world}-world/${screenBucket(screen, geo)}`;

/** A crossing lives with its deeper endpoint; ties go to the `from` side. */
const deeperEndpoint = (fromId: string, toId: string, geo: Geography): SeedScreen => {
  const a = geo.screenById.get(fromId);
  const b = geo.screenById.get(toId);
  if (!a || !b) throw new Error(`connection endpoint missing: ${fromId} → ${toId}`);
  return DEPTH[b.kind] > DEPTH[a.kind] ? b : a;
};

const connectionFile = (fromId: string, toId: string, geo: Geography): string => {
  const deep = deeperEndpoint(fromId, toId, geo);
  return `connections/${deep.world}-world/${screenBucket(deep, geo)}`;
};

const checkFile = (check: SeedCheck, worldOf: (c: SeedCheck) => 'light' | 'dark'): string =>
  check.dungeonId ? 'checks/dungeons' : `checks/${worldOf(check)}-world`;

const itemFile = (item: SeedItem): string => {
  const file = ITEM_CATEGORY_FILE[item.category];
  if (!file) throw new Error(`item ${item.id} has unmapped category ${item.category}`);
  return `items/${file}`;
};

export {
  buildGeography, checkFile, connectionFile, deeperEndpoint, DEPTH,
  INTERIOR_FILE, ITEM_CATEGORY_FILE, itemFile, screenBucket, screenFile, slugify,
};
export type { Geography };
