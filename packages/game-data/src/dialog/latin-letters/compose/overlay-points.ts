/* @layer shared-game @kind logic */
import type { MaskBox } from '../mask/mask.type';
import type { Point } from './compose.type';
import { POINTS } from './overlay-points.constants';

const overlayPoints = (overlay: keyof typeof POINTS, mask: Uint8Array, box: MaskBox): Point[] | undefined =>
  POINTS[overlay](mask, box);

export { overlayPoints };
