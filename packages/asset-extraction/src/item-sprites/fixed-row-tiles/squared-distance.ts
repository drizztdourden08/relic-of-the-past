/* @layer shared-asset-extraction @kind logic */
import type { RGBA } from '../../graphics/palette';

const squaredDistance = (a: RGBA, b: RGBA): number =>
  (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

export { squaredDistance };
