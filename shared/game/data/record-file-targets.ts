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
  AreaId, DungeonRecord, InteriorKind, ScreenGameId, ScreenId, ScreenKind, World,
} from './types';

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
  world: World;
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

export { connectionRecordFile, dungeonForPalaceIndex, dungeonForScreen, screenRecordFile };
export type { FileTarget, ScreenHome };
