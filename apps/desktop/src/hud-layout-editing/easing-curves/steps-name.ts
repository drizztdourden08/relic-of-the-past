/* @layer renderer-components @kind logic */
import { DEFAULT_STEPS, MIN_STEPS } from './easing-curves.constants';
import type { HudEasing } from '@rotp/hud';

const stepsName = (n: number): HudEasing =>
  `steps(${Math.max(MIN_STEPS, Math.floor(Number.isFinite(n) ? n : DEFAULT_STEPS))})`;

export { stepsName };
