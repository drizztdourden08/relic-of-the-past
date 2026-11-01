/* @layer renderer-components @kind logic */
import type { GridPos } from '../navigation-overlay.type';
import { createFrontier } from './create-frontier';
import { isValid2x2 } from './is-valid-2x2';
import { layerSteps } from './layer-steps';
import { rebuildPath } from './rebuild-path';
import type { LayerNode, LayerPathQuery } from './pathfinding.type';

const nodeKey = (n: LayerNode) => `${n.row},${n.col},${n.layer}`;

const findPath2x2LayerAware = (query: LayerPathQuery): GridPos[] | null => {
  const { start, goal, startLayer, layerGrids, merged } = query;
  if (!isValid2x2(start.row, start.col, layerGrids[startLayer])) return null;
  if (!isValid2x2(goal.row, goal.col, layerGrids[0]) && !isValid2x2(goal.row, goal.col, layerGrids[1])) return null;

  const frontier = createFrontier<LayerNode>({ ...start, layer: startLayer }, goal, nodeKey);

  let current = frontier.takeLowest();
  while (current !== undefined) {
    const currentKey = nodeKey(current);
    if (current.row === goal.row && current.col === goal.col) {
      return rebuildPath({ row: current.row, col: current.col }, currentKey, frontier.cameFrom);
    }
    frontier.close(currentKey);
    for (const step of layerSteps(current, layerGrids, merged)) frontier.relax(currentKey, step.node, step.cost);
    current = frontier.takeLowest();
  }
  return null;
};

export { findPath2x2LayerAware };
