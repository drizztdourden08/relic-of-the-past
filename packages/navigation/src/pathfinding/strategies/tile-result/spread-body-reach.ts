/* @layer shared-game @kind logic */
import type { ReachedLayer } from '../dual-layer-build-result.type';
import type { QuadrantBounds } from '../layer-strategy';
import { GRID_SIZE } from '../../types/grid.constants';
import { cellAt } from '../../../checked-access';
import { bodyTiles } from '../body-tiles';
import { keepFewer } from './keep-fewer';

const spreadBody = (reached: ReachedLayer, body: readonly [number, number], reqs: Set<string>, skip: (r: number, c: number) => boolean): void => {
  for (const [tr, tc] of bodyTiles(body[0], body[1])) {
    if (!skip(tr, tc)) keepFewer(reached, tr, tc, reqs);
  }
};

const spreadBodyReach = (reached: ReachedLayer, bodyReach: ReachedLayer, bounds: QuadrantBounds, skip: (r: number, c: number) => boolean = () => false): void => {
  const { minRow, maxRow, minCol, maxCol } = bounds;
  for (let r = minRow; r < GRID_SIZE - 1 && r <= maxRow; r++) {
    for (let c = minCol; c < GRID_SIZE - 1 && c <= maxCol; c++) {
      const reqs = cellAt(bodyReach, r, c);
      if (reqs !== null) spreadBody(reached, [r, c], reqs, skip);
    }
  }
};

export { spreadBodyReach };
