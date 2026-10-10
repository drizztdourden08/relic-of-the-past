/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import { directionStep } from './direction-step';
import { hasStairInBody } from './has-stair-in-body';
import { isReachable2x2 } from './is-reachable-2x2';
import { PATH_DIRS } from './pathfinding.constants';
import type { LayerGrids, LayerIndex, LayerNode, LayerStep } from './pathfinding.type';

const layerSteps = (current: LayerNode, grids: LayerGrids, merged: ReachState[][]): LayerStep[] => {
  const steps = PATH_DIRS
    .map((dir) => directionStep(current, dir, grids))
    .filter((step): step is LayerStep => step !== null);
  const otherLayer: LayerIndex = current.layer === 0 ? 1 : 0;
  if (hasStairInBody(current.row, current.col, merged) && isReachable2x2(current.row, current.col, grids[otherLayer])) {
    steps.push({ node: { row: current.row, col: current.col, layer: otherLayer }, cost: 1 });
  }
  return steps;
};

export { layerSteps };
