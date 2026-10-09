/* @layer renderer-components @kind logic */
import type { ReachState } from '@shared/game/navigation/types';
import type { GridPos } from '../navigation-overlay.type';
import { manhattan } from './manhattan';
import { keyOf } from './key-of';
import { isValid2x2 } from './is-valid-2x2';
import { isValidMove2x2 } from './is-valid-move-2x2';
import { canLeave2x2 } from './can-leave-2x2';
import { PATH_DIRS } from './pathfinding.constants';

const findPath2x2AStar = (start: GridPos, goal: GridPos, reachable: ReachState[][]): GridPos[] | null => {
  if (!isValid2x2(start.row, start.col, reachable) || !isValid2x2(goal.row, goal.col, reachable)) return null;

  const open: GridPos[] = [start];
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[keyOf(start), 0]]);
  const fScore = new Map<string, number>([[keyOf(start), manhattan(start, goal)]]);
  const closed = new Set<string>();

  while (open.length > 0) {
    let bestIdx = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let i = 0; i < open.length; i++) {
      const s = fScore.get(keyOf(open[i])) ?? Number.POSITIVE_INFINITY;
      if (s < bestScore) { bestScore = s; bestIdx = i; }
    }

    const current = open.splice(bestIdx, 1)[0];
    const currentKey = keyOf(current);
    if (current.row === goal.row && current.col === goal.col) {
      const path: GridPos[] = [current];
      let walk = currentKey;
      while (cameFrom.has(walk)) {
        const prev = cameFrom.get(walk)!;
        const [r, c] = prev.split(',').map(Number);
        path.push({ row: r, col: c });
        walk = prev;
      }
      path.reverse();
      return path;
    }

    closed.add(currentKey);

    for (const [dr, dc] of PATH_DIRS) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      if (!canLeave2x2(current.row, current.col, dr, dc, reachable)) continue;
      if (!isValidMove2x2(nr, nc, dr, dc, reachable)) continue;

      const nextKey = `${nr},${nc}`;
      if (closed.has(nextKey)) continue;

      const tentativeG = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + 1;
      if (tentativeG >= (gScore.get(nextKey) ?? Number.POSITIVE_INFINITY)) continue;

      cameFrom.set(nextKey, currentKey);
      gScore.set(nextKey, tentativeG);
      fScore.set(nextKey, tentativeG + manhattan({ row: nr, col: nc }, goal));
      if (!open.some(p => p.row === nr && p.col === nc)) open.push({ row: nr, col: nc });
    }
  }
  return null;
};

export { findPath2x2AStar };
