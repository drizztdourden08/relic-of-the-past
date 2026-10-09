/* @layer shared-game @kind logic */
import type { TilePassability, LedgeTraversal } from '../../types';
import { GRID_SIZE } from '../../types';
import { SOUTH_CLIFF_BORDER_ATTRS } from './cliff-preprocessing.constants';

const processSouthCliffs = (grid: TilePassability[][], rawAttr: number[][], ledges: LedgeTraversal[]): void => {
  const isSouthCliffTile = (r: number, c: number): boolean => {
    const t = grid[r][c];
    return t.type === 'blocked' || (t.type === 'ledge' && t.dir === 's');
  };

  for (let row = 0; row < GRID_SIZE - 1; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const isCliffBorder = SOUTH_CLIFF_BORDER_ATTRS.has(rawAttr[row][col]) && row > 0
        && (grid[row - 1][col].type === 'free' || grid[row - 1][col].type === 'ledge');
      if (!isCliffBorder) continue;
      if (!isSouthCliffTile(row + 1, col)) continue;

      if (grid[row][col].type === 'blocked') grid[row][col] = { type: 'free' };

      let r = row + 1;
      while (r < GRID_SIZE && isSouthCliffTile(r, col)) {
        if (grid[r][col].type === 'blocked') grid[r][col] = { type: 'ledge', dir: 's' };
        r++;
      }
      if (r > row + 1 && r < GRID_SIZE) {
        ledges.push({ startRow: row, startCol: col, endRow: r, endCol: col });
      }
    }
  }
};

export { processSouthCliffs };
