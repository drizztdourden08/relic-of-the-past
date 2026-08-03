/* @layer shared-game @kind logic */
/**
 * Where an edited record belongs on disk — derived from ids only.
 *
 * A dungeon's destination comes from `DungeonRecord.fileStem`, an overworld
 * screen's from its `AreaId`, an interior's from its `interiorKind`. No display
 * name and no slugified string ever picks a path, so renaming a record can never
 * move (or split) the file its records live in.
 *
 * A path that cannot be derived comes back as `relativePath: null` with a reason
 * — the editor shows that instead of guessing a destination.
 */
import { findOne, getScreen } from './facade';
import type {
  ActorKind, AreaId, DungeonId, DungeonRecord, InteriorKind, ScreenGameId, ScreenId, ScreenKind, ScreenWorld,
} from './types';
import type { ItemCategory } from './taxonomy/item-categories';

/** The overworld file each area's records live in, keyed by the area's frozen id. */
const AREA_FILE_STEMS: Readonly<Record<string, string>> = {
  'area-001': 'central-hyrule',
  'area-002': 'dark-death-mountain',
  'area-003': 'dark-east',
  'area-004': 'dark-lake-hylia',
  'area-005': 'dark-mire',
  'area-006': 'dark-north',
  'area-007': 'dark-south',
  'area-008': 'death-mountain',
  'area-009': 'desert',
  'area-010': 'east-hyrule',
  'area-011': 'hyrule-castle',
  'area-012': 'kakariko',
  'area-013': 'lake-hylia',
  'area-014': 'lost-woods',
  'area-015': 'skull-woods-area',
  'area-016': 'south-hyrule',
  'area-017': 'village-of-outcasts',
};

const INTERIOR_FILE_STEMS: Readonly<Record<InteriorKind, string>> = {
  house: 'houses', cave: 'caves', shop: 'shops', fairy: 'fairy', well: 'wells',
  passage: 'passages', hint: 'hints', gamble: 'gamble', special: 'special',
};

/** Deeper wins when a crossing joins two different kinds of screen. */
const DEPTH: Readonly<Record<ScreenKind, number>> = { dungeon: 3, interior: 2, overworld: 1 };

interface FileTarget {
  /** Path relative to shared/game/data/, or null when no home can be derived. */
  relativePath: string | null;
  /** Why the path could not be derived. */
  unresolved?: string;
}

/** The subset of a screen record that decides where it lives. */
interface ScreenHome {
  /** Absent for a screen whose id has not been allocated yet. */
  id?: ScreenId;
  kind: ScreenKind;
  world: ScreenWorld;
  areaId: AreaId;
  interiorKind?: InteriorKind;
  gameId: ScreenGameId;
}

/**
 * The dungeon a palace index belongs to. Matched on the dungeon's own gameId
 * first, then on the palace index its rooms already carry — which is what
 * resolves the two palace values the first castle reports against its single
 * dungeon record.
 */
const dungeonForPalaceIndex = (palaceIndex: number): DungeonRecord | undefined =>
  findOne('dungeon', d => d.gameId.palaceIndex === palaceIndex)
  ?? findOne('dungeon', d => d.roomScreenIds.some(id => getScreen(id).gameId.palaceIndex === palaceIndex));

/** The dungeon a room belongs to — by the list it appears in, else by palace index. */
const dungeonForScreen = (screen: ScreenHome): DungeonRecord | undefined => {
  const id = screen.id;
  const listed = id ? findOne('dungeon', d => d.roomScreenIds.includes(id)) : undefined;
  if (listed) return listed;
  return screen.gameId.palaceIndex === undefined ? undefined : dungeonForPalaceIndex(screen.gameId.palaceIndex);
};

/** The folder a screen's records live in, below `<root>/<world>-world/`. */
const screenBucket = (screen: ScreenHome): FileTarget => {
  if (screen.kind === 'dungeon') {
    const dungeon = dungeonForScreen(screen);
    if (!dungeon) return { relativePath: null, unresolved: 'no dungeon record covers this palace index' };
    return { relativePath: `dungeons/${dungeon.fileStem}` };
  }
  if (screen.kind === 'overworld') {
    // An overworld screen whose areaId names no real area is not in a geographic
    // area at all — it belongs with the other placeless screens, which is where
    // the hierarchy already keeps it.
    const stem = AREA_FILE_STEMS[screen.areaId];
    return { relativePath: stem ? `overworld/${stem}` : INTERIOR_FILE_STEMS.special };
  }
  if (!screen.interiorKind) return { relativePath: null, unresolved: 'interior screen has no interiorKind' };
  return { relativePath: INTERIOR_FILE_STEMS[screen.interiorKind] };
};

const inRoot = (root: 'screens' | 'connections', screen: ScreenHome): FileTarget => {
  const bucket = screenBucket(screen);
  if (bucket.relativePath === null) return bucket;
  return { relativePath: `${root}/${screen.world}-world/${bucket.relativePath}.ts` };
};

const screenRecordFile = (screen: ScreenHome): FileTarget => inRoot('screens', screen);

/** A crossing lives with its deeper endpoint; ties go to the `from` side. */
const connectionRecordFile = (fromScreenId: ScreenId, toScreenId: ScreenId): FileTarget => {
  const a = findOne('screen', s => s.id === fromScreenId);
  const b = findOne('screen', s => s.id === toScreenId);
  if (!a) return { relativePath: null, unresolved: `unknown screen ${fromScreenId}` };
  if (!b) return { relativePath: null, unresolved: `unknown screen ${toScreenId}` };
  return inRoot('connections', DEPTH[b.kind] > DEPTH[a.kind] ? b : a);
};

