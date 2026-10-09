/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import type { GridPos } from '../navigation-overlay.type';
import { isValid2x2 } from './is-valid-2x2';
import { GOAL_SEARCH_RADIUS } from './pathfinding.constants';

const findNearest2x2Goal = (cursorRow: number, cursorCol: number, reachable: ReachState[][]): GridPos | null => {
  const seeds: GridPos[] = [
    { row: cursorRow, col: cursorCol },
    { row: cursorRow - 1, col: cursorCol },
    { row: cursorRow, col: cursorCol - 1 },
    { row: cursorRow - 1, col: cursorCol - 1 },
  ];
  for (const s of seeds) {
    if (isValid2x2(s.row, s.col, reachable)) return s;
  }
  for (let radius = 1; radius <= GOAL_SEARCH_RADIUS; radius++) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue;
        const pos = { row: cursorRow + dr, col: cursorCol + dc };
        if (isValid2x2(pos.row, pos.col, reachable)) return pos;
      }
    }
  }
  return null;
};

export { findNearest2x2Goal };
