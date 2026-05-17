/**
 * Global controller vibration API.
 *
 * Provides a single `vibrate(target, durationMs, intensity?)` function that
 * works across controller types:
 *   - HID controllers (SPC2 etc.): uses registry controller.vibrate() via InputManager
 *   - Gamepad API controllers (Xbox etc.): uses vibrationActuator.playEffect()
 *
 * Any code (game hooks, UI, etc.) can call vibrate() without caring about
 * the underlying transport.
 */

import { getInputManager } from './input-manager';

// ── Public API ────────────────────────────────────────────────────────────

export interface VibrateOptions {
  /** Vibration strength 0–1. Default 0.7. */
  intensity?: number;
}

/**
 * Vibrate a Gamepad-API controller (Xbox, generic) using the standard
 * vibrationActuator API available in Chromium.
 */
export function vibrateGamepad(gamepadIndex: number, durationMs: number, opts?: VibrateOptions): void {
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
}

/**
 * Vibrate an HID controller via the registry's controller.vibrate() method.
 */
export function vibrateHid(deviceKey: string, durationMs: number, opts?: VibrateOptions): void {
  const intensity = opts?.intensity ?? 0.7;
  getInputManager().vibrateController(deviceKey, durationMs, intensity).catch(() => {});
}

/**
 * Convenience: vibrate whatever controller type, by key.
 *   - "gamepad-N" → Gamepad API
 *   - "xxxx:yyyy" → HID
 */
export function vibrate(target: string, durationMs: number, opts?: VibrateOptions): void {
  if (target.startsWith('gamepad-')) {
    const idx = parseInt(target.replace('gamepad-', ''), 10);
    if (!isNaN(idx)) vibrateGamepad(idx, durationMs, opts);
  } else {
    vibrateHid(target, durationMs, opts);
  }
}
