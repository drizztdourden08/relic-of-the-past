/* @layer shared-game @kind logic */
import type { QuadrantBounds } from '../strategies/layer-strategy';

const boundsArea = ({ minRow, maxRow, minCol, maxCol }: QuadrantBounds): number =>
  (maxRow - minRow + 1) * (maxCol - minCol + 1);

export { boundsArea };
