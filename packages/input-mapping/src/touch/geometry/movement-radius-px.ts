/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';
import type { ScreenBox } from '../touch-logic.type';
import { basePx } from './base-px';

const movementRadiusPx = (layout: OrientationLayout, box: ScreenBox): number =>
  (basePx(box) * layout.movements[layout.movementType].scale) / 2;

export { movementRadiusPx };
