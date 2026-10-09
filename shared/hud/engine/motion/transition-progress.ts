/* @layer shared-hud @kind logic */
import { easingFn } from '../motion-easing';

const transitionProgress = (elapsedMs: number, durationMs: number, easing: string | undefined): number => {
  if (durationMs <= 0) return 1;
  const raw = Math.min(1, Math.max(0, elapsedMs / durationMs));
  return easingFn(easing)(raw);
};

export { transitionProgress };
