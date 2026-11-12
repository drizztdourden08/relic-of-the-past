/* @layer shared-input @kind logic */
import type { TouchPoint } from '@rotp/features';
import type { PxPoint, ScreenBox } from '../touch-logic.type';

/** Overlay px to screen fraction. */
const toFraction = (p: PxPoint, box: ScreenBox): TouchPoint => ({ x: p.x / box.width, y: p.y / box.height });

export { toFraction };
