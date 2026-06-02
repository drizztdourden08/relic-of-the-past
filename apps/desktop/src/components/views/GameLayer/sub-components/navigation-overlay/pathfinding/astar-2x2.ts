import type { ReachState } from '@shared/game/navigation/types';
import type { GridPos } from '../types';
import { manhattan, keyOf, isValid2x2, isValidMove2x2, canLeave2x2, PATH_DIRS } from './helpers';

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
}

/**
 * Layer-aware A* for dual-layer rooms. Tracks (row, col, layer) as state.
 * Moves stay on the same layer; stair tiles (state=10) allow transitioning.
 */
export function findPath2x2LayerAware(
  start: GridPos, goal: GridPos,
  startLayer: 0 | 1,
  layerGrids: [ReachState[][], ReachState[][]],
  merged: ReachState[][],
): GridPos[] | null {
  // Validate start on its layer, goal on merged (could be either layer)
  if (!isValid2x2(start.row, start.col, layerGrids[startLayer])) return null;
  if (!isValid2x2(goal.row, goal.col, merged)) return null;

  type Node = { row: number; col: number; layer: 0 | 1 };
  const nodeKey = (n: Node) => `${n.row},${n.col},${n.layer}`;
  const startNode: Node = { ...start, layer: startLayer };
  const startKey = nodeKey(startNode);

  const open: Node[] = [startNode];
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startKey, 0]]);
  const fScore = new Map<string, number>([[startKey, manhattan(start, goal)]]);
  const closed = new Set<string>();

  while (open.length > 0) {
    let bestIdx = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let i = 0; i < open.length; i++) {
      const s = fScore.get(nodeKey(open[i])) ?? Number.POSITIVE_INFINITY;
      if (s < bestScore) { bestScore = s; bestIdx = i; }
    }

    const current = open.splice(bestIdx, 1)[0];
    const currentKey = nodeKey(current);
    if (current.row === goal.row && current.col === goal.col) {
      const path: GridPos[] = [{ row: current.row, col: current.col }];
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
    const grid = layerGrids[current.layer];

    // Normal movement on same layer
    for (const [dr, dc] of PATH_DIRS) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      if (!canLeave2x2(current.row, current.col, dr, dc, grid)) continue;
      if (!isValidMove2x2(nr, nc, dr, dc, grid)) continue;

      const next: Node = { row: nr, col: nc, layer: current.layer };
      const nextKey = nodeKey(next);
      if (closed.has(nextKey)) continue;

      const tentativeG = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + 1;
      if (tentativeG >= (gScore.get(nextKey) ?? Number.POSITIVE_INFINITY)) continue;

      cameFrom.set(nextKey, currentKey);
      gScore.set(nextKey, tentativeG);
      fScore.set(nextKey, tentativeG + manhattan(next, goal));
      if (!open.some(n => n.row === nr && n.col === nc && n.layer === current.layer)) open.push(next);
    }

    // Layer transition at stair tiles (state=10): check if body overlaps a stair
    // and the same tile is valid on the other layer
    const otherLayer: 0 | 1 = current.layer === 0 ? 1 : 0;
    const otherGrid = layerGrids[otherLayer];
    if (hasStairInBody(current.row, current.col, grid) && isValid2x2(current.row, current.col, otherGrid)) {
      const next: Node = { row: current.row, col: current.col, layer: otherLayer };
      const nextKey = nodeKey(next);
      if (!closed.has(nextKey)) {
        const tentativeG = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + 1;
        if (tentativeG < (gScore.get(nextKey) ?? Number.POSITIVE_INFINITY)) {
          cameFrom.set(nextKey, currentKey);
          gScore.set(nextKey, tentativeG);
          fScore.set(nextKey, tentativeG + manhattan(next, goal));
          if (!open.some(n => n.row === current.row && n.col === current.col && n.layer === otherLayer)) open.push(next);
        }
      }
    }
  }
  return null;
}

/** Check if any tile in a 2×2 body is a stair (state=10). */
function hasStairInBody(row: number, col: number, reachable: ReachState[][]): boolean {
  return reachable[row][col] === 10 || reachable[row][col + 1] === 10 ||
         reachable[row + 1][col] === 10 || reachable[row + 1][col + 1] === 10;
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
  layerGrids?: [ReachState[][], ReachState[][]],
  startLayer?: 0 | 1,
): GridPos[] | null {
  const startRow = Math.floor((linkY - screenWorldY) / 8);
  const startCol = Math.floor((linkX - screenWorldX) / 8);

  // Layer-aware path when dual-layer data is available
  if (layerGrids && startLayer !== undefined) {
    const grid = layerGrids[startLayer];
    const start = isValid2x2(startRow, startCol, grid)
      ? { row: startRow, col: startCol }
      : findNearest2x2Goal(startRow, startCol, grid);
    if (!start) return null;
    return findPath2x2LayerAware(start, goal, startLayer, layerGrids, reachable);
  }

  // Single-layer fallback
  const start = isValid2x2(startRow, startCol, reachable)
    ? { row: startRow, col: startCol }
    : findNearest2x2Goal(startRow, startCol, reachable);
  if (!start) return null;
  return findPath2x2AStar(start, goal, reachable);
}
