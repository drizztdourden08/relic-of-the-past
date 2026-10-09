/* @layer renderer-lib @kind logic */
import type { VibrateOptions } from './vibration.type';
import { DEFAULT_INTENSITY } from './vibration.constants';
import { vibratePattern } from './vibrate-pattern';

const vibrate = (target: string, durationMs: number, opts?: VibrateOptions): void => {
  const intensity = opts?.intensity ?? DEFAULT_INTENSITY;
  vibratePattern(target, [{ durationMs, intensity }], 0);
};

export { vibrate };
