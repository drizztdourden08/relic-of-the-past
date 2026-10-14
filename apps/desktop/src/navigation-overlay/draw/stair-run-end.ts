/* @layer renderer-components @kind logic */
import { GRID_SIZE, STAIRS_TRAVERSAL_STATE } from '@rotp/navigation';

const stairRunEnd = (reachable: number[][], startRow: number, col: number, visited: Set<string>): number => {
  let maxR = startRow;
  visited.add(`${startRow},${col}`);
  let nr = startRow + 1;
  while (nr < GRID_SIZE && reachable[nr]?.[col] === STAIRS_TRAVERSAL_STATE) {
    visited.add(`${nr},${col}`);
    maxR = nr;
    nr++;
  }
  return maxR;
};

export { stairRunEnd };
