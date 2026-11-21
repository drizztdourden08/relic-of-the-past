/* @layer shared-game @kind logic */
import { COLUMNS, ROWS } from '../../extra-glyph-tiles.constants';
import { columnExtent } from './column-extent';
import type { MaskBox } from './mask.type';
import { rowExtent } from './row-extent';

const maskBox = (mask: Uint8Array): MaskBox | undefined => {
  const rows = columnExtent(mask, 0, COLUMNS - 1);
  const columns = rowExtent(mask, 0, ROWS - 1);
  if (rows === undefined || columns === undefined) return undefined;
  return { top: rows.from, bottom: rows.to, left: columns.from, right: columns.to };
};

export { maskBox };
