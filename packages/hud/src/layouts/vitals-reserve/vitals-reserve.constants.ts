/* @layer shared-hud @kind constants */
import type { Rect, Size } from '../geometry.type';

const REFERENCE_VIEW: Size = { w: 398, h: 224 };

const EMPTY_RECT: Rect = { x: 0, y: 0, w: 0, h: 0 };

const HEALTH_UNITS_PER_HEART = 8;

export { EMPTY_RECT, HEALTH_UNITS_PER_HEART, REFERENCE_VIEW };
