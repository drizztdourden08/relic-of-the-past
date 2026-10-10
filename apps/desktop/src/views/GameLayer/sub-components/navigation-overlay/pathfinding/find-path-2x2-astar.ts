/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import type { GridPos } from '../navigation-overlay.type';
import { manhattan } from './manhattan';
import { keyOf } from './key-of';
import { isValid2x2 } from './is-valid-2x2';
import { isValidMove2x2 } from './is-valid-move-2x2';
import { canLeave2x2 } from './can-leave-2x2';
import { popLowest } from './pop-lowest';
import { rebuildPath } from './rebuild-path';
import { PATH_DIRS } from './pathfinding.constants';

const findPath2x2AStar = (start: GridPos, goal: GridPos, reachable: ReachState[][]): GridPos[] | null => {
  if (!isValid2x2(start.row, start.col, reachable) || !isValid2x2(goal.row, goal.col, reachable)) return null;

  const open: GridPos[] = [start];
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[keyOf(start), 0]]);
  const fScore = new Map<string, number>([[keyOf(start), manhattan(start, goal)]]);
  const closed = new Set<string>();

  const relax = (currentKey: string, next: GridPos): void => {
    const nextKey = keyOf(next);
    if (closed.has(nextKey)) return;
    const tentativeG = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + 1;
    if (tentativeG >= (gScore.get(nextKey) ?? Number.POSITIVE_INFINITY)) return;
    cameFrom.set(nextKey, currentKey);
    gScore.set(nextKey, tentativeG);
    fScore.set(nextKey, tentativeG + manhattan(next, goal));
    if (!open.some(p => p.row === next.row && p.col === next.col)) open.push(next);
  };
  const scoreOf = (pos: GridPos): number => fScore.get(keyOf(pos)) ?? Number.POSITIVE_INFINITY;

  let current = popLowest(open, scoreOf);
  while (current !== undefined) {
    const currentKey = keyOf(current);
    if (current.row === goal.row && current.col === goal.col) return rebuildPath(current, currentKey, cameFrom);
    closed.add(currentKey);
    for (const dir of PATH_DIRS) {
      const next: GridPos = { row: current.row + dir[0], col: current.col + dir[1] };
      if (canLeave2x2(current, dir, reachable) && isValidMove2x2(next, dir, reachable)) relax(currentKey, next);
    }
    current = popLowest(open, scoreOf);
  }
  return null;
};

export { findPath2x2AStar };
