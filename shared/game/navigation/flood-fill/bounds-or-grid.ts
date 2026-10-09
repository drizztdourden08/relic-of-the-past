/* @layer shared-game @kind logic */
import type { QuadrantBounds } from '../strategies/layer-strategy';
import { GRID_SIZE } from '../types/grid.constants';

const boundsOrGrid = (bounds?: QuadrantBounds): QuadrantBounds =>
  bounds ?? { minRow: 0, maxRow: GRID_SIZE - 1, minCol: 0, maxCol: GRID_SIZE - 1 };

export { boundsOrGrid };
