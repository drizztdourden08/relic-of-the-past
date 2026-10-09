/* @layer shared-game @kind logic */
import { GRID_SIZE } from '../../types/grid.constants';
import { DIRECTIONS } from '../../core/grid.constants';
import { inBounds } from '../../core/in-bounds';
import { collectVoidSeeds } from './collect-void-seeds';
import { OPEN_ATTR, SOLID_ATTR } from './screen-prep.constants';

const constrainVoidTiles = (thisLayer: number[][], _otherLayer: number[][]): number[][] => {
  const isVoid: boolean[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
  const queue: Array<[number, number]> = [];

  for (const [r, c] of collectVoidSeeds(thisLayer)) {
    if (isVoid[r][c]) continue;
    isVoid[r][c] = true;
    queue.push([r, c]);
  }
  while (queue.length > 0) {
    const [qr, qc] = queue.shift()!;
    for (const [dr, dc] of DIRECTIONS) {
      const nr = qr + dr, nc = qc + dc;
      if (!inBounds(nr, nc)) continue;
      if (isVoid[nr][nc]) continue;
      if (thisLayer[nr][nc] !== OPEN_ATTR) continue;
      isVoid[nr][nc] = true;
      queue.push([nr, nc]);
    }
  }

  return Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => (isVoid[r][c] ? SOLID_ATTR : thisLayer[r][c])),
  );
};

export { constrainVoidTiles };