/**
 * The check file each area's records live in. Keyed on the area's frozen id for
 * the same reason `AREA_FILE_STEMS` is, and kept separate from it because the
 * two trees do not line up: checks are filed under `checks/<world>-world/` with
 * no per-size split, and two areas carry no check file at all. An area absent
 * from this table therefore resolves to "no destination" rather than to a path
 * that does not exist.
 */
const AREA_CHECK_FILES: Readonly<Record<string, string>> = {
  'area-001': 'light-world/central-hyrule',
  'area-008': 'light-world/death-mountain',
  'area-009': 'light-world/desert',
  'area-010': 'light-world/east-hyrule',
  'area-011': 'light-world/hyrule-castle',
  'area-012': 'light-world/kakariko',
  'area-013': 'light-world/lake-hylia',
  'area-014': 'light-world/lost-woods',
  'area-016': 'light-world/south-hyrule',
  'area-002': 'dark-world/dark-death-mountain',
  'area-003': 'dark-world/dark-east',
  'area-005': 'dark-world/dark-mire',
  'area-006': 'dark-world/dark-north',
  'area-007': 'dark-world/dark-south',
  'area-017': 'dark-world/village-of-outcasts',
};

/**
 * One dungeon's checks outgrew a single file and were split by size. A NEW
 * record goes in the last split; an existing one is edited where it already
 * sits, which the writer locates by id rather than by this table.
 */
const SPLIT_DUNGEON_CHECK_FILES: Readonly<Record<string, string>> = {
  'ganons-tower': 'ganons-tower-2',
};

/** The subset of a check record that decides where it lives. */
interface CheckHome {
  screenId?: ScreenId;
  dungeonId?: DungeonId;
}

/**
 * A dungeon check lives with its dungeon, an overworld one with its screen's
 * area. Both sides are derived from ids only — a check with neither, and one
 * whose area has no check file, come back unresolved rather than guessed at.
 */
const checkRecordFile = (check: CheckHome): FileTarget => {
  const dungeonId = check.dungeonId;
  if (dungeonId) {
    const dungeon = findOne('dungeon', d => d.id === dungeonId);
    if (!dungeon) return { relativePath: null, unresolved: `unknown dungeon ${dungeonId}` };
    const stem = SPLIT_DUNGEON_CHECK_FILES[dungeon.fileStem] ?? dungeon.fileStem;
    return { relativePath: `checks/dungeons/${stem}.ts` };
  }
  const screenId = check.screenId;
  if (!screenId) return { relativePath: null, unresolved: 'check names neither a dungeon nor a screen' };
  const screen = findOne('screen', s => s.id === screenId);
  if (!screen) return { relativePath: null, unresolved: `unknown screen ${screenId}` };
  const file = AREA_CHECK_FILES[screen.areaId];
  if (!file) return { relativePath: null, unresolved: `no check file exists for ${screen.areaId}` };
  return { relativePath: `checks/${file}.ts` };
};

/**
 * ONE canonical destination per category for a BRAND-NEW item.
 *
 * This is a deliberate simplification, not a rediscovered historical rule:
 * the committed split has no category→file rule to recover (weapons sit in
 * both weapons.ts and randomizer.ts, junk spans four files, keys three), so
 * continuing it faithfully would mean inventing a size-balancing heuristic
 * for a collection that grows a record very rarely. Existing records are not
 * moved — the writer edits and removes them where they already sit, located by
 * id — so this only ever decides where a newly created record lands.
 */
const ITEM_CATEGORY_FILES: Readonly<Record<ItemCategory, string>> = {
  weapon: 'weapons',
  equipment: 'equipment-2',
  bottle: 'equipment-2',
  upgrade: 'equipment-2',
  junk: 'junk-2',
  key: 'dungeon-items-3',
  crystal: 'progression',
  event: 'progression',
  medallion: 'progression',
};

/**
 * The same bargain for actors, whose committed split IS by kind and then by
 * size within a kind: a new record goes to the last file of its kind's group.
 */
const ACTOR_KIND_FILES: Readonly<Record<ActorKind, string>> = {
  enemy: 'enemies-4',
  object: 'objects-4',
  trigger: 'triggers-2',
  boss: 'bosses',
  npc: 'npcs',
  obstacle: 'obstacles',
};

const itemRecordFile = (item: { category: ItemCategory }): FileTarget =>
  ({ relativePath: `items/${ITEM_CATEGORY_FILES[item.category]}.ts` });

const actorRecordFile = (actor: { kind: ActorKind }): FileTarget =>
  ({ relativePath: `actors/${ACTOR_KIND_FILES[actor.kind]}.ts` });

/**
 * The two dungeon files were split by size alone, with nothing on the record
 * deciding which half it belongs to, so a new record always goes to the second
 * — deterministic, and no heuristic to maintain for a collection of thirteen.
 */
const dungeonRecordFile = (): FileTarget => ({ relativePath: 'dungeons-2.ts' });

const areaRecordFile = (): FileTarget => ({ relativePath: 'areas.ts' });

const locationRecordFile = (): FileTarget => ({ relativePath: 'locations.ts' });

export {
  actorRecordFile, areaRecordFile, checkRecordFile, connectionRecordFile, dungeonForPalaceIndex,
  dungeonForScreen, dungeonRecordFile, itemRecordFile, locationRecordFile, screenRecordFile,
};
export type { CheckHome, FileTarget, ScreenHome };
