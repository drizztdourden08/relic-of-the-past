/* @layer renderer-lib @kind logic */
import * as controllersStore from '../controllers-store';

const vibratePattern = (target: string, pattern: { durationMs: number; intensity: number }[], gapMs: number = 0): void => {
  controllersStore.vibratePattern(target, pattern, gapMs);
};

export { vibratePattern };
