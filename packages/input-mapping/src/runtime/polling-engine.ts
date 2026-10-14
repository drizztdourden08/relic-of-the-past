/* @layer renderer-lib @kind logic */
import type { SnesButton } from '@rotp/game-data';
import { SNES_BUTTON_BITS } from '@rotp/game-data';
import { resolveAxisPressThreshold } from './axis-press-threshold';
import { axisPressed } from './axis-pressed';
import { scopedEntries } from './device-scoped-map';
import type { DeviceScopedMap } from './device-scoped-map';
import type { BitmaskSources, GamepadMaps, HidDeviceState } from './polling-engine.type';

const buttonMask = (deviceKey: string, buttons: readonly boolean[], map: DeviceScopedMap<number, SnesButton>): number => {
  let mask = 0;
  for (const [index, snesBtn] of scopedEntries(map, deviceKey)) {
    if (index < buttons.length && buttons[index]) {
      mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
    }
  }
  return mask;
};

const axisMask = (deviceKey: string, axes: readonly number[], map: DeviceScopedMap<string, SnesButton>): number => {
  let mask = 0;
  for (const [key, snesBtn] of scopedEntries(map, deviceKey)) {
    const [axisStr, dir] = key.split(':');
    const axisIndex = parseInt(axisStr ?? '', 10);
    if (axisIndex < axes.length) {
      const val = axes[axisIndex];
      const threshold = resolveAxisPressThreshold(axisIndex, deviceKey);
      if (axisPressed(val, dir, threshold)) {
        mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
      }
    }
  }
  return mask;
};

const deviceMask = (deviceKey: string, state: HidDeviceState, maps: GamepadMaps): number =>
  buttonMask(deviceKey, state.buttons, maps.gamepadButtonMap) | axisMask(deviceKey, state.axes, maps.gamepadAxisMap);

const keyboardMask = (keyStates: Map<string, boolean>, keyboardMap: Map<string, SnesButton>): number => {
  let mask = 0;
  for (const [code, pressed] of keyStates) {
    if (!pressed) continue;
    const btn = keyboardMap.get(code);
    if (btn !== undefined) mask |= (1 << SNES_BUTTON_BITS[btn]);
  }
  return mask;
};

const computeBitmask = (sources: BitmaskSources): number => {
  const { keyStates, keyboardMap, gamepadButtonMap, gamepadAxisMap, hidStates, allowed } = sources;
  let mask = allowed.keyboard ? keyboardMask(keyStates, keyboardMap) : 0;

  for (const [deviceKey, state] of hidStates) {
    if (!allowed.gamepadKeys.has(deviceKey)) continue;
    mask |= deviceMask(deviceKey, state, { gamepadButtonMap, gamepadAxisMap });
  }

  return mask;
};

export { computeBitmask };
