/* @layer renderer-lib @kind logic */
import type { SnesButton } from '@rotp/game-data';
import { SNES_BUTTON_BITS } from '@rotp/game-data';
import { resolveAxisPressThreshold } from './axis-press-threshold';
import type { AllowedDevices } from './profile-devices';
import { scopedEntries } from './device-scoped-map';
import type { DeviceScopedMap } from './device-scoped-map';

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

const keyboardMask = (keyStates: Map<string, boolean>, keyboardMap: Map<string, SnesButton>): number => {
  let mask = 0;
  for (const [code, pressed] of keyStates) {
    if (!pressed) continue;
    const btn = keyboardMap.get(code);
    if (btn !== undefined) mask |= (1 << SNES_BUTTON_BITS[btn]);
  }
  return mask;
};

const computeBitmask = (keyStates: Map<string, boolean>, keyboardMap: Map<string, SnesButton>, gamepadButtonMap: DeviceScopedMap<number, SnesButton>, gamepadAxisMap: DeviceScopedMap<string, SnesButton>, hidStates: Map<string, { buttons: boolean[]; axes: number[] }>, allowed: AllowedDevices): number => {
  let mask = allowed.keyboard ? keyboardMask(keyStates, keyboardMap) : 0;

  for (const [deviceKey, state] of hidStates) {
    if (!allowed.gamepadKeys.has(deviceKey)) continue;
    mask = applyDeviceState(mask, deviceKey, state.buttons, state.axes, gamepadButtonMap, gamepadAxisMap);
  }

  return mask;
};

export { computeBitmask };
