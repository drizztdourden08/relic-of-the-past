/* @layer shared-input @kind logic */
import { TOUCH_BASE_SIZE } from '../touch-emit.constants';
import type { ScreenBox } from '../touch-logic.type';

/** Diameter in px of a scale-1 button. */
const basePx = (box: ScreenBox): number => TOUCH_BASE_SIZE * Math.min(box.width, box.height);

export { basePx };
