/* @layer renderer-components @kind logic */
import { unionOf } from '@rotp/hud';
import { UNBOUNDED_RECT } from './hull.constants';
import type { Rect } from '@rotp/hud';

const hull = (rects: readonly Rect[]): Rect => (rects.length === 0 ? { ...UNBOUNDED_RECT } : unionOf(rects));

export { hull };
