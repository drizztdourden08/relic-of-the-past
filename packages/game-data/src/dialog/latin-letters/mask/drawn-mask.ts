/* @layer shared-game @kind logic */
import { COLUMNS, ROWS } from '../../extra-glyph-tiles.constants';
import type { DrawnLetter } from '../latin-letters.type';

const drawnMask = (letter: DrawnLetter): Uint8Array => {
  const mask = new Uint8Array(ROWS * COLUMNS);
  letter.rows.forEach((row, index) => {
    const y = letter.top + index;
    if (y < 0 || y >= ROWS) return;
    for (let x = 0; x < COLUMNS; x++) if (row[x] === '#') mask[y * COLUMNS + x] = 1;
  });
  return mask;
};

export { drawnMask };
