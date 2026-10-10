/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import { BODY_OFFSETS } from './pathfinding.constants';

const bodyCells = (grid: ReachState[][], row: number, col: number): (ReachState | undefined)[] =>
  BODY_OFFSETS.map(([dr, dc]) => grid[row + dr]?.[col + dc]);

export { bodyCells };
