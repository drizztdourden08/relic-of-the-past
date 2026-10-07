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
 * dataset and are read from it. `getPalaceName` falls back to the raw index for a
 * value the record has no label for, and the two predicates below are structural.
 */

import { PALACE_INDEX_NAMES } from '../../data';

/** The value RAM $040C holds for a room in no palace, such as a cave or a house. */
const PALACE_NONE = 0xFF;

const getPalaceName = (palaceIndex: number): string =>
  PALACE_INDEX_NAMES[palaceIndex] ?? `Unknown (0x${palaceIndex.toString(16).toUpperCase()})`;

const isDungeonPalace = (palaceIndex: number): boolean =>
  palaceIndex !== PALACE_NONE && palaceIndex <= 0x1A;

export { PALACE_INDEX_NAMES, PALACE_NONE, getPalaceName, isDungeonPalace };
