/* @layer shared-game @kind logic */
import { ROWS_PER_BOX } from '../types';
import type { Pen } from './box-pen.type';
import { blankRow } from './blank-row';
import { closeRun } from './close-run';

const scroll = (pen: Pen): void => {
  closeRun(pen);
  pen.slots = [...pen.slots.slice(1), blankRow()];
  pen.row = ROWS_PER_BOX;
  pen.edits += 1;
};

export { scroll };
