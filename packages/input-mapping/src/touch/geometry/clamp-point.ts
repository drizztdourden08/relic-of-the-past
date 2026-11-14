/* @layer shared-input @kind logic */
import type { TouchPoint } from '@rotp/features';
import { clampNumber } from './clamp-number';

const clampPoint = (p: TouchPoint): TouchPoint => ({ x: clampNumber(p.x, 0, 1), y: clampNumber(p.y, 0, 1) });

export { clampPoint };
