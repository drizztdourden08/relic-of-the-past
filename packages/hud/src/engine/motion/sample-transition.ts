/* @layer shared-hud @kind logic */
import { transitionProgress } from './transition-progress';

const sampleTransition = (
  from: number, to: number, elapsedMs: number, durationMs: number, easing: string | undefined,
): number => from + (to - from) * transitionProgress(elapsedMs, durationMs, easing);

export { sampleTransition };
