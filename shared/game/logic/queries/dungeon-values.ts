/* @layer shared-game @kind logic */
/**
 * Palace-index DISPLAY labels — the only surviving copy of this table.
 *
 * This is the raw value from RAM $040C (cur_palace_index_x2). It identifies
 * which dungeon "context" the game considers the player to be in. Cave/house
 * rooms report 0xFF. The value is DOUBLED — the game's own dungeon tables are
 * indexed by `cur_palace_index_x2 >> 1`.
 *
 * These labels are for rendering only. A palace index resolves to an entity via
 * `dungeonForPalaceIndex` (data/record-file-targets.ts); nothing keys a lookup,
 * a requirement or a destination path off the strings below.
 */

const PALACE_INDEX_NAMES: Record<number, string> = {
  0x00: 'Hyrule Castle (Sewers)',
  0x02: 'Hyrule Castle (Castle)',
  0x04: 'Eastern Palace',
  0x06: 'Desert Palace',
  0x08: 'Castle Tower',
  0x0A: 'Swamp Palace',
  0x0C: 'Palace of Darkness',
  0x0E: 'Misery Mire',
  0x10: 'Skull Woods',
  0x12: 'Ice Palace',
  0x14: 'Tower of Hera',
  0x16: "Thieves' Town",
  0x18: 'Turtle Rock',
  0x1A: "Ganon's Tower",
  0xFF: 'Cave / House',
};

const getPalaceName = (palaceIndex: number): string =>
  PALACE_INDEX_NAMES[palaceIndex] ?? `Unknown (0x${palaceIndex.toString(16).toUpperCase()})`;

const isDungeonPalace = (palaceIndex: number): boolean =>
  palaceIndex !== 0xFF && palaceIndex <= 0x1A;

export { PALACE_INDEX_NAMES, getPalaceName, isDungeonPalace };
