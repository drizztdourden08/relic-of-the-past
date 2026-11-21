/* @layer shared-game @kind logic */
import { COLUMNS, ROWS } from '../../extra-glyph-tiles.constants';

const paintArt = (mask: Uint8Array, rows: readonly string[], x: number, y: number): void => {
  rows.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (row[dx] !== '#' || px < 0 || px >= COLUMNS || py < 0 || py >= ROWS) continue;
      mask[py * COLUMNS + px] = 1;
    }
  });
};

export { paintArt };
