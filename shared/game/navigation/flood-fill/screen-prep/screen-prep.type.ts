/* @layer shared-game @kind types */
import type { CollisionGrid, GridPos, LedgeTraversal } from '../../types';

interface PreparedScreen {
  grid: CollisionGrid;
  ledges: LedgeTraversal[];
  dynamicBlockerCells: GridPos[];
}

export type { PreparedScreen };
