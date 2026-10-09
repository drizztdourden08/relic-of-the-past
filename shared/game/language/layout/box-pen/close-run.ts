/* @layer shared-game @kind logic */
import type { Pen } from './box-pen.type';
import { asRowFit } from './as-row-fit';

const closeRun = (pen: Pen): void => {
  const buf = pen.slots[pen.row - 1];
  if (buf.drawn) pen.runs.push(asRowFit(pen.row, buf));
};

export { closeRun };
