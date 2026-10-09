/* @layer shared-hud @kind logic */
import type { HudAnimationLoop } from '../../../types/hud/hud-motion';

const cyclePosition = (elapsedMs: number, delayMs: number, durationMs: number, loop: HudAnimationLoop): number => {
  const since = elapsedMs - delayMs;
  if (since <= 0) return 0;
  if (durationMs <= 0) return 1;
  const raw = since / durationMs;
  if (loop === 'none') return Math.min(1, raw);
  if (loop === 'loop') return raw % 1;
  const cycle = raw % 2;
  return cycle <= 1 ? cycle : 2 - cycle;
};

export { cyclePosition };
