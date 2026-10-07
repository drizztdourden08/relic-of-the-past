/* @layer shared-game @kind logic */
/**
 * The code a line gets when its position is being derived, asked of the one
 * sanctioned synthesiser.
 *
 * `advanceForNewLine` is the only place in the line model that invents a code,
 * and it answers the per-box question: row 1, then 2, then 3, and a scroll once
 * the bottom row is taken, restarting at row 1 after a wait. Continuous mode
 * wants that same walk WITHOUT the restart, because the box is never cleared.
 * The pen is still on the bottom row when the next box opens, so a scroll is
 * what actually moves the text up and a return to row 1 would overpaint a row
 * that is still standing. That one difference is expressed by handing the
 * synthesiser a previous line with its wait hidden, so there is still exactly
 * one place where a code is invented.
 */
import { ROWS_PER_BOX } from '../layout/types';
import { advanceForNewLine } from '../lines/advance-for-new-line';
import type { DialogueLineView, LineAdvance } from '../lines/types';
import type { StructurePolicy } from './modes';

/** The code for the line after `previous`, under this mode's numbering. */
const nextAdvance = (
  previous: DialogueLineView | null,
  policy: StructurePolicy,
): LineAdvance => {
  if (previous === null || policy.restartsAtBlock) return advanceForNewLine(previous);
  return advanceForNewLine({ ...previous, endsBox: false });
};

/**
 * Where the pen lands once an advance has been applied, by the same rule
 * `splitLines` numbers its lines by: a marker names its row, a scroll parks on
 * the bottom row, and no code at all means the box's first row.
 */
const rowOfAdvance = (advance: LineAdvance): number => {
  if (advance === null) return 1;
  return advance.kind === 'row' ? advance.row : ROWS_PER_BOX;
};

export { nextAdvance, rowOfAdvance };
