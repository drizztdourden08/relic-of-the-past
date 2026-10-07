/* @layer shared-game @kind logic */
/**
 * Palace-index display labels.
 *
 * The index is the raw value from RAM $040C (cur_palace_index_x2). It identifies
 * which dungeon "context" the game considers the player to be in. Cave/house
 * rooms report 0xFF. The value is DOUBLED, because the game's own dungeon tables are
 * indexed by `cur_palace_index_x2 >> 1`.
 *
 * The labels themselves are transcribed game wording, so they live in the record
 * dataset and are synced in from the private companion repo. Without it the table
 * is empty and `getPalaceName` falls back to the raw index, which is exactly the
 * behaviour it already had for an unrecognised value. The two predicates below
 * are structural and work either way.
 */

const modules = import.meta.glob<{ PALACE_INDEX_NAMES?: Record<number, string> }>(
  '../../data/records/palace-names.ts',
  { eager: true },
);

const PALACE_INDEX_NAMES: Record<number, string> =
  Object.values(modules)[0]?.PALACE_INDEX_NAMES ?? {};

const getPalaceName = (palaceIndex: number): string =>
  PALACE_INDEX_NAMES[palaceIndex] ?? `Unknown (0x${palaceIndex.toString(16).toUpperCase()})`;

const isDungeonPalace = (palaceIndex: number): boolean =>
  palaceIndex !== 0xFF && palaceIndex <= 0x1A;

export { PALACE_INDEX_NAMES, getPalaceName, isDungeonPalace };
