/* @layer shared-game @kind logic */
import { columnExtent } from '../mask/column-extent';
import type { Point } from './compose.type';

const hookAt = (mask: Uint8Array, x: number, dx: number, up: boolean): Point[] | undefined => {
  const column = columnExtent(mask, x, x);
  if (column === undefined) return undefined;
  const y = up ? column.from - 1 : column.to + 1;
  const tip = up ? y - 1 : y + 1;
  return tip < 0 ? undefined : [[x, y], [x + dx, tip]];
};

export { hookAt };
