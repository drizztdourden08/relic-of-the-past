/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import type { GridPos } from '../navigation-overlay.type';
import { bodyCells } from './body-cells';
import { inGrid2x2 } from './in-grid-2x2';
import { isLedgeState } from './is-ledge-state';
import { isTraversalDirCompatible } from './is-traversal-dir-compatible';
import type { StepDir } from './pathfinding.type';

const hasLedgeInBody = (next: GridPos, dir: StepDir, grid: ReachState[][]): boolean => {
  const [dr, dc] = dir;
  if (!inGrid2x2(next.row, next.col)) return false;
  return bodyCells(grid, next.row, next.col)
    .some((cell) => cell !== undefined && isLedgeState(cell) && isTraversalDirCompatible(cell, dr, dc));
};

export { hasLedgeInBody };
