/* @layer shared-game @kind logic */
/**
 * Where an edited record belongs on disk, derived from ids only (never a
 * display name, so renaming a record can never move its file). A path that
 * cannot be derived comes back as `relativePath: null` with a reason.
 */
import { findOne, getScreen } from './facade';
import type {
  ActorKind, AreaId, DungeonId, DungeonRecord, InteriorKind, ScreenGameId, ScreenId, ScreenKind, ScreenWorld,
} from './types';
import type { ItemCategory } from './taxonomy/item-categories';

// The stem tables live with the record tree and are absent without vault
// access; an empty table makes every resolver take its "no destination" path.
const stemModules = import.meta.glob<Partial<StemTables>>('./records/file-stems.ts', { eager: true });

interface StemTables {
  AREA_FILE_STEMS: Readonly<Record<string, string>>;
  INTERIOR_FILE_STEMS: Partial<Readonly<Record<InteriorKind, string>>>;
  AREA_CHECK_FILES: Readonly<Record<string, string>>;
  SPLIT_DUNGEON_CHECK_FILES: Readonly<Record<string, string>>;
  ITEM_CATEGORY_FILES: Partial<Readonly<Record<ItemCategory, string>>>;
  ACTOR_KIND_FILES: Partial<Readonly<Record<ActorKind, string>>>;
}

const stems = Object.values(stemModules)[0];
const AREA_FILE_STEMS = stems?.AREA_FILE_STEMS ?? {};
const INTERIOR_FILE_STEMS = stems?.INTERIOR_FILE_STEMS ?? {};
const AREA_CHECK_FILES = stems?.AREA_CHECK_FILES ?? {};
const SPLIT_DUNGEON_CHECK_FILES = stems?.SPLIT_DUNGEON_CHECK_FILES ?? {};
const ITEM_CATEGORY_FILES = stems?.ITEM_CATEGORY_FILES ?? {};
const ACTOR_KIND_FILES = stems?.ACTOR_KIND_FILES ?? {};

interface FileTarget {
  /** Path relative to the record tree, or null when no home can be derived. */
  relativePath: string | null;
  /** Why the path could not be derived. */
  unresolved?: string;
}

/** The one reason every resolver can now fail for: nothing to file against. */
const NO_TREE: FileTarget = { relativePath: null, unresolved: 'the record tree is not present' };

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
 * The dungeon a palace index belongs to: matched on the dungeon's own gameId
 * first, then on the palace index its rooms carry, which resolves the two
 * palace values the first castle reports against its single dungeon record.
 */
const dungeonForPalaceIndex = (palaceIndex: number): DungeonRecord | undefined =>
  findOne('dungeon', d => d.gameId.palaceIndex === palaceIndex)
  ?? findOne('dungeon', d => d.roomScreenIds.some(id => getScreen(id).gameId.palaceIndex === palaceIndex));

/** Finds a room's dungeon from the list it appears in, falling back to palace index. */
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
    // An overworld screen whose areaId names no real area belongs with the
    // other placeless screens.
    const stem = AREA_FILE_STEMS[screen.areaId];
    if (stem) return { relativePath: `overworld/${stem}` };
    const placeless = INTERIOR_FILE_STEMS.special;
    return placeless ? { relativePath: placeless } : NO_TREE;
  }
  if (!screen.interiorKind) return { relativePath: null, unresolved: 'interior screen has no interiorKind' };
  const interior = INTERIOR_FILE_STEMS[screen.interiorKind];
  return interior ? { relativePath: interior } : NO_TREE;
};

const inRoot = (root: 'screens' | 'connections', screen: ScreenHome): FileTarget => {
  const bucket = screenBucket(screen);
  if (bucket.relativePath === null) return bucket;
  return { relativePath: `${root}/${screen.world}-world/${bucket.relativePath}.ts` };
};

const screenRecordFile = (screen: ScreenHome): FileTarget => inRoot('screens', screen);

/** A connection point lives in ITS OWN screen's bucket: one record names exactly one screen. */
const connectionRecordFile = (screenId: ScreenId): FileTarget => {
  const screen = findOne('screen', s => s.id === screenId);
  if (!screen) return { relativePath: null, unresolved: `unknown screen ${screenId}` };
  return inRoot('connections', screen);
};

/** The subset of a check record that decides where it lives. */
interface CheckHome {
  screenId?: ScreenId;
  dungeonId?: DungeonId;
}

/**
 * A dungeon check lives with its dungeon, an overworld one with its screen's
 * area. A check with neither, or whose area has no check file, comes back
 * unresolved, never guessed.
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

const itemRecordFile = (item: { category: ItemCategory }): FileTarget => {
  const stem = ITEM_CATEGORY_FILES[item.category];
  return stem ? { relativePath: `items/${stem}.ts` } : NO_TREE;
};

const actorRecordFile = (actor: { kind: ActorKind }): FileTarget => {
  const stem = ACTOR_KIND_FILES[actor.kind];
  return stem ? { relativePath: `actors/${stem}.ts` } : NO_TREE;
};

/** The two dungeon files were split by size alone, so a new record always goes to the second. */
const dungeonRecordFile = (): FileTarget => ({ relativePath: 'dungeons-2.ts' });

const areaRecordFile = (): FileTarget => ({ relativePath: 'areas.ts' });

const locationRecordFile = (): FileTarget => ({ relativePath: 'locations.ts' });

export {
  actorRecordFile, areaRecordFile, checkRecordFile, connectionRecordFile, dungeonForPalaceIndex,
  dungeonForScreen, dungeonRecordFile, itemRecordFile, locationRecordFile, screenRecordFile,
};
export type { CheckHome, FileTarget, ScreenHome };
