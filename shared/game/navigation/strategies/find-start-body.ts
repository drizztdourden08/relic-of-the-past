/* @layer shared-game @kind logic */
import type { GridPos, TilePassability } from '@rotp/game-core';
import { GRID_SIZE } from '../types/grid.constants';
import { isBodyPassable } from './is-body-passable';

const findStartBody = (row: number, col: number, grid: TilePassability[][], inventory: Set<string>, minR: number, maxR: number, minC: number, maxC: number): GridPos | null => {
  const fits = (r: number, c: number): boolean =>
    !(r < minR || r + 1 > maxR || c < minC || c + 1 > maxC) && isBodyPassable(r, c, grid, inventory);

  const candidates: [number, number][] = [
    [row, col], [row, col - 1], [row - 1, col], [row - 1, col - 1],
  ];
  for (const [r, c] of candidates) {
    if (fits(r, c)) return { row: r, col: c };
  }
  for (let dist = 1; dist < GRID_SIZE; dist++) {
    for (let dr = -dist; dr <= dist; dr++) {
      for (let dc = -dist; dc <= dist; dc++) {
        if (Math.abs(dr) !== dist && Math.abs(dc) !== dist) continue;
        if (fits(row + dr, col + dc)) return { row: row + dr, col: col + dc };
      }
    }
  }
  return null;
};

export { findStartBody };
