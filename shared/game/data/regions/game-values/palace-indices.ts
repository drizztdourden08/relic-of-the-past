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

export const PALACE_INDEX_NAMES: Record<number, string> = {
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
export const DUNGEON_PALACE_VALUES: Record<string, number[]> = {
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

/** Get display name for a runtime palace index value */
export function getPalaceName(palaceIndex: number): string {
  return PALACE_INDEX_NAMES[palaceIndex] ?? `Unknown (0x${palaceIndex.toString(16).toUpperCase()})`;
}

/** Check if a palace index belongs to a named dungeon */
export function isDungeonPalace(palaceIndex: number): boolean {
  return palaceIndex !== 0xFF && palaceIndex <= 0x1A;
}
