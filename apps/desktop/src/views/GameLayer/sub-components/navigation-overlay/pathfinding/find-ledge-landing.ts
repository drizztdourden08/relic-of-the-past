/* @layer renderer-components @kind logic */
import { GRID_SIZE } from '@rotp/navigation';
import type { ReachState } from '@rotp/game-core';
import type { GridPos } from '../navigation-overlay.type';
import { bodyCells } from './body-cells';
import { inGrid2x2 } from './in-grid-2x2';
import { isLedgeState } from './is-ledge-state';
import { isReachable2x2 } from './is-reachable-2x2';
import type { LayerGrids, StepDir } from './pathfinding.type';

const bodyStillOnLedge = (row: number, col: number, layer0Grid: ReachState[][]): boolean =>
  bodyCells(layer0Grid, row, col).some((cell) => cell !== undefined && isLedgeState(cell));

const findLedgeLanding = (start: GridPos, dir: StepDir, grids: LayerGrids): GridPos | null => {
  const [dr, dc] = dir;
  const [layer0Grid, layer1Grid] = grids;
  for (let step = 0; step < GRID_SIZE; step++) {
    const lr = start.row + step * dr;
    const lc = start.col + step * dc;
    if (!inGrid2x2(lr, lc)) break;
    if (bodyStillOnLedge(lr, lc, layer0Grid)) continue;
    if (isReachable2x2(lr, lc, layer1Grid)) return { row: lr, col: lc };
  }
  return null;
};

export { findLedgeLanding };
