/* @layer renderer-components @kind logic */
/** Pure helpers for layer-aware 2×2 pathfinding (stair/ledge body checks). */
import type { ReachState } from '@shared/game/navigation/types';
import type { GridPos } from '../navigation-overlay.type';
import { isTraversalDirCompatible } from './helpers';

const hasStairInBody = (row: number, col: number, reachable: ReachState[][]): boolean => {
  return reachable[row][col] === 10 || reachable[row][col + 1] === 10 ||
         reachable[row + 1][col] === 10 || reachable[row + 1][col + 1] === 10;
};

const isReachable2x2 = (row: number, col: number, reachable: ReachState[][]): boolean => {
  if (row < 0 || row + 1 >= 64 || col < 0 || col + 1 >= 64) return false;
  return reachable[row][col] !== 0 && reachable[row][col + 1] !== 0 &&
         reachable[row + 1][col] !== 0 && reachable[row + 1][col + 1] !== 0;
};

const hasLedgeInBody = (nr: number, nc: number, grid: ReachState[][], dr: number, dc: number): boolean => {
  if (nr < 0 || nr + 1 >= 64 || nc < 0 || nc + 1 >= 64) return false;
  const positions: [number, number][] = [[nr, nc], [nr, nc + 1], [nr + 1, nc], [nr + 1, nc + 1]];
  for (const [r, c] of positions) {
    const state = grid[r][c];
    if (state >= 2 && state <= 9 && isTraversalDirCompatible(state, dr, dc)) return true;
  }
  return false;
};

const findLedgeLanding = (startRow: number, startCol: number, dr: number, dc: number, layer0Grid: ReachState[][], layer1Grid: ReachState[][]): GridPos | null => {
  for (let step = 0; step < 64; step++) {
    const lr = startRow + step * dr;
    const lc = startCol + step * dc;
    if (lr < 0 || lr + 1 >= 64 || lc < 0 || lc + 1 >= 64) break;

    // Skip tiles that are still on the ledge (states 2-9 on layer 0)
    let stillOnLedge = false;
    const positions: [number, number][] = [[lr, lc], [lr, lc + 1], [lr + 1, lc], [lr + 1, lc + 1]];
    for (const [r, c] of positions) {
      const s = layer0Grid[r][c];
      if (s >= 2 && s <= 9) { stillOnLedge = true; break; }
    }
    if (stillOnLedge) continue;

    // Landing: any non-zero state on layer 1 means BFS reached it
    if (isReachable2x2(lr, lc, layer1Grid)) {
      return { row: lr, col: lc };
    }
  }
  return null;
};

export { hasStairInBody, isReachable2x2, hasLedgeInBody, findLedgeLanding };
