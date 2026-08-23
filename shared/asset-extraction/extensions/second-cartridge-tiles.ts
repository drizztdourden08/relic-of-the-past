/* @layer shared-asset-extraction @kind data */
/**
 * Two extra map16 cells for the extra dungeon's opening.
 *
 * A map16 cell carries its four 8x8 tiles AND, in bit 13 of each, whether they draw in front
 * of the player. The wall the opening is cut into has no foreground-priority variant of its
 * own course, so walking "into" it had been faked by borrowing the cells from the base game's
 * own opening — a different course of brick, which is why the two rows above the doorway came
 * out in the wrong colour.
 *
 * These append that missing variant instead: the exact same tile numbers, palette and flips as
 * the cells already in the wall, with only the priority bit added. The wall is therefore
 * pixel-identical whether or not the option is on; the sole difference is that the player now
 * passes behind it.
 *
 * The ids are positional — the base table's length is asserted so that the two appended cells
 * land at a known index, which is the constant the C side draws.
 */

/** Bit 13 of a map8 word: draw this tile in front of the player. */
const PRIORITY_BIT = 0x2000;

/** Words per map16 cell — a 2x2 block of 8x8 tiles. */
const WORDS_PER_CELL = 4;

/** The base game ships 3752 map16 cells; the two appended ones follow it. */
const BASE_MAP16_COUNT = 3752;

/** The cells of the wall course the opening is cut into, in the order they are appended. */
const WALL_CELLS = [0x0a14, 0x0a0c];

/**
 * Append one foreground-priority twin per entry in WALL_CELLS.
 *
 * Appended unconditionally, like the entrance records: the base blob stays the same shape
 * whether or not a supplement is compiled, and nothing reaches these ids without one.
 */
const appendWallPriorityTwins = (words: number[]): void => {
  const expected = BASE_MAP16_COUNT * WORDS_PER_CELL;
  if (words.length !== expected) {
    throw new Error(`Expected ${expected} map16 words, found ${words.length}`);
  }
  for (const cell of WALL_CELLS) {
    const at = cell * WORDS_PER_CELL;
    for (let i = 0; i < WORDS_PER_CELL; i++) words.push(words[at + i] | PRIORITY_BIT);
  }
};

export { BASE_MAP16_COUNT, WALL_CELLS, appendWallPriorityTwins };
