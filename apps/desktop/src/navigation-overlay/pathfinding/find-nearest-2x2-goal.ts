/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import type { GridPos } from '../navigation-overlay.type';
import { isValid2x2 } from './is-valid-2x2';
import { GOAL_SEARCH_RADIUS } from './pathfinding.constants';
import { ringCells } from './ring-cells';

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
  const cursor: GridPos = { row: cursorRow, col: cursorCol };
  for (let radius = 1; radius <= GOAL_SEARCH_RADIUS; radius++) {
    const hit = ringCells(cursor, radius).find((pos) => isValid2x2(pos.row, pos.col, reachable));
    if (hit) return hit;
  }
  return null;
};

export { findNearest2x2Goal };
