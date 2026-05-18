/**
 * Polling Engine — computes the SNES bitmask each frame by reading
 * keyboard state, Gamepad API, and HID device state.
 * Also provides gamepad snapshots for visualization.
 */

import type { SnesButton } from '@shared/types/controls';
import { SNES_BUTTON_BITS } from '@shared/types/controls';
import { webHidReader } from './hid-reader';

/** Gamepad snapshot matching the shape InputCalibration/InputTester need */
export interface GamepadSnapshot {
  index: number;
  id: string;
  connected: boolean;
  mapping: string;
  timestamp: number;
  buttons: { pressed: boolean; touched: boolean; value: number }[];
  axes: number[];
}

/**
 * Compute the SNES bitmask from all input sources for this frame.
 */
export function computeBitmask(
  keyStates: Map<string, boolean>,
  keyboardMap: Map<string, SnesButton>,
  gamepadButtonMap: Map<number, SnesButton>,
  gamepadAxisMap: Map<string, SnesButton>,
  hidStates: Map<string, { buttons: boolean[]; axes: number[] }>,
): number {
  let mask = 0;

  // Keyboard
  for (const [code, pressed] of keyStates) {
    if (pressed) {
      const btn = keyboardMap.get(code);
      if (btn !== undefined) {
        mask |= (1 << SNES_BUTTON_BITS[btn]);
      }
    }
  }

  // Web Gamepad API (XInput controllers like Xbox)
  const gamepads = navigator.getGamepads();
  const hidIds = new Set(webHidReader.getConnectedDeviceKeys());
  for (const gp of gamepads) {
    if (!gp || !gp.connected) continue;

    // Skip gamepad if already handled by node-hid
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

    // Buttons
    for (const [index, snesBtn] of gamepadButtonMap) {
      if (index < gp.buttons.length && gp.buttons[index].pressed) {
        mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
      }
    }

    // Axes
    for (const [key, snesBtn] of gamepadAxisMap) {
      const [axisStr, dir] = key.split(':');
      const axisIndex = parseInt(axisStr, 10);
      if (axisIndex < gp.axes.length) {
        const val = gp.axes[axisIndex];
        const threshold = 0.5;
        if ((dir === '+' && val > threshold) || (dir === '-' && val < -threshold)) {
          mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
        }
      }
    }
  }

  // HID input (Switch Pro, PlayStation, 8BitDo)
  for (const [, state] of hidStates) {
    for (const [index, snesBtn] of gamepadButtonMap) {
      if (index < state.buttons.length && state.buttons[index]) {
        mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
      }
    }

    for (const [key, snesBtn] of gamepadAxisMap) {
      const [axisStr, dir] = key.split(':');
      const axisIndex = parseInt(axisStr, 10);
      if (axisIndex < state.axes.length) {
        const val = state.axes[axisIndex];
        const threshold = 0.5;
        if ((dir === '+' && val > threshold) || (dir === '-' && val < -threshold)) {
          mask |= (1 << SNES_BUTTON_BITS[snesBtn]);
        }
      }
    }
  }

  return mask;
}

/**
 * Snapshot all connected gamepads, filtering out those already handled by WebHID.
 */
export function snapshotGamepads(): GamepadSnapshot[] {
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
}
