/* @layer shared-game @kind logic */
import { GRID_SIZE } from '../types/grid.constants';
import { DIRECTIONS } from '../core/grid.constants';
import { inBounds } from '../core/in-bounds';
import { cellAt, itemAt } from '../../checked-access';
import { OPEN_ATTR } from './screen-prep/screen-prep.constants';

const hasStructure = (layer: number[][]): boolean =>
  layer.some((row) => row.some((v) => v !== OPEN_ATTR));

const falseGrid = (): boolean[][] =>
  Array.from({ length: GRID_SIZE }, () => new Array<boolean>(GRID_SIZE).fill(false));

const isUnvisitedOpen = (upper: number[][], visited: boolean[][], r: number, c: number): boolean =>
  !cellAt(visited, r, c) && cellAt(upper, r, c) === OPEN_ATTR;

const openRegionFrom = (start: [number, number], upper: number[][], visited: boolean[][]): [number, number][] => {
  const region: [number, number][] = [];
  const queue: [number, number][] = [start];
  itemAt(visited, start[0])[start[1]] = true;
  for (let cell = queue.pop(); cell !== undefined; cell = queue.pop()) {
    const [r, c] = cell;
    region.push([r, c]);
    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      if (!inBounds(nr, nc) || !isUnvisitedOpen(upper, visited, nr, nc)) continue;
      itemAt(visited, nr)[nc] = true;
      queue.push([nr, nc]);
    }
  }
  return region;
};

const markRegion = (mask: boolean[][], region: [number, number][]): void => {
  for (const [r, c] of region) itemAt(mask, r)[c] = true;
};

const unsupportedUpperVoid = (upper: number[][], lower: number[][]): boolean[][] => {
  const mask = falseGrid();
  if (!hasStructure(lower)) return mask;

  const visited = falseGrid();
  for (let r0 = 0; r0 < GRID_SIZE; r0++) {
    for (let c0 = 0; c0 < GRID_SIZE; c0++) {
      if (!isUnvisitedOpen(upper, visited, r0, c0)) continue;
      const region = openRegionFrom([r0, c0], upper, visited);
      const supported = region.some(([r, c]) => cellAt(lower, r, c) !== OPEN_ATTR);
      if (!supported) markRegion(mask, region);
    }
  }
  return mask;
};

export { unsupportedUpperVoid };
