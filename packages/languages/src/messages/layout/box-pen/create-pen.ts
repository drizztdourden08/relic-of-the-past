/* @layer shared-game @kind logic */
import { ROWS_PER_BOX } from '../types';
import type { Pen, PenOptions } from './box-pen.type';
import { blankRow } from './blank-row';

const createPen = (opts?: PenOptions): Pen => ({
  row: 1,
  slots: Array.from({ length: ROWS_PER_BOX }, blankRow),
  runs: [],
  unmatched: [],
  edits: 0,
  blankOnJump: opts?.blankOnJump ?? true,
});

export { createPen };
