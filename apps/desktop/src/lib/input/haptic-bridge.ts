/**
 * Haptic Bridge — connects C game events to the haptic service and controller vibration.
 *
 * Registers `window.__onHapticEvent` callback for WASM/C hook notifications,
 * and wires the haptic service's output to the active controller via vibratePattern().
 */

import { handleHapticEvent, setVibrateFunction, updateHapticSettings } from '@shared/input/haptics';
import type { HapticSettings } from '@shared/input/haptics';
import type { VibrationSegment } from '@shared/input/base';
import { vibratePattern } from './vibration';
import { getInputManager } from './input-manager';

let initialized = false;
let activeTarget: string | null = null;

/**
 * Resolve the current vibration target from the input manager's detected devices.
 * Prefers the first connected, activated gamepad that supports vibration.
 */
function resolveVibrationTarget(): string | null {
  const mgr = getInputManager();
  const devices = mgr.getDevices();

  // Find first connected + activated gamepad
  for (const dev of devices) {
    if (dev.type === 'gamepad' && dev.connected && dev.activated) {
      return dev.id;
    }
  }
  return null;
}

/**
 * The dispatch function passed to the haptic service.
 * Resolves the active controller target and sends the pattern.
 */
function dispatchVibration(pattern: VibrationSegment[], gapMs?: number): void {
  // Re-resolve target each call (controller may connect/disconnect)
  const target = resolveVibrationTarget();
  if (!target) return;
  activeTarget = target;
  vibratePattern(target, pattern, gapMs ?? 0);
}

/**
 * Initialize the haptic bridge.
 * - Registers the window.__onHapticEvent callback for C-side hook notifications.
 * - Wires the haptic service output to the controller vibration system.
 */
function initHapticBridge(settings: HapticSettings): void {
  if (initialized) return;
  initialized = true;

  // Wire the haptic service to our dispatch function
  setVibrateFunction(dispatchVibration);
  updateHapticSettings(settings);

  // Register the global callback that the C/WASM hooks call
  (window as any).__onHapticEvent = (eventType: number, param: number) => {
    handleHapticEvent(eventType, param);
  };
}

/**
 * Update haptic settings at runtime (when user changes settings).
 */
function updateHapticBridgeSettings(settings: HapticSettings): void {
  updateHapticSettings(settings);
}

/**
 * Destroy the haptic bridge (cleanup on game stop).
 */
function destroyHapticBridge(): void {
  (window as any).__onHapticEvent = null;
  setVibrateFunction(null);
  activeTarget = null;
  initialized = false;
}

/** Get the currently resolved vibration target (for debugging) */
function getActiveVibrationTarget(): string | null {
  return activeTarget;
}

export {
  destroyHapticBridge,
  getActiveVibrationTarget,
  initHapticBridge,
  updateHapticBridgeSettings
};
