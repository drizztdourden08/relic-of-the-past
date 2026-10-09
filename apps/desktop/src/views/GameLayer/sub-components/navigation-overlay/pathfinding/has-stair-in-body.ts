/* @layer renderer-components @kind logic */
import { STAIRS_TRAVERSAL_STATE } from '@rotp/navigation';
import type { ReachState } from '@rotp/game-core';

const hasStairInBody = (row: number, col: number, reachable: ReachState[][]): boolean => {
  return reachable[row][col] === STAIRS_TRAVERSAL_STATE || reachable[row][col + 1] === STAIRS_TRAVERSAL_STATE ||
         reachable[row + 1][col] === STAIRS_TRAVERSAL_STATE || reachable[row + 1][col + 1] === STAIRS_TRAVERSAL_STATE;
};

export { hasStairInBody };
