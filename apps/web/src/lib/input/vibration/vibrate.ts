/* @layer renderer-lib @kind logic */
import * as controllersStore from '../controllers-store';
import type { VibrateOptions } from './vibration.type';
import { DEFAULT_INTENSITY } from './vibration.constants';

const vibrate = (target: string, durationMs: number, opts?: VibrateOptions): void => {
  const intensity = opts?.intensity ?? DEFAULT_INTENSITY;
  controllersStore.vibratePattern(target, [{ durationMs, intensity }], 0);
};

export { vibrate };
