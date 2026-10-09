/* @layer shared-game @kind logic */
import type { RowFit } from '../types';
import { ROW_WIDTH_PX } from '../types';
import type { Run } from './box-pen.type';

const asRowFit = (row: number, run: Run): RowFit => ({
  row,
  glyphs: [...run.glyphs],
  widthPx: run.widthPx,
  overflow: run.widthPx > ROW_WIDTH_PX,
});

export { asRowFit };
