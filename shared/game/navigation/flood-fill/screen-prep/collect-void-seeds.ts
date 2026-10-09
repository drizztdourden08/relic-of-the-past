/* @layer shared-game @kind logic */
import { GRID_SIZE } from '../../types';
import { DOORWAY_MAX_WIDTH, GRID_EDGES, OPEN_ATTR } from './screen-prep.constants';

const collectVoidSeeds = (layer: number[][]): Array<[number, number]> => {
  const seeds: Array<[number, number]> = [];

  for (const at of GRID_EDGES) {
    let runStart = -1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      const isOpen = i < GRID_SIZE && layer[at(i)[0]][at(i)[1]] === OPEN_ATTR;
      if (isOpen && runStart < 0) runStart = i;
      if (isOpen || runStart < 0) continue;

      const runLen = i - runStart;
      const hasFlankBefore = runStart > 0;
      const hasFlankAfter = i < GRID_SIZE;
      const isDoorway = runLen <= DOORWAY_MAX_WIDTH && hasFlankBefore && hasFlankAfter;
      if (!isDoorway) {
        for (let j = runStart; j < i; j++) seeds.push(at(j));
      }
      runStart = -1;
    }
  }
  return seeds;
};

export { collectVoidSeeds };
