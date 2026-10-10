/* @layer shared-game @kind logic */
import type { ReachedLayer } from '../dual-layer-build-result.type';
import { cellAt, itemAt } from '../../../checked-access';

const keepFewer = (reached: ReachedLayer, row: number, col: number, reqs: Set<string>): void => {
  const existing = cellAt(reached, row, col);
  if (existing === null || existing.size > reqs.size) itemAt(reached, row)[col] = reqs;
};

export { keepFewer };
