/* @layer shared-game @kind logic */
import { COLUMNS, ROWS } from '../../extra-glyph-tiles.constants';
import { extraGlyphTiles } from '../../extra-glyph-tiles';

const isBody = (mask: Uint8Array, x: number, y: number): boolean =>
  x >= 0 && x < COLUMNS && y >= 0 && y < ROWS && mask[y * COLUMNS + x] === 1;

const touchesBody = (mask: Uint8Array, x: number, y: number): boolean => {
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (isBody(mask, x + dx, y + dy)) return true;
  return false;
};

const pixelOf = (mask: Uint8Array, x: number, y: number): string => {
  if (isBody(mask, x, y)) return '#';
  return touchesBody(mask, x, y) ? '.' : ' ';
};

const maskTiles = (mask: Uint8Array, width: number): Uint8Array => {
  const rows: string[] = [];
  for (let y = 0; y < ROWS; y++) {
    let row = '';
    for (let x = 0; x < COLUMNS; x++) row += pixelOf(mask, x, y);
    rows.push(row);
  }
  return extraGlyphTiles({ char: '', width, rows });
};

export { maskTiles };
