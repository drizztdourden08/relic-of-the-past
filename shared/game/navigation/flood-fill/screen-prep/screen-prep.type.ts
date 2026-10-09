/* @layer shared-game @kind types */
import type { CollisionGrid, GridPos, LedgeTraversal } from '@rotp/game-core';

interface PreparedScreen {
  grid: CollisionGrid;
  ledges: LedgeTraversal[];
  dynamicBlockerCells: GridPos[];
}

export type { PreparedScreen };
