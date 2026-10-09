/* @layer shared-hud @kind logic */
import { transitionProgress } from './transition-progress';

const enterExitProgress = (elapsedMs: number, durationMs: number, easing: string | undefined): number =>
  transitionProgress(elapsedMs, durationMs, easing);

export { enterExitProgress };
