/* @layer test @kind test */
/** Disconnect pause: the game pauses when ANY device in the active profile's map goes missing, not just the assigned one. */

import { describe, it, expect } from 'vitest';
import type { InputProfile, ButtonMapping, DetectedDevice, AssignedDevice } from '@shared/types/controls';
import { PauseManager } from '@app/lib/input/pause-manager';

const padBinding = (vid: string, pid: string, index: number): ButtonMapping => ({
  snesButton: 'A', binding: { type: 'gamepad-button', index }, icon: null, sourceVid: vid, sourcePid: pid,
});

const assigned = (vid: string, pid: string, name: string): AssignedDevice => ({
  vendorId: vid, productId: pid, displayName: name, deviceFamily: 'xbox',
});

const profile = (mappings: ButtonMapping[], assignedDevice: AssignedDevice | null): InputProfile => ({
  id: 'p', name: 'P', deviceType: 'gamepad', deviceFamily: 'xbox',
  mappings, isDefault: false, assignedDevice, createdAt: 0, modifiedAt: 0,
});

const device = (vid: string, pid: string, name: string): DetectedDevice => ({
  id: `hid-${vid}-${pid}`, type: 'gamepad', rawId: name, vendorId: vid, productId: pid,
  deviceFamily: 'generic', displayName: name, sdlType: null, connected: false,
  activated: false, stale: false, brandLogoKey: null, inputApi: 'hid',
  hasRumble: false, hasGyro: false,
});

const makePM = () => {
  const pm = new PauseManager();
  const events: { paused: boolean; name: string }[] = [];
  pm.onPause = () => {};
  pm.subscribe((paused, name) => events.push({ paused, name }));
  return { pm, events };
};

describe('PauseManager.checkControllerDisconnect', () => {
  it('pauses when a mapped device is missing, naming it', () => {
    const { pm, events } = makePM();
    const p = profile([padBinding('045e', '02ff', 0)], assigned('057e', '2009', 'Switch Pro'));
    const connected = new Set(['045e:02ff']); // the Switch (057e:2009) is gone
    pm.checkControllerDisconnect(p, connected, [device('057e', '2009', 'Switch Pro')]);
    expect(pm.isPaused).toBe(true);
    expect(events.at(-1)).toEqual({ paused: true, name: 'Switch Pro' });
  });

  it('does not pause while every mapped device is still connected', () => {
    const { pm } = makePM();
    const p = profile([padBinding('045e', '02ff', 0)], assigned('057e', '2009', 'Switch Pro'));
    pm.checkControllerDisconnect(p, new Set(['045e:02ff', '057e:2009']), []);
    expect(pm.isPaused).toBe(false);
  });

  it('ignores a keyboard-only profile (nothing to disconnect)', () => {
    const { pm } = makePM();
    const p = profile([{ snesButton: 'A', binding: { type: 'keyboard', code: 'KeyZ' }, icon: null }], null);
    pm.checkControllerDisconnect(p, new Set(), []);
    expect(pm.isPaused).toBe(false);
  });

  it('is a no-op when already paused', () => {
    const { pm, events } = makePM();
    pm.togglePause(); // manual pause
    const before = events.length;
    pm.checkControllerDisconnect(profile([padBinding('045e', '02ff', 0)], null), new Set(), []);
    expect(events.length).toBe(before);
  });
});

describe('PauseManager.resumeIfPresent', () => {
  const p = () => profile([padBinding('045e', '02ff', 0)], assigned('057e', '2009', 'Switch Pro'));

  it('resumes once every mapped device is reconnected', () => {
    const { pm, events } = makePM();
    pm.checkControllerDisconnect(p(), new Set(['045e:02ff']), [device('057e', '2009', 'Switch Pro')]);
    expect(pm.isPaused).toBe(true);
    pm.resumeIfPresent(p(), new Set(['045e:02ff', '057e:2009']));
    expect(pm.isPaused).toBe(false);
    expect(events.at(-1)).toEqual({ paused: false, name: '' });
  });

  it('does not resume while a mapped device is still missing (a wrong controller connects)', () => {
    const { pm } = makePM();
    pm.checkControllerDisconnect(p(), new Set(), [device('057e', '2009', 'Switch Pro')]);
    pm.resumeIfPresent(p(), new Set(['1234:5678'])); // unrelated pad
    expect(pm.isPaused).toBe(true);
  });

  it('never auto-resumes a manual pause', () => {
    const { pm } = makePM();
    pm.togglePause();
    pm.resumeIfPresent(profile([padBinding('045e', '02ff', 0)], null), new Set(['045e:02ff']));
    expect(pm.isPaused).toBe(true);
  });
});

describe('PauseManager.reevaluateForProfile (profile switch)', () => {
  it('pauses when the newly-selected profile\'s controller is absent', () => {
    const { pm, events } = makePM();
    const p = profile([padBinding('057e', '2009', 0)], assigned('057e', '2009', 'Switch Pro'));
    pm.reevaluateForProfile(p, new Set(['1234:5678']), [device('057e', '2009', 'Switch Pro')]);
    expect(pm.isPaused).toBe(true);
    expect(events.at(-1)).toEqual({ paused: true, name: 'Switch Pro' });
  });

  it('resumes when switching to a profile whose controller is present', () => {
    const { pm } = makePM();
    const gone = profile([padBinding('045e', '02ff', 0)], assigned('057e', '2009', 'Switch Pro'));
    pm.checkControllerDisconnect(gone, new Set(), [device('057e', '2009', 'Switch Pro')]);
    expect(pm.isPaused).toBe(true);
    const kbd = profile([{ snesButton: 'A', binding: { type: 'keyboard', code: 'KeyZ' }, icon: null }], null);
    pm.reevaluateForProfile(kbd, new Set(), []); // keyboard profile has no mapped pads
    expect(pm.isPaused).toBe(false);
  });

  it('leaves a manual pause alone', () => {
    const { pm } = makePM();
    pm.togglePause();
    pm.reevaluateForProfile(profile([padBinding('045e', '02ff', 0)], null), new Set(), []);
    expect(pm.isPaused).toBe(true);
    expect(pm.controllerName).toBe('Manual pause');
  });
});
