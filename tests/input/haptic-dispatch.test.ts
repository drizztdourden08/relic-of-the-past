/* @layer tests @kind test */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { HapticSettings } from '@shared/types/settings';
import { HapticEventType } from '@shared/input/haptics';

// In-game haptics must reach BOTH controller buses: node-hid pads (Switch Pro, DualSense, 8BitDo)
// and Gamepad-API/XInput pads (Xbox), which rumble through the vibrationActuator and never appear
// on the HID bus. Regression guard for the Xbox case where sendToController only looked at HID.

const h = vi.hoisted(() => ({
  hidKeys: [] as string[],
  gamepads: [] as unknown[],
  vibrateGamepadPattern: vi.fn(),
  hidVibrate: vi.fn(),
}));

vi.mock('../../apps/web/src/lib/input/hid-reader', () => ({
  webHidReader: { getConnectedDeviceKeys: () => h.hidKeys },
}));
vi.mock('../../apps/web/src/lib/input/vibration', () => ({
  vibrateGamepadPattern: h.vibrateGamepadPattern,
}));
vi.mock('../../apps/web/src/lib/input/controllers-store', () => ({
  vibratePattern: h.hidVibrate,
}));
vi.mock('@app/platform/get-platform', () => ({
  getPlatform: () => ({ device: { vibrate: () => {} } }),
}));

import { initHapticBridge, destroyHapticBridge } from '../../apps/web/src/lib/input/haptic-bridge';

const settings = (): HapticSettings => ({
  enabled: true, intensity: 100,
  swordSwing: true, swordHitEnemy: true, swordClink: true, damageTaken: true,
  itemUse: true, dashVibration: true, environmentalEffects: true,
});

const xboxPad = (over: Record<string, unknown> = {}): unknown => ({
  index: 0, id: 'Xbox 360 Controller (XInput STANDARD GAMEPAD)', connected: true,
  mapping: 'standard', buttons: [], axes: [],
  vibrationActuator: { playEffect: () => {} },
  ...over,
});

const swing = () => (globalThis as unknown as { window: { __onHapticEvent: (t: number, p: number) => void } })
  .window.__onHapticEvent(HapticEventType.SWORD_SWING, 0);

beforeEach(() => {
  h.hidKeys = [];
  h.gamepads = [];
  h.vibrateGamepadPattern.mockClear();
  h.hidVibrate.mockClear();
  vi.stubGlobal('window', {});
  vi.stubGlobal('navigator', { getGamepads: () => h.gamepads });
  destroyHapticBridge(); // reset module state (mixer + __onHapticEvent) between cases
  initHapticBridge(settings());
});

describe('haptic dispatch — Gamepad API (Xbox/XInput)', () => {
  it('rumbles an Xbox pad that is present only on the Gamepad API', () => {
    h.gamepads = [xboxPad()];
    swing();
    expect(h.vibrateGamepadPattern).toHaveBeenCalledTimes(1);
    expect(h.vibrateGamepadPattern.mock.calls[0][0]).toBe(0); // gp.index
    // Sword-swing authored at 0.35; Xbox shaping boosts the magnitude before dispatch.
    const shaped = h.vibrateGamepadPattern.mock.calls[0][1] as { intensity: number }[];
    expect(shaped[0].intensity).toBeCloseTo(0.5975, 3);
    expect(h.hidVibrate).not.toHaveBeenCalled();
  });

  it('skips a pad with no vibrationActuator', () => {
    h.gamepads = [xboxPad({ vibrationActuator: undefined })];
    swing();
    expect(h.vibrateGamepadPattern).not.toHaveBeenCalled();
  });

  it('does not double-buzz a pad already served over node-hid', () => {
    // Same physical pad on both buses: HID key + a Gamepad-API entry whose id embeds the vid/pid.
    h.hidKeys = ['045e:028e'];
    h.gamepads = [xboxPad({ id: 'xbox controller (Vendor: 045e Product: 028e)' })];
    swing();
    expect(h.vibrateGamepadPattern).not.toHaveBeenCalled(); // deduped away from the gamepad bus
  });
});
