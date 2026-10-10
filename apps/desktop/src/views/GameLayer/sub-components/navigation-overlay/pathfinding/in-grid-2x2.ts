/* @layer renderer-components @kind logic */
import { GRID_SIZE } from '@rotp/navigation';

const inGrid2x2 = (row: number, col: number): boolean =>
  row >= 0 && row + 1 < GRID_SIZE && col >= 0 && col + 1 < GRID_SIZE;

export { inGrid2x2 };
