/* @layer shared-hud @kind logic */
import { transitionProgress } from './transition-progress';

const sampleTransition = (
  span: { from: number; to: number }, elapsedMs: number, durationMs: number, easing: string | undefined,
): number => {
  const { from, to } = span;
  return from + (to - from) * transitionProgress(elapsedMs, durationMs, easing);
};

export { sampleTransition };
