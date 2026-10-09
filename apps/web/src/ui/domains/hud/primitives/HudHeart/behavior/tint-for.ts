/* @layer renderer-hud @kind logic */
import { HEART_TINTS } from '../HudHeart.constants';
import type { HeartTint } from '../HudHeart.type';

const tintFor = (armor: number): HeartTint =>
  HEART_TINTS[Math.min(Math.max(Math.trunc(armor), 0), HEART_TINTS.length - 1)];

export { tintFor };
