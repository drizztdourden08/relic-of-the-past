/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import type { GridPos } from '../navigation-overlay.type';
import { bodyCells } from './body-cells';
import { isLedgeState } from './is-ledge-state';
import { isTraversalDirCompatible } from './is-traversal-dir-compatible';
import type { StepDir } from './pathfinding.type';

const canLeave2x2 = (pos: GridPos, dir: StepDir, reachable: ReachState[][]): boolean => {
  const [dr, dc] = dir;
  return bodyCells(reachable, pos.row, pos.col)
    .every((cell) => cell === undefined || !isLedgeState(cell) || isTraversalDirCompatible(cell, dr, dc));
};

export { canLeave2x2 };
