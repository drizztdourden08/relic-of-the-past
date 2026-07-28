/* @layer renderer-lib @kind logic */
/**
 * Polling Engine — computes the SNES bitmask each frame by reading
 * keyboard state, Gamepad API, and HID device state.
 * Also provides gamepad snapshots for visualization.
 */

import type { SnesButton } from '@shared/types/controls';
import { SNES_BUTTON_BITS } from '@shared/types/controls';
import { webHidReader } from './hid-reader';
import type { AllowedDevices } from './profile-devices';

/** Gamepad snapshot matching the shape InputCalibration/InputTester need */
interface GamepadSnapshot {
  index: number;
  id: string;
  connected: boolean;
  mapping: string;
  timestamp: number;
  buttons: { pressed: boolean; touched: boolean; value: number }[];
  axes: number[];
}

/** OR a device's buttons + axes into the mask against the active profile's maps. */
const applyDeviceState = (mask: number, buttons: readonly boolean[], axes: readonly number[], gamepadButtonMap: Map<number, SnesButton>, gamepadAxisMap: Map<string, SnesButton>): number => {
  for (const [index, snesBtn] of gamepadButtonMap) {
    if (index < buttons.length && buttons[index]) {
      mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
    }
  }
  for (const [key, snesBtn] of gamepadAxisMap) {
    const [axisStr, dir] = key.split(':');
    const axisIndex = parseInt(axisStr, 10);
    if (axisIndex < axes.length) {
      const val = axes[axisIndex];
      const threshold = 0.5;
      if ((dir === '+' && val > threshold) || (dir === '-' && val < -threshold)) {
        mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
      }
    }
  }
  return mask;
};

const computeBitmask = (keyStates: Map<string, boolean>, keyboardMap: Map<string, SnesButton>, gamepadButtonMap: Map<number, SnesButton>, gamepadAxisMap: Map<string, SnesButton>, hidStates: Map<string, { buttons: boolean[]; axes: number[] }>, allowed: AllowedDevices, gamepadVidPid: Map<number, { vid: string; pid: string }>): number => {
  let mask = 0;

  // Keyboard — only when the active profile actually binds keyboard keys
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

  // Web Gamepad API (XInput controllers like Xbox) — only devices in the profile's map,
  // and only when not already served over HID (some HID pads can surface on both buses;
  // reading both would apply the HID-indexed maps to two differently-laid-out sources).
  for (const gp of navigator.getGamepads()) {
    if (!gp || !gp.connected) continue;
    const vp = gamepadVidPid.get(gp.index);
    const key = vp ? `${vp.vid}:${vp.pid}` : null;
    if (!key || !allowed.gamepadKeys.has(key) || hidStates.has(key)) continue;
    mask = applyDeviceState(mask, gp.buttons.map(b => b.pressed), gp.axes, gamepadButtonMap, gamepadAxisMap);
  }

  // HID input (Switch Pro, PlayStation, 8BitDo) — only devices in the profile's map
  for (const [deviceKey, state] of hidStates) {
    if (!allowed.gamepadKeys.has(deviceKey)) continue;
    mask = applyDeviceState(mask, state.buttons, state.axes, gamepadButtonMap, gamepadAxisMap);
  }

  return mask;
};

const snapshotGamepads = (): GamepadSnapshot[] => {
  const raw = navigator.getGamepads();
  const snaps: GamepadSnapshot[] = [];
  const hidIds = new Set(webHidReader.getConnectedDeviceKeys());
  for (const gp of raw) {
    if (!gp || !gp.connected) continue;
    const gpIdLower = gp.id.toLowerCase();
    let isDuplicate = false;
    for (const hidId of hidIds) {
      const [vid, pid] = hidId.split(':');
      if (gpIdLower.includes(`vendor: ${vid}`) && gpIdLower.includes(`product: ${pid}`)) {
        isDuplicate = true;
        break;
      }
    }
    if (isDuplicate) continue;
    snaps.push({
      index: gp.index,
      id: gp.id,
      connected: gp.connected,
      mapping: gp.mapping,
      timestamp: gp.timestamp,
      buttons: gp.buttons.map(b => ({ pressed: b.pressed, touched: b.touched, value: b.value })),
      axes: [...gp.axes],
    });
  }
  return snaps;
};

export { computeBitmask, snapshotGamepads };
export type { GamepadSnapshot };
