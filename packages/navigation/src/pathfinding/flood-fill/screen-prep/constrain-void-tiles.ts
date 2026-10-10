/* @layer shared-game @kind logic */
import { GRID_SIZE } from '../../types/grid.constants';
import { DIRECTIONS } from '../../core/grid.constants';
import { inBounds } from '../../core/in-bounds';
import { cellAt, itemAt } from '../../../checked-access';
import { collectVoidSeeds } from './collect-void-seeds';
import { OPEN_ATTR, SOLID_ATTR } from './screen-prep.constants';

const spreadVoid = (thisLayer: number[][], isVoid: boolean[][], queue: Array<[number, number]>): void => {
  for (let cell = queue.shift(); cell !== undefined; cell = queue.shift()) {
    const [qr, qc] = cell;
    for (const [dr, dc] of DIRECTIONS) {
      const nr = qr + dr, nc = qc + dc;
      if (!inBounds(nr, nc) || cellAt(isVoid, nr, nc) || cellAt(thisLayer, nr, nc) !== OPEN_ATTR) continue;
      itemAt(isVoid, nr)[nc] = true;
      queue.push([nr, nc]);
    }
  }
};

const constrainVoidTiles = (thisLayer: number[][], _otherLayer: number[][]): number[][] => {
  const isVoid: boolean[][] = Array.from({ length: GRID_SIZE }, () => new Array<boolean>(GRID_SIZE).fill(false));
  const queue: Array<[number, number]> = [];

  for (const [r, c] of collectVoidSeeds(thisLayer)) {
    if (cellAt(isVoid, r, c)) continue;
    itemAt(isVoid, r)[c] = true;
    queue.push([r, c]);
  }
  spreadVoid(thisLayer, isVoid, queue);

  return Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => (cellAt(isVoid, r, c) ? SOLID_ATTR : cellAt(thisLayer, r, c))),
  );
};

export { constrainVoidTiles };
