/* @layer shared-game @kind logic */
import { GRID_SIZE } from '../../types/grid.constants';

const filledGrid = <T>(fill: T): T[][] =>
  Array.from({ length: GRID_SIZE }, () => new Array<T>(GRID_SIZE).fill(fill));

export { filledGrid };
