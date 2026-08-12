/* @layer test @kind test */
/**
 * Device gate — input from a controller only reaches the game when that device
 * appears in the active profile's map. A connected-but-unmapped pad is dropped.
 */

import { describe, it, expect } from 'vitest';
import type { InputProfile, ButtonMapping, SnesButton } from '@shared/types/controls';
import { SNES_BUTTON_BITS } from '@shared/types/controls';
import { allowedDevices } from '@app/lib/input/profile-devices';
import { computeBitmask } from '@app/lib/input/polling-engine';
import { ANY_DEVICE } from '@app/lib/input/device-scoped-map';

const gamepadBinding = (snes: SnesButton, index: number, vid: string, pid: string): ButtonMapping => ({
  snesButton: snes,
  binding: { type: 'gamepad-button', index },
  icon: null,
  sourceVid: vid,
  sourcePid: pid,
});

const makeProfile = (mappings: ButtonMapping[], assigned: InputProfile['assignedDevice']): InputProfile => ({
  id: 'p1', name: 'Test', deviceType: 'gamepad', deviceFamily: 'xbox',
  mappings, isDefault: false, assignedDevice: assigned, createdAt: 0, modifiedAt: 0,
});

describe('allowedDevices', () => {
  it('collects binding sources and the assigned device as vid:pid keys', () => {
    const profile = makeProfile(
      [gamepadBinding('A', 0, '045e', '02ff')],
      { vendorId: '045e', productId: '02ff', displayName: 'Xbox', deviceFamily: 'xbox' },
    );
    const allowed = allowedDevices(profile);
    expect(allowed.keyboard).toBe(false);
    expect([...allowed.gamepadKeys]).toEqual(['045e:02ff']);
  });

  it('flags keyboard when the map has a keyboard binding', () => {
    const profile = makeProfile(
      [{ snesButton: 'A', binding: { type: 'keyboard', code: 'KeyZ' }, icon: null }],
      null,
    );
    expect(allowedDevices(profile).keyboard).toBe(true);
  });
});

describe('computeBitmask device gate', () => {
  // Source-less binding (no owning device recorded) — applies to every gamepad.
  const gamepadButtonMap = new Map([[ANY_DEVICE, new Map<number, SnesButton>([[0, 'A']])]]);
  const empty = new Map();

  it('passes input from a device in the active profile map', () => {
    const allowed = { keyboard: false, gamepadKeys: new Set(['057e:2009']) };
    const hidStates = new Map([['057e:2009', { buttons: [true], axes: [] }]]);
    const mask = computeBitmask(empty, empty, gamepadButtonMap, empty, hidStates, allowed);
    expect(mask).toBe(1 << SNES_BUTTON_BITS.A);
  });

  it('drops input from a connected device that is NOT in the map', () => {
    const allowed = { keyboard: false, gamepadKeys: new Set(['045e:02ff']) };
    const hidStates = new Map([['057e:2009', { buttons: [true], axes: [] }]]);
    const mask = computeBitmask(empty, empty, gamepadButtonMap, empty, hidStates, allowed);
    expect(mask).toBe(0);
  });

  it('ignores keyboard input when the profile has no keyboard bindings', () => {
    const allowed = { keyboard: false, gamepadKeys: new Set<string>() };
    const keyStates = new Map([['KeyZ', true]]);
    const keyboardMap = new Map<string, SnesButton>([['KeyZ', 'A']]);
    const mask = computeBitmask(keyStates, keyboardMap, empty, empty, new Map(), allowed);
    expect(mask).toBe(0);
  });
});
