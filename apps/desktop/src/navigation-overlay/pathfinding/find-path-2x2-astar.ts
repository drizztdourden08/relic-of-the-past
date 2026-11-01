/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import type { GridPos } from '../navigation-overlay.type';
import { createFrontier } from './create-frontier';
import { keyOf } from './key-of';
import { isValid2x2 } from './is-valid-2x2';
import { isValidMove2x2 } from './is-valid-move-2x2';
import { canLeave2x2 } from './can-leave-2x2';
import { rebuildPath } from './rebuild-path';
import { PATH_DIRS } from './pathfinding.constants';

const findPath2x2AStar = (start: GridPos, goal: GridPos, reachable: ReachState[][]): GridPos[] | null => {
  if (!isValid2x2(start.row, start.col, reachable) || !isValid2x2(goal.row, goal.col, reachable)) return null;

  const frontier = createFrontier(start, goal, keyOf);

  let current = frontier.takeLowest();
  while (current !== undefined) {
    const currentKey = keyOf(current);
    if (current.row === goal.row && current.col === goal.col) return rebuildPath(current, currentKey, frontier.cameFrom);
    frontier.close(currentKey);
    for (const dir of PATH_DIRS) {
      const next: GridPos = { row: current.row + dir[0], col: current.col + dir[1] };
      if (canLeave2x2(current, dir, reachable) && isValidMove2x2(next, dir, reachable)) frontier.relax(currentKey, next, 1);
    }
    current = frontier.takeLowest();
  }
  return null;
};

export { findPath2x2AStar };
