/* @layer renderer-lib @kind logic */
import { inputApi } from '@drizztdourden08/brock-input/renderer';

const vibratePattern = (target: string, pattern: { durationMs: number; intensity: number }[], gapMs = 0): void => {
  void inputApi()?.vibratePattern(target, pattern, gapMs);
};

export { vibratePattern };
