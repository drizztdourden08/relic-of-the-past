/* @layer renderer-components @kind logic */
import { STAIRS_TRAVERSAL_STATE } from '@rotp/navigation';
import type { ReachState } from '@rotp/game-core';
import { bodyCells } from './body-cells';

const hasStairInBody = (row: number, col: number, reachable: ReachState[][]): boolean =>
  bodyCells(reachable, row, col).some((cell) => cell === STAIRS_TRAVERSAL_STATE);

export { hasStairInBody };
