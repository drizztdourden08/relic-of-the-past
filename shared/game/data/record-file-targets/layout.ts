/* @layer shared-game @kind logic */
/**
 * The tree convention every record file follows, as the tables the resolvers read.
 *
 * One convention, for screens, connections and checks alike:
 * `<collection>/<world>-world/<overworld|interiors|dungeon>/<area-or-floor>.ts`.
 * A record's world, its area or dungeon, and a dungeon room's floor pick the path,
 * so the three files for one place sit at the same relative path in each collection.
 * Every table here is keyed by a frozen id or a dungeon's own file stem, never by a
 * display name, so renaming a record can never move its file.
 */
import type { ScreenWorld, World } from '../types';

/**
 * The folder each area's records live in, keyed by frozen id. This is the one table the
 * convention still needs: an area record carries no folder name of its own, and slugifying
 * its display name would let a rename move a file.
 */
const AREA_FOLDERS: Readonly<Record<string, string>> = {
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
  'area-015': 'skull-woods',
  'area-016': 'south-hyrule',
  'area-017': 'village-of-outcasts',
};

/**
 * The floors each dungeon files together, in file order, keyed by the dungeon's own stem.
 * A tower whose every floor is one room keeps them in one `floors.ts`; a dungeon whose
 * floors are rooms gets a file per floor, or per pair where the game itself pairs them.
 */
const DUNGEON_FLOORS: Readonly<Record<string, readonly (readonly [string, readonly number[]])[]>> = {
  'hyrule-castle': [['floor-0', [0]], ['floor-b1', [-1]], ['floor-b2', [-2]]],
  'castle-tower': [['floors', [0, 1, 2, 3, 4, 5, 6]]],
  'eastern-palace': [['floor-0', [0]], ['floor-1', [1]]],
  'desert-palace': [['floor-0', [0]], ['floor-b1', [-1]]],
  'tower-of-hera': [['floors', [-1, 0, 1, 2, 3, 4, 5]]],
  'palace-of-darkness': [['floor-0', [0]], ['floor-b1', [-1]], ['floor-b2', [-2]]],
  'swamp-palace': [['floor-0', [0]], ['floor-b1', [-1]]],
  'thieves-town': [['floor-0', [0]], ['floor-b1', [-1]], ['floor-b2', [-2]]],
  'ice-palace': [['floor-0-b1', [0, -1]], ['floor-b2-b3', [-2, -3]], ['floor-b4-b7', [-4, -5, -6, -7]]],
  'misery-mire': [['floor-0', [0]], ['floor-b1', [-1]], ['floor-b2', [-2]]],
  'turtle-rock': [['floor-0', [0]], ['floor-b1', [-1]], ['floor-b2', [-2]]],
  'ganons-tower': [['floor-b2-b1', [-2, -1]], ['floor-0', [0]], ['floor-1-2', [1, 2]], ['floor-3-6', [3, 4, 5, 6]]],
};

/**
 * The one dungeon whose single floor is filed in two halves, by which way in a room is
 * reached. Nothing on a room says which half it is, so a new room there is refused
 * instead of guessed.
 */
const SPLIT_BY_HALF: Readonly<Record<string, readonly string[]>> = {
  'skull-woods': ['front', 'back'],
};

/** The file a screen with no area of its own, and its records, are kept in. */
const PLACELESS = 'interiors/special';

interface FileTarget {
  /** Path relative to the record tree, or null when no home can be derived. */
  relativePath: string | null;
  /** Why the path could not be derived. */
  unresolved?: string;
}

const worldFolder = (world: World | ScreenWorld): string => `${world === 'dark' ? 'dark' : 'light'}-world`;

export { AREA_FOLDERS, DUNGEON_FLOORS, PLACELESS, SPLIT_BY_HALF, worldFolder };
export type { FileTarget };
