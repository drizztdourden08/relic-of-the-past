/* @layer shared-game @kind logic */
import type { RowFit } from '../types';
import type { Pen } from './box-pen.type';
import { asRowFit } from './as-row-fit';
import { visibleRun } from './visible-run';

const visibleRows = (pen: Pen): RowFit[] => pen.slots.flatMap(
  (buf, at) => (buf.drawn || buf.stale !== null ? [asRowFit(at + 1, visibleRun(buf))] : []),
);

export { visibleRows };
