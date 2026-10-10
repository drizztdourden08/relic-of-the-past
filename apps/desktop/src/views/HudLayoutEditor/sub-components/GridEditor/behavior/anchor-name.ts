/* @layer renderer-components @kind logic */
import { ANCHORS } from './grid-status.constants';

const anchorName = (columns: number, rows: number, column: number, row: number): string =>
  (columns === 3 && rows === 3 ? ` (${ANCHORS[(row - 1) * 3 + (column - 1)]})` : '');

export { anchorName };
