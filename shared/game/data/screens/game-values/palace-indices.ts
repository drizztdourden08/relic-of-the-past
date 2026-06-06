/* @layer shared-game @kind data */
/**
 * Palace Indices — canonical map of cur_palace_index_x2 runtime values.
 *
 * This is the raw value from RAM $040C (cur_palace_index_x2).
 * It identifies which dungeon "context" the game considers the player to be in.
 * Cave/house rooms report 0xFF.
 *
 * NOTE: The value is set by the entrance data tables, NOT by the room itself.
 * Different entrances to the same dungeon may set different palace values
 * (e.g. HC main entrance sets 2, sewers entrance sets 0).
 */

const PALACE_INDEX_NAMES: Record<number, string> = {
  0x00: 'Hyrule Castle (Sewers)',
  0x02: 'Hyrule Castle (Castle)',
  0x04: 'Eastern Palace',
  0x06: 'Desert Palace',
  0x08: 'Tower of Hera',
  0x0A: 'Palace of Darkness',
  0x0C: 'Swamp Palace',
  0x0E: 'Skull Woods',
  0x10: "Thieves' Town",
  0x12: 'Ice Palace',
  0x14: 'Misery Mire',
  0x16: 'Turtle Rock',
  0x18: "Ganon's Tower",
  0x1A: 'Castle Tower',
  0xFF: 'Cave / House',
};

/** Reverse lookup: dungeon name → possible palace index values */
const DUNGEON_PALACE_VALUES: Record<string, number[]> = {
  'Hyrule Castle': [0x00, 0x02],
  'Eastern Palace': [0x04],
  'Desert Palace': [0x06],
  'Tower of Hera': [0x08],
  'Palace of Darkness': [0x0A],
  'Swamp Palace': [0x0C],
  'Skull Woods': [0x0E],
  "Thieves' Town": [0x10],
  'Ice Palace': [0x12],
  'Misery Mire': [0x14],
  'Turtle Rock': [0x16],
  "Ganon's Tower": [0x18],
  'Castle Tower': [0x1A],
};

const getPalaceName = (palaceIndex: number): string => {
  return PALACE_INDEX_NAMES[palaceIndex] ?? `Unknown (0x${palaceIndex.toString(16).toUpperCase()})`;
};

const isDungeonPalace = (palaceIndex: number): boolean => {
  return palaceIndex !== 0xFF && palaceIndex <= 0x1A;
};

/** Reverse lookup: palaceIndex → logical dungeon name (for game mechanics: keys, map, compass) */
const PALACE_TO_DUNGEON: Record<number, string> = Object.fromEntries(
  Object.entries(DUNGEON_PALACE_VALUES).flatMap(([name, indices]) =>
    indices.map(idx => [idx, name])
  )
);

const getDungeonName = (palaceIndex: number): string => {
  return PALACE_TO_DUNGEON[palaceIndex] ?? `Unknown Dungeon (0x${palaceIndex.toString(16).toUpperCase()})`;
};

/**
 * Canonical dungeon metadata — maps dungeon name to its fixed area, location, and world.
 * Used by the wizard to auto-derive locked fields when dungeon is selected.
 */
interface DungeonMeta {
  locationId: string;
  areaId: string;
  world: 'light' | 'dark';
}

const DUNGEON_META: Record<string, DungeonMeta> = {
  'Hyrule Castle': { locationId: 'hyrule-castle', areaId: 'hyrule-castle', world: 'light' },
  'Eastern Palace': { locationId: 'eastern-palace', areaId: 'east-hyrule', world: 'light' },
  'Desert Palace': { locationId: 'desert-palace', areaId: 'desert', world: 'light' },
  'Tower of Hera': { locationId: 'tower-of-hera', areaId: 'death-mountain', world: 'light' },
  'Castle Tower': { locationId: 'castle-tower', areaId: 'hyrule-castle', world: 'light' },
  'Palace of Darkness': { locationId: 'palace-of-darkness', areaId: 'dark-east', world: 'dark' },
  'Swamp Palace': { locationId: 'swamp-palace', areaId: 'dark-south', world: 'dark' },
  'Skull Woods': { locationId: 'skull-woods', areaId: 'skull-woods-area', world: 'dark' },
  "Thieves' Town": { locationId: 'thieves-town', areaId: 'village-of-outcasts', world: 'dark' },
  'Ice Palace': { locationId: 'ice-palace', areaId: 'dark-lake-hylia', world: 'dark' },
  'Misery Mire': { locationId: 'misery-mire', areaId: 'dark-mire', world: 'dark' },
  'Turtle Rock': { locationId: 'turtle-rock', areaId: 'dark-death-mountain', world: 'dark' },
  "Ganon's Tower": { locationId: 'ganons-tower', areaId: 'dark-death-mountain', world: 'dark' },
};

export { PALACE_INDEX_NAMES, DUNGEON_PALACE_VALUES, getPalaceName, isDungeonPalace, getDungeonName, DUNGEON_META };
export type { DungeonMeta };
