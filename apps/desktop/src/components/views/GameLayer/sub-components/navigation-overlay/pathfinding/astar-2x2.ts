import type { ReachState } from '@shared/game/navigation/types';
import type { GridPos } from '../types';
import { manhattan, keyOf, isValid2x2, isValidMove2x2, PATH_DIRS } from './helpers';

/**
 * Snap a cursor tile to the nearest valid 2×2 top-left corner.
 * Checks the 4 squares that contain the cursor tile first, then spirals out.
 */
export function findNearest2x2Goal(cursorRow: number, cursorCol: number, reachable: ReachState[][]): GridPos | null {
  const seeds: GridPos[] = [
    { row: cursorRow, col: cursorCol },
    { row: cursorRow - 1, col: cursorCol },
    { row: cursorRow, col: cursorCol - 1 },
    { row: cursorRow - 1, col: cursorCol - 1 },
  ];
  for (const s of seeds) {
    if (isValid2x2(s.row, s.col, reachable)) return s;
  }
  for (let radius = 1; radius <= 8; radius++) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue;
        const pos = { row: cursorRow + dr, col: cursorCol + dc };
        if (isValid2x2(pos.row, pos.col, reachable)) return pos;
      }
    }
  }
  return null;
}

/** A* where each node is the top-left of a 2×2 block — allows traversal tiles in their permitted direction. */
export function findPath2x2AStar(
  start: GridPos, goal: GridPos, reachable: ReachState[][],
): GridPos[] | null {
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
}

/**
 * Find a 2×2 path from Link to goal.
 * Snaps Link's top-left to the nearest valid 2×2 start position.
 */
export function findPath2x2FromLink(
  linkX: number, linkY: number,
  screenWorldX: number, screenWorldY: number,
  goal: GridPos,
  reachable: ReachState[][],
): GridPos[] | null {
  const startRow = Math.floor((linkY - screenWorldY) / 8);
  const startCol = Math.floor((linkX - screenWorldX) / 8);
  const start = isValid2x2(startRow, startCol, reachable)
    ? { row: startRow, col: startCol }
    : findNearest2x2Goal(startRow, startCol, reachable);
  if (!start) return null;
  return findPath2x2AStar(start, goal, reachable);
}
