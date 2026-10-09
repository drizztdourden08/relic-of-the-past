/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import type { GridPos } from '../navigation-overlay.type';
import { manhattan } from './manhattan';
import { isValid2x2 } from './is-valid-2x2';
import { isValidMove2x2 } from './is-valid-move-2x2';
import { canLeave2x2 } from './can-leave-2x2';
import { hasStairInBody } from './has-stair-in-body';
import { isReachable2x2 } from './is-reachable-2x2';
import { hasLedgeInBody } from './has-ledge-in-body';
import { findLedgeLanding } from './find-ledge-landing';
import { PATH_DIRS } from './pathfinding.constants';
import type { LayerGrids, LayerIndex, LayerNode } from './pathfinding.type';

const nodeKey = (n: LayerNode) => `${n.row},${n.col},${n.layer}`;

const findPath2x2LayerAware = (start: GridPos, goal: GridPos, startLayer: LayerIndex, layerGrids: LayerGrids, merged: ReachState[][]): GridPos[] | null => {
  if (!isValid2x2(start.row, start.col, layerGrids[startLayer])) return null;
  if (!isValid2x2(goal.row, goal.col, layerGrids[0]) && !isValid2x2(goal.row, goal.col, layerGrids[1])) return null;

  const startNode: LayerNode = { ...start, layer: startLayer };
  const startKey = nodeKey(startNode);

  const open: LayerNode[] = [startNode];
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startKey, 0]]);
  const fScore = new Map<string, number>([[startKey, manhattan(start, goal)]]);
  const closed = new Set<string>();

  const relax = (currentKey: string, next: LayerNode, stepCost: number): void => {
    const nextKey = nodeKey(next);
    if (closed.has(nextKey)) return;
    const tentativeG = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + stepCost;
    if (tentativeG >= (gScore.get(nextKey) ?? Number.POSITIVE_INFINITY)) return;
    cameFrom.set(nextKey, currentKey);
    gScore.set(nextKey, tentativeG);
    fScore.set(nextKey, tentativeG + manhattan(next, goal));
    if (!open.some(n => n.row === next.row && n.col === next.col && n.layer === next.layer)) open.push(next);
  };

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

    for (const [dr, dc] of PATH_DIRS) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      if (!canLeave2x2(current.row, current.col, dr, dc, grid)) continue;

      const fallsOffLedge = current.layer === 0 && hasLedgeInBody(nr, nc, grid, dr, dc);
      if (fallsOffLedge) {
        const landing = findLedgeLanding(nr, nc, dr, dc, layerGrids[0], layerGrids[1]);
        if (landing) {
          const fallDist = Math.abs(landing.row - current.row) + Math.abs(landing.col - current.col);
          relax(currentKey, { row: landing.row, col: landing.col, layer: 1 }, fallDist);
        }
        continue;
      }

      if (!isValidMove2x2(nr, nc, dr, dc, grid)) continue;
      relax(currentKey, { row: nr, col: nc, layer: current.layer }, 1);
    }

    const otherLayer: LayerIndex = current.layer === 0 ? 1 : 0;
    const otherGrid = layerGrids[otherLayer];
    if (hasStairInBody(current.row, current.col, merged) && isReachable2x2(current.row, current.col, otherGrid)) {
      relax(currentKey, { row: current.row, col: current.col, layer: otherLayer }, 1);
    }
  }
  return null;
};

export { findPath2x2LayerAware };
