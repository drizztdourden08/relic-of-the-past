/* @layer shared-game @kind logic */
import { itemAt } from '@rotp/randomizer';

const cellAt = <T>(grid: ArrayLike<ArrayLike<T>>, row: number, col: number): T => itemAt(itemAt(grid, row), col);

export { cellAt };
