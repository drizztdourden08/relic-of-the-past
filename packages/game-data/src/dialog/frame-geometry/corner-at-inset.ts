/* @layer shared-game @kind logic */
import type { DialogCorner } from '../box-style';

const cornerAtInset = (corner: DialogCorner, size: number, inset: number): number => {
  if (corner === 'rounded') return Math.max(0, size - inset);
  if (corner === 'chamfered') return Math.max(0, size - inset * (2 - Math.SQRT2));
  return 0;
};

export { cornerAtInset };
