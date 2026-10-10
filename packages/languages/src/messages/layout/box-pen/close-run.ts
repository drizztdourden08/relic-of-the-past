/* @layer shared-game @kind logic */
import type { Pen } from './box-pen.type';
import { asRowFit } from './as-row-fit';
import { slotAt } from './slot-at';

const closeRun = (pen: Pen): void => {
  const buf = slotAt(pen, pen.row);
  if (buf.drawn) pen.runs.push(asRowFit(pen.row, buf));
};

export { closeRun };
