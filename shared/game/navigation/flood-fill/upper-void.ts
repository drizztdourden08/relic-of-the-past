/* @layer shared-game @kind logic */
import { GRID_SIZE } from '../types/grid.constants';
import { DIRECTIONS } from '../core/grid.constants';
import { inBounds } from '../core/in-bounds';
import { OPEN_ATTR } from './screen-prep/screen-prep.constants';

const hasStructure = (layer: number[][]): boolean =>
  layer.some((row) => row.some((v) => v !== OPEN_ATTR));

const unsupportedUpperVoid = (upper: number[][], lower: number[][]): boolean[][] => {
  const mask: boolean[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
  if (!hasStructure(lower)) return mask;

  const visited: boolean[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));

  for (let r0 = 0; r0 < GRID_SIZE; r0++) {
    for (let c0 = 0; c0 < GRID_SIZE; c0++) {
      if (visited[r0][c0] || upper[r0][c0] !== OPEN_ATTR) continue;

      const region: Array<[number, number]> = [];
      const queue: Array<[number, number]> = [[r0, c0]];
      visited[r0][c0] = true;
      let supported = false;

      while (queue.length > 0) {
        const [r, c] = queue.pop()!;
        region.push([r, c]);
        if (lower[r][c] !== OPEN_ATTR) supported = true;
        for (const [dr, dc] of DIRECTIONS) {
          const nr = r + dr;
          const nc = c + dc;
          if (!inBounds(nr, nc)) continue;
          if (visited[nr][nc] || upper[nr][nc] !== OPEN_ATTR) continue;
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }

      if (!supported) {
        for (const [r, c] of region) mask[r][c] = true;
      }
    }
  }
  return mask;
};

export { unsupportedUpperVoid };
