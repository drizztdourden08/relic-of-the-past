/* @layer renderer-components @kind logic */
import { GRID_SIZE } from '@shared/game/navigation/types';
import type { ReachState } from '@shared/game/navigation/types';
import type { GridPos } from '../navigation-overlay.type';
import { isReachable2x2 } from './is-reachable-2x2';
import { LEDGE_STATE_MAX, LEDGE_STATE_MIN } from './pathfinding.constants';

const bodyStillOnLedge = (lr: number, lc: number, layer0Grid: ReachState[][]): boolean => {
  const positions: [number, number][] = [[lr, lc], [lr, lc + 1], [lr + 1, lc], [lr + 1, lc + 1]];
  return positions.some(([r, c]) => {
    const s = layer0Grid[r][c];
    return s >= LEDGE_STATE_MIN && s <= LEDGE_STATE_MAX;
  });
};

const findLedgeLanding = (startRow: number, startCol: number, dr: number, dc: number, layer0Grid: ReachState[][], layer1Grid: ReachState[][]): GridPos | null => {
  for (let step = 0; step < GRID_SIZE; step++) {
    const lr = startRow + step * dr;
    const lc = startCol + step * dc;
    if (lr < 0 || lr + 1 >= GRID_SIZE || lc < 0 || lc + 1 >= GRID_SIZE) break;
    if (bodyStillOnLedge(lr, lc, layer0Grid)) continue;
    if (isReachable2x2(lr, lc, layer1Grid)) {
      return { row: lr, col: lc };
    }
  }
  return null;
};

export { findLedgeLanding };
