/* @layer shared-input @kind logic */
import type { TouchPoint } from '@rotp/features';
import type { PxPoint, ScreenBox } from '../touch-logic.type';

/** Screen fraction to overlay px. */
const toPx = (p: TouchPoint, box: ScreenBox): PxPoint => ({ x: p.x * box.width, y: p.y * box.height });

export { toPx };
