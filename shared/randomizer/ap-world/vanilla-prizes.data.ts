/* @layer shared-game @kind data */
/**
 * Each dungeon's vanilla boss prize, keyed by its prize location
 * (PRIZE_LOCATIONS in special-locations.data.ts).
 *
 * Transcribed from the game core's own tables, both indexed by palace index
 * (`cur_palace_index_x2 >> 1`), and cross-checked against each other:
 *
 * - `kBossFinishedFallingItem` (dungeon.c, the boss room tag) selects a
 *   falling-prize slot, which `kFallingItem_Type` (ancilla.c) turns into the
 *   receive id the boss hands over: 0x37 / 0x39 / 0x38 for the three pendants,
 *   0x20 for a crystal.
 * - `kDungeonCrystalPendantBit` (zelda_rtl.c) is the flag bit that grant sets.
 *   The reference project's item table (Archipelago worlds/alttp/Items.py)
 *   carries the same bit as the first element of every 'Crystal'-class item's
 *   code tuple, which is what names the bit.
 *
 * | palace | bit  | receive id | prize         |
 * | -----: | ---- | ---------- | ------------- |
 * |      2 | 0x04 | 0x37       | Green Pendant |
 * |      3 | 0x02 | 0x39       | Blue Pendant  |
 * |     10 | 0x01 | 0x38       | Red Pendant   |
 * |      6 | 0x02 | 0x20       | Crystal 1     |
 * |      5 | 0x10 | 0x20       | Crystal 2     |
 * |      8 | 0x40 | 0x20       | Crystal 3     |
 * |     11 | 0x20 | 0x20       | Crystal 4     |
 * |      9 | 0x04 | 0x20       | Crystal 5     |
 * |      7 | 0x01 | 0x20       | Crystal 6     |
 * |     12 | 0x08 | 0x20       | Crystal 7     |
 *
 * Generation places these instead of shuffling, because nothing can yet
 * substitute a boss prize: the vanilla grant writes the dungeon's own bit into
 * the pendant/crystal field and clears the room tag, so a shuffled assignment
 * would be handed out as the vanilla prize regardless. Placing the truth keeps
 * the spoiler, the pool listing, the tracker and the logic agreeing with what
 * the game actually gives.
 */

const VANILLA_PRIZES: ReadonlyMap<string, string> = new Map([
  ['Eastern Palace - Prize', 'Green Pendant'],
  ['Desert Palace - Prize', 'Blue Pendant'],
  ['Tower of Hera - Prize', 'Red Pendant'],
  ['Palace of Darkness - Prize', 'Crystal 1'],
  ['Swamp Palace - Prize', 'Crystal 2'],
  ['Skull Woods - Prize', 'Crystal 3'],
  ['Thieves\' Town - Prize', 'Crystal 4'],
  ['Ice Palace - Prize', 'Crystal 5'],
  ['Misery Mire - Prize', 'Crystal 6'],
  ['Turtle Rock - Prize', 'Crystal 7'],
]);

export { VANILLA_PRIZES };
