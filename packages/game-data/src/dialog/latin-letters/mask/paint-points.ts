/* @layer shared-game @kind logic */
import { COLUMNS, ROWS } from '../../extra-glyph-tiles.constants';

const paintPoints = (mask: Uint8Array, points: readonly (readonly [number, number])[]): void => {
  for (const [x, y] of points) {
    if (x < 0 || x >= COLUMNS || y < 0 || y >= ROWS) continue;
    mask[y * COLUMNS + x] = 1;
  }
};

export { paintPoints };
