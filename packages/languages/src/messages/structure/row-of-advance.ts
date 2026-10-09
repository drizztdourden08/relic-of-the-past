/* @layer shared-game @kind logic */
import { ROWS_PER_BOX } from '../layout/types';
import type { LineAdvance } from '../lines/types';

const rowOfAdvance = (advance: LineAdvance): number => {
  if (advance === null) return 1;
  return advance.kind === 'row' ? advance.row : ROWS_PER_BOX;
};

export { rowOfAdvance };
