/* @layer renderer-components @kind logic */
import type { GridPos } from '../navigation-overlay.type';
import { canLeave2x2 } from './can-leave-2x2';
import { findLedgeLanding } from './find-ledge-landing';
import { hasLedgeInBody } from './has-ledge-in-body';
import { isValidMove2x2 } from './is-valid-move-2x2';
import type { LayerGrids, LayerNode, LayerStep, StepDir } from './pathfinding.type';

const ledgeFall = (current: GridPos, next: GridPos, dir: StepDir, grids: LayerGrids): LayerStep | null => {
  const landing = findLedgeLanding(next, dir, grids);
  if (!landing) return null;
  const cost = Math.abs(landing.row - current.row) + Math.abs(landing.col - current.col);
  return { node: { row: landing.row, col: landing.col, layer: 1 }, cost };
};

const directionStep = (current: LayerNode, dir: StepDir, grids: LayerGrids): LayerStep | null => {
  const grid = grids[current.layer];
  const next: GridPos = { row: current.row + dir[0], col: current.col + dir[1] };
  if (!canLeave2x2(current, dir, grid)) return null;
  if (current.layer === 0 && hasLedgeInBody(next, dir, grid)) return ledgeFall(current, next, dir, grids);
  if (!isValidMove2x2(next, dir, grid)) return null;
  return { node: { row: next.row, col: next.col, layer: current.layer }, cost: 1 };
};

export { directionStep };
