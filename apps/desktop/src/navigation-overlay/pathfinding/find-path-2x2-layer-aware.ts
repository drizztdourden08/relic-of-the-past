/* @layer renderer-components @kind logic */
import type { GridPos } from '../navigation-overlay.type';
import { manhattan } from './manhattan';
import { isValid2x2 } from './is-valid-2x2';
import { layerSteps } from './layer-steps';
import { popLowest } from './pop-lowest';
import { rebuildPath } from './rebuild-path';
import type { LayerNode, LayerPathQuery } from './pathfinding.type';

const nodeKey = (n: LayerNode) => `${n.row},${n.col},${n.layer}`;

const findPath2x2LayerAware = (query: LayerPathQuery): GridPos[] | null => {
  const { start, goal, startLayer, layerGrids, merged } = query;
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
  const scoreOf = (node: LayerNode): number => fScore.get(nodeKey(node)) ?? Number.POSITIVE_INFINITY;

  let current = popLowest(open, scoreOf);
  while (current !== undefined) {
    const currentKey = nodeKey(current);
    if (current.row === goal.row && current.col === goal.col) {
      return rebuildPath({ row: current.row, col: current.col }, currentKey, cameFrom);
    }
    closed.add(currentKey);
    for (const step of layerSteps(current, layerGrids, merged)) relax(currentKey, step.node, step.cost);
    current = popLowest(open, scoreOf);
  }
  return null;
};

export { findPath2x2LayerAware };
