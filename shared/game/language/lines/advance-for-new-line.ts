/* @layer shared-game @kind logic */
/**
 * The code to give a line that is being CREATED. Nothing else in this module
 * derives an advance: `splitLines` preserves what it read and `joinLines` writes
 * it back, so the only place a code is invented is the moment an author asks for
 * a new line, and the caller says when that is.
 *
 * The rule is the box filling up from the top: row 1, then row 2, then row 3,
 * and once the bottom row is taken the box has to scroll to make room. A line
 * added after a box-ending wait starts the next box, so it opens at row 1 again.
 */
import type { DialogueLineView, LineAdvance } from './types';

const kFirstRow = 1;

const advanceAfterRow = (row: number): LineAdvance => {
  if (row === 1) return { kind: 'row', row: 2 };
  if (row === 2) return { kind: 'row', row: 3 };
  return { kind: 'scroll' };
};

/** The advance for a line inserted after `previous`, or first in the entry. */
const advanceForNewLine = (previous: DialogueLineView | null): LineAdvance => {
  if (previous === null || previous.endsBox) return { kind: 'row', row: kFirstRow };
  return advanceAfterRow(previous.row);
};

export { advanceForNewLine };
