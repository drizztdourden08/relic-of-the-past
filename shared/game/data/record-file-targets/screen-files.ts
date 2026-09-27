/* @layer shared-game @kind logic */
/**
 * Where a screen and its connection points are filed. A connection point lives in ITS OWN
 * screen's file: one record names exactly one screen, and the connections tree mirrors the
 * screens tree path for path.
 */
import { findOne, getScreen } from '../facade';
import type { AreaId, DungeonRecord, InteriorKind, ScreenGameId, ScreenId, ScreenKind, ScreenWorld } from '../types';
import { AREA_FOLDERS, DUNGEON_FLOORS, PLACELESS, SPLIT_BY_HALF, worldFolder } from './layout';
import type { FileTarget } from './layout';

/** The subset of a screen record that decides where it lives. */
interface ScreenHome {
  /** Absent for a screen whose id has not been allocated yet. */
  id?: ScreenId;
  kind: ScreenKind;
  world: ScreenWorld;
  areaId: AreaId;
  interiorKind?: InteriorKind;
  gameId: ScreenGameId;
  position?: { floor?: number };
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

/** The world a dungeon sits in, read off the first room it lists. */
const worldOfDungeon = (dungeon: Pick<DungeonRecord, 'roomScreenIds'>): string =>
  worldFolder(dungeon.roomScreenIds.length ? getScreen(dungeon.roomScreenIds[0]).world : 'light');

/** The floor file a dungeon room belongs to, inside its dungeon's folder. */
const dungeonFloorFile = (dungeon: DungeonRecord, floor: number | undefined): FileTarget => {
  const stem = dungeon.fileStem;
  const halves = SPLIT_BY_HALF[stem];
  if (halves) {
    return {
      relativePath: null,
      unresolved: `${stem} files one floor in two halves (${halves.join(', ')}); name the file yourself`,
    };
  }
  const floors = DUNGEON_FLOORS[stem];
  if (!floors) return { relativePath: null, unresolved: `no floor layout is declared for ${stem}` };
  if (floor === undefined) return { relativePath: null, unresolved: 'the room names no floor' };
  const group = floors.find(([, set]) => set.includes(floor));
  if (!group) return { relativePath: null, unresolved: `${stem} files no floor ${floor}` };
  return { relativePath: `${stem}/${group[0]}` };
};

/** The folder a screen's records live in, below `<collection>/<world>-world/`. */
const screenBucket = (screen: ScreenHome): FileTarget => {
  if (screen.kind === 'dungeon') {
    const dungeon = dungeonForScreen(screen);
    if (!dungeon) return { relativePath: null, unresolved: 'no dungeon record covers this palace index' };
    return dungeonFloorFile(dungeon, screen.position?.floor);
  }
  // A screen whose areaId names no real area, and the handful of interiors no area owns,
  // belong with the other placeless records.
  const folder = AREA_FOLDERS[screen.areaId];
  if (!folder || screen.interiorKind === 'special') return { relativePath: PLACELESS };
  return { relativePath: `${screen.kind === 'overworld' ? 'overworld' : 'interiors'}/${folder}` };
};

const inRoot = (root: 'screens' | 'connections', screen: ScreenHome): FileTarget => {
  const bucket = screenBucket(screen);
  if (bucket.relativePath === null) return bucket;
  return { relativePath: `${root}/${worldFolder(screen.world)}/${bucket.relativePath}.ts` };
};

const screenRecordFile = (screen: ScreenHome): FileTarget => inRoot('screens', screen);

const connectionRecordFile = (screenId: ScreenId): FileTarget => {
  const screen = findOne('screen', s => s.id === screenId);
  if (!screen) return { relativePath: null, unresolved: `unknown screen ${screenId}` };
  return inRoot('connections', screen);
};

export { connectionRecordFile, dungeonForPalaceIndex, dungeonForScreen, screenRecordFile, worldOfDungeon };
export type { ScreenHome };
