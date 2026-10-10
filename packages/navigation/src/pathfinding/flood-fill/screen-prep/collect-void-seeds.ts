/* @layer shared-game @kind logic */
import { GRID_SIZE } from '../../types/grid.constants';
import { cellAt } from '../../../checked-access';
import { DOORWAY_MAX_WIDTH, GRID_EDGES, OPEN_ATTR } from './screen-prep.constants';

const isOpenAt = (layer: number[][], [r, c]: [number, number]): boolean => cellAt(layer, r, c) === OPEN_ATTR;

const openRuns = (layer: number[][], at: (i: number) => [number, number]): [number, number][] => {
  const runs: [number, number][] = [];
  let runStart = -1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    const isOpen = i < GRID_SIZE && isOpenAt(layer, at(i));
    if (isOpen && runStart < 0) runStart = i;
    if (isOpen || runStart < 0) continue;
    runs.push([runStart, i]);
    runStart = -1;
  }
  return runs;
};

const isDoorway = (start: number, end: number): boolean =>
  end - start <= DOORWAY_MAX_WIDTH && start > 0 && end < GRID_SIZE;

const runTiles = (at: (i: number) => [number, number], start: number, end: number): [number, number][] =>
  Array.from({ length: end - start }, (_, k) => at(start + k));

const collectVoidSeeds = (layer: number[][]): Array<[number, number]> => {
  const seeds: Array<[number, number]> = [];
  for (const at of GRID_EDGES) {
    for (const [start, end] of openRuns(layer, at)) {
      if (!isDoorway(start, end)) seeds.push(...runTiles(at, start, end));
    }
  }
  return seeds;
};

export { collectVoidSeeds };
