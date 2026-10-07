/* @layer renderer-lib @kind logic */
/**
 * Computes the SNES bitmask each frame by reading
 * keyboard state and HID device state (SDL3 is the sole controller transport
 * now; the browser Gamepad API path has been removed).
 */

import type { SnesButton } from '@shared/types/controls';
import { SNES_BUTTON_BITS } from '@shared/types/controls';
import { resolveAxisPressThreshold } from './axis-press-threshold';
import type { AllowedDevices } from './profile-devices';
import { scopedEntries } from './device-scoped-map';
import type { DeviceScopedMap } from './device-scoped-map';

/** OR a device's buttons + axes into the mask, using only the bindings scoped to
 *  this device (plus any source-less ones, which apply to every device). */
const applyDeviceState = (mask: number, deviceKey: string, buttons: readonly boolean[], axes: readonly number[], gamepadButtonMap: DeviceScopedMap<number, SnesButton>, gamepadAxisMap: DeviceScopedMap<string, SnesButton>): number => {
  for (const [index, snesBtn] of scopedEntries(gamepadButtonMap, deviceKey)) {
    if (index < buttons.length && buttons[index]) {
      mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
    }
  }
  for (const [key, snesBtn] of scopedEntries(gamepadAxisMap, deviceKey)) {
    const [axisStr, dir] = key.split(':');
    const axisIndex = parseInt(axisStr, 10);
    if (axisIndex < axes.length) {
      const val = axes[axisIndex];
      const threshold = resolveAxisPressThreshold(axisIndex, deviceKey);
      if ((dir === '+' && val > threshold) || (dir === '-' && val < -threshold)) {
        mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
      }
    }
  }
  return mask;
};

const computeBitmask = (keyStates: Map<string, boolean>, keyboardMap: Map<string, SnesButton>, gamepadButtonMap: DeviceScopedMap<number, SnesButton>, gamepadAxisMap: DeviceScopedMap<string, SnesButton>, hidStates: Map<string, { buttons: boolean[]; axes: number[] }>, allowed: AllowedDevices): number => {
  let mask = 0;

  // Keyboard, only when the active profile actually binds keyboard keys
  if (allowed.keyboard) {
    for (const [code, pressed] of keyStates) {
      if (pressed) {
        const btn = keyboardMap.get(code);
        if (btn !== undefined) {
          mask |= (1 << SNES_BUTTON_BITS[btn]);
        }
      }
    }
  }

  // HID input (SDL3 covers every gamepad), only devices in the profile's map
  for (const [deviceKey, state] of hidStates) {
    if (!allowed.gamepadKeys.has(deviceKey)) continue;
    mask = applyDeviceState(mask, deviceKey, state.buttons, state.axes, gamepadButtonMap, gamepadAxisMap);
  }

  return mask;
};

export { computeBitmask };
