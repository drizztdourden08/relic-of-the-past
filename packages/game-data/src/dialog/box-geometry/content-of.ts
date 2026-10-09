/* @layer shared-game @kind logic */
import type { DialogCell } from '../dialog-frame.types';
import type { BoxContent, LayoutOptions } from './box-geometry.type';
import { TEXT_ROWS } from './box-geometry.constants';
import { rowsExtent } from './rows-extent';
import { rowsInUse } from './rows-in-use';

const contentOf = (rows: DialogCell[][], options: LayoutOptions): BoxContent => {
  const { mode, messageWidth, messageRows } = options;
  const measured = messageWidth > 0 && messageRows > 0;
  if (mode === 'full') return { width: measured ? messageWidth : rowsExtent(rows), rows: measured ? messageRows : TEXT_ROWS };
  if (mode === 'message' && measured) return { width: messageWidth, rows: messageRows };
  return { width: rowsExtent(rows), rows: rowsInUse(rows) };
};

export { contentOf };
