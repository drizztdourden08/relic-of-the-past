/* @layer renderer-lib @kind logic */
/**
 * Global controller vibration API.
 *
 * SDL3 batches frame writes via the main-process worker for every gamepad
 * now (Switch Pro, Xbox, PlayStation, 8BitDo, all one transport and one path). The
 * browser Gamepad API's vibrationActuator path has been removed along with
 * the rest of that transport.
 *
 * Any code (game hooks, UI, etc.) can call vibrate()/vibratePattern() without
 * caring about the underlying transport.
 */

import * as controllersStore from './controllers-store';


interface VibrateOptions {
  /** Vibration strength 0-1. Default 0.7. */
  intensity?: number;
}

const vibrate = (target: string, durationMs: number, opts?: VibrateOptions): void => {
  const intensity = opts?.intensity ?? 0.7;
  controllersStore.vibratePattern(target, [{ durationMs, intensity }], 0);
};

const vibratePattern = (target: string, pattern: { durationMs: number; intensity: number }[], gapMs: number = 0): void => {
  controllersStore.vibratePattern(target, pattern, gapMs);
};

export { vibrate, vibratePattern };
export type { VibrateOptions };
