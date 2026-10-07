/* @layer shared-game @kind types */
/**
 * The level between a line and a whole entry: the BLOCK. One run of lines the
 * player reads before pressing a button.
 *
 * A block is the stretch between two wait-for-button codes, plus the head and
 * the tail of the stream. The wait is the only code that stops and asks for a
 * press, so it is the only place a block can end. A scroll is NOT a boundary: it
 * animates inside the same box, shifting the visible lines up, and the text
 * either side of it belongs to one block.
 *
 * What makes blocks worth modelling separately from lines is that a block does
 * not start on a clean box. The pixel buffer is cleared exactly ONCE per
 * message, and no code path clears it again, not by a wait and not by a row
 * marker, so a block opens on top of whatever rows are still standing from the blocks
 * before it. Those rows are what `inherited` carries, and reading a block
 * without them is reading half the screen.
 *
 * That is also why authored data almost never returns to row 1: a row marker
 * blanks nothing, so jumping back up leaves the rows below it on screen. The
 * upstream corpus counts bear it out, with scrolls and row-2/row-3 markers in
 * the hundreds each and a return to row 1 in the low tens.
 */
import type { RowFit } from '../layout/types';
import type { DialogueLineView } from '../lines/types';

/** One run of lines the player reads before the next button press. */
type Block = {
  /** 0-based index across the entry; matches the `box` its lines carry. */
  index: number;
  lines: DialogueLineView[];
  /** How the block ends. */
  ends: 'wait' | 'message-end';
  /**
   * Rows still on screen from earlier blocks, because nothing is ever cleared.
   * Empty for the first block. `splitBlocks` leaves this empty for every block
   * because measuring needs a language, so `resolveInherited` fills it in.
   */
  inherited: RowFit[];
};

/** A whole entry as the blocks a player pages through. */
type BlockDoc = { blocks: Block[] };

export type { Block, BlockDoc };
