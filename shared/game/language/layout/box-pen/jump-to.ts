/* @layer shared-game @kind logic */
import type { BoxRow, Pen } from './box-pen.type';
import { blankRow } from './blank-row';
import { closeRun } from './close-run';
import { emptyRun } from './empty-run';
import { visibleRun } from './visible-run';

const reopenRow = (buf: BoxRow): BoxRow => {
  if (!buf.drawn && buf.stale === null) return buf;
  return { ...emptyRun(), drawn: false, stale: visibleRun(buf) };
};

const jumpTo = (pen: Pen, row: number): void => {
  closeRun(pen);
  const buf = pen.slots[row - 1];
  pen.slots[row - 1] = pen.blankOnJump ? blankRow() : reopenRow(buf);
  pen.row = row;
  pen.edits += 1;
};

export { jumpTo };
