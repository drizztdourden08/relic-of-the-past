/* @layer renderer-components @kind logic */
import type { ReachState } from '@shared/game/navigation/types';
import type { GridPos } from '../types';
import { manhattan, keyOf, isValid2x2, isValidMove2x2, canLeave2x2, isTraversalDirCompatible, PATH_DIRS } from './helpers';

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
};

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

const findPath2x2LayerAware = (start: GridPos, goal: GridPos, startLayer: 0 | 1, layerGrids: [ReachState[][], ReachState[][]], merged: ReachState[][]): GridPos[] | null => {
  // Validate start on its layer, goal on either layer
  if (!isValid2x2(start.row, start.col, layerGrids[startLayer])) return null;
  if (!isValid2x2(goal.row, goal.col, layerGrids[0]) && !isValid2x2(goal.row, goal.col, layerGrids[1])) return null;

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

      // ─── Ledge fall: layer 0 → layer 1 ───
      // If the next position has ledge tiles and we're on layer 0 moving in the
      // correct direction, scan forward past all ledge tiles to find the landing on layer 1.
      if (current.layer === 0 && hasLedgeInBody(nr, nc, grid, dr, dc)) {
        const landing = findLedgeLanding(nr, nc, dr, dc, layerGrids[0], layerGrids[1]);
        if (landing) {
          const next: Node = { row: landing.row, col: landing.col, layer: 1 };
          const nextKey = nodeKey(next);
          if (!closed.has(nextKey)) {
            // Cost = number of tiles traversed during the fall
            const fallDist = Math.abs(landing.row - current.row) + Math.abs(landing.col - current.col);
            const tentativeG = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + fallDist;
            if (tentativeG < (gScore.get(nextKey) ?? Number.POSITIVE_INFINITY)) {
              cameFrom.set(nextKey, currentKey);
              gScore.set(nextKey, tentativeG);
              fScore.set(nextKey, tentativeG + manhattan(next, goal));
              if (!open.some(n => n.row === landing.row && n.col === landing.col && n.layer === 1)) open.push(next);
            }
          }
        }
        continue;
      }

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

    // ─── Stair transition (bidirectional, stay in place) ───
    // Stair tiles (state=10) on merged grid indicate a layer swap point.
    const otherLayer: 0 | 1 = current.layer === 0 ? 1 : 0;
    const otherGrid = layerGrids[otherLayer];
    if (hasStairInBody(current.row, current.col, merged) && isReachable2x2(current.row, current.col, otherGrid)) {
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
};

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

const findPath2x2FromLink = (linkX: number, linkY: number, screenWorldX: number, screenWorldY: number, goal: GridPos, reachable: ReachState[][], layerGrids?: [ReachState[][], ReachState[][]], startLayer?: 0 | 1): GridPos[] | null => {
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
};

export { findNearest2x2Goal, findPath2x2AStar, findPath2x2LayerAware, findPath2x2FromLink };
