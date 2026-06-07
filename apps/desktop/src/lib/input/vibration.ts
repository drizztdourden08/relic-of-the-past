/* @layer renderer-lib @kind logic */
/**
 * Global controller vibration API.
 *
 * Provides unified `vibrate()` and `vibratePattern()` functions that work
 * across controller types:
 *   - HID controllers (SPC2, Switch Pro, etc.): batch frame writes via main-process worker
 *   - Gamepad API controllers (Xbox etc.): vibrationActuator.playEffect()
 *
 * Any code (game hooks, UI, etc.) can call vibrate()/vibratePattern() without
 * caring about the underlying transport.
 */

// ── Public API ────────────────────────────────────────────────────────────

interface VibrateOptions {
  /** Vibration strength 0–1. Default 0.7. */
  intensity?: number;
}

const vibrateGamepad = (gamepadIndex: number, durationMs: number, opts?: VibrateOptions): void => {
  const intensity = opts?.intensity ?? 0.7;
  try {
    const gp = navigator.getGamepads()[gamepadIndex];
    if (!gp) return;

    const actuator = (gp as any).vibrationActuator;
    if (actuator?.playEffect) {
      actuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: durationMs,
        weakMagnitude: intensity * 0.6,
        strongMagnitude: intensity,
      });
    }
  } catch { /* ignore — not all browsers/drivers support this */ }
};

const vibrateGamepadPattern = (gamepadIndex: number, pattern: { durationMs: number; intensity: number }[], gapMs: number = 0): void => {
  let delay = 0;
  for (let i = 0; i < pattern.length; i++) {
    const seg = pattern[i];
    setTimeout(() => vibrateGamepad(gamepadIndex, seg.durationMs, { intensity: seg.intensity }), delay);
    delay += seg.durationMs + (i < pattern.length - 1 ? gapMs : 0);
  }
};

const vibrateHid = (deviceKey: string, durationMs: number, opts?: VibrateOptions): void => {
  const intensity = opts?.intensity ?? 0.7;
  window.api.vibratePattern(deviceKey, [{ durationMs, intensity }], 0);
};

const vibrate = (target: string, durationMs: number, opts?: VibrateOptions): void => {
  if (target.startsWith('gamepad-')) {
    const idx = parseInt(target.replace('gamepad-', ''), 10);
    if (!isNaN(idx)) vibrateGamepad(idx, durationMs, opts);
  } else {
    vibrateHid(target, durationMs, opts);
  }
};

const vibratePattern = (target: string, pattern: { durationMs: number; intensity: number }[], gapMs: number = 0): void => {
  if (target.startsWith('gamepad-')) {
    const idx = parseInt(target.replace('gamepad-', ''), 10);
    if (!isNaN(idx)) vibrateGamepadPattern(idx, pattern, gapMs);
  } else {
    window.api.vibratePattern(target, pattern, gapMs);
  }
};

export {
  vibrate,
  vibrateGamepad,
  vibrateGamepadPattern,
  vibrateHid,
  vibratePattern
};
export type { VibrateOptions };
