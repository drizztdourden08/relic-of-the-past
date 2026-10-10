/* @layer renderer-lib @kind logic */
import { itemAt } from './item-at';

const cellAt = <T>(grid: ArrayLike<ArrayLike<T>>, row: number, col: number): T => itemAt(itemAt(grid, row), col);

export { cellAt };
