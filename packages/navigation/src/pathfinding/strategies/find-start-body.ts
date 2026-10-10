/* @layer shared-game @kind logic */
import type { GridPos, TilePassability } from '@rotp/game-core';
import type { QuadrantBounds } from './layer-strategy';
import { GRID_SIZE } from '../types/grid.constants';
import { isBodyPassable } from './is-body-passable';
import { bodyOutOfBounds } from './body-out-of-bounds';

const firstFitOnRing = (start: GridPos, dist: number, fits: (r: number, c: number) => boolean): GridPos | null => {
  const { row, col } = start;
  for (let dr = -dist; dr <= dist; dr++) {
    for (let dc = -dist; dc <= dist; dc++) {
      const onRing = Math.abs(dr) === dist || Math.abs(dc) === dist;
      if (onRing && fits(row + dr, col + dc)) return { row: row + dr, col: col + dc };
    }
  }
  return null;
};

const firstFitNearStart = (start: GridPos, fits: (r: number, c: number) => boolean): GridPos | null => {
  const { row, col } = start;
  const candidates: [number, number][] = [
    [row, col], [row, col - 1], [row - 1, col], [row - 1, col - 1],
  ];
  for (const [r, c] of candidates) {
    if (fits(r, c)) return { row: r, col: c };
  }
  return null;
};

const findStartBody = (start: GridPos, grid: TilePassability[][], inventory: Set<string>, bounds: QuadrantBounds): GridPos | null => {
  const fits: (r: number, c: number) => boolean = (r, c) => !bodyOutOfBounds(r, c, bounds) && isBodyPassable(r, c, grid, inventory);
  const near = firstFitNearStart(start, fits);
  if (near) return near;
  for (let dist = 1; dist < GRID_SIZE; dist++) {
    const found = firstFitOnRing(start, dist, fits);
    if (found) return found;
  }
  return null;
};

export { findStartBody };
