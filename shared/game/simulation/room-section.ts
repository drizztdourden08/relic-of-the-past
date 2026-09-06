/* @layer shared-game @kind types */
/**
 * Scroll-section geometry for a multi-screen indoor room. A room can carry
 * more than one scrolling section, each with its own shutters and sprites.
 * Only the section the player currently stands in has its sprites loaded by
 * the game.
 */

/** Which axes of the current room are actively split into separate scrolling
 *  sections (a destroyed blastwall merges two quadrants back into one), plus
 *  which section the player currently stands in. */
interface RoomSectionSplit {
  /** Column 32 divides the room into a west and an east section. */
  splitX: boolean;
  /** Row 32 divides the room into a north and a south section. */
  splitY: boolean;
  /** Player's section along the X split (0 = west, 1 = east). */
  playerSectionX: 0 | 1;
  /** Player's section along the Y split (0 = north, 1 = south). */
  playerSectionY: 0 | 1;
}

export type { RoomSectionSplit };
