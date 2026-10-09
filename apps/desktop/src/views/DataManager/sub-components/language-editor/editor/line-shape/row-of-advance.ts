/* @layer renderer-components @kind logic */
import { ROWS_PER_BOX } from '@rotp/languages';
import type { LineAdvance } from '@rotp/languages';

const rowOfAdvance = (advance: LineAdvance): number => {
  if (advance === null) return 1;
  return advance.kind === 'row' ? advance.row : ROWS_PER_BOX;
};

export { rowOfAdvance };
