/* @layer electron-main @kind logic */
/**
 * Registers the input IPC handlers on the main process.
 */

import type { BrowserWindow } from 'electron';
import { handle } from '../lib/ipc/handle';
import { getUserDataPath } from '../lib/paths';
import { writeJson } from '../lib/json-store';
import { readInputProfiles, writeInputProfiles } from './profile-store';
import {
  readStickCalibration,
  writeStickCalibration,
  readTriggerCalibration,
  writeTriggerCalibration,
  type StickCalibrationStore,
} from './calibration-store';
import { sdl3Source } from './sdl3-source';
import * as sdl3 from './native/sdl3';
import { listDevices } from './device-lister';
import { hapticPatternPlayer } from './haptic-pattern-player';
import { loadMappingDatabases, addUserMapping } from './mapping-db';

// Strips anything outside [A-Za-z0-9_-] so a device-supplied name can never
// contain a path separator, '..', or a drive letter.
const sanitizeFileStem = (name: string): string => name.replace(/[^A-Za-z0-9_-]/g, '_');

const registerInputHandlers = (mainWindow: BrowserWindow): void => {
  // ── Device permission handlers ──

  mainWindow.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    if (details.deviceList.length > 0) {
      callback(details.deviceList[0].deviceId);
    } else {
      callback('');
    }
  });

  mainWindow.webContents.session.on('select-usb-device', (event, details, callback) => {
    event.preventDefault();
    const device = details.deviceList.find(
      (d) => d.vendorId === 0x057E
    );
    if (device) {
      callback(device.deviceId);
    } else if (details.deviceList.length > 0) {
      callback(details.deviceList[0].deviceId);
    } else {
      callback();
    }
  });

  mainWindow.webContents.session.setDevicePermissionHandler((_details) => {
    return true;
  });

  // ── Input profile handlers ──

  handle('inputProfiles:read', (_event, profileId: string) => readInputProfiles(profileId));

  handle('inputProfiles:write', (_event, profileId: string, profiles: unknown[]) =>
    writeInputProfiles(profileId, profiles));

  // ── Calibration handlers ──

  handle('stickCalibration:read', () => readStickCalibration());

  handle('stickCalibration:write', (_event, store: Record<string, unknown>) =>
    writeStickCalibration(store as StickCalibrationStore));

  handle('triggerCalibration:read', () => readTriggerCalibration());

  handle('triggerCalibration:write', (_event, deviceKey: string, axisIndex: number, cal: { base: number; max: number; deadzone: number }) =>
    writeTriggerCalibration(deviceKey, axisIndex, cal));

  // ── Controller (SDL3 native transport) handlers ──

  handle('controller:list', () => sdl3Source.listSnapshot());

  handle('controller:list-hid-devices', () => listDevices());

  handle('controller:rescan', () => {
    sdl3Source.rescan();
  });

  handle('controller:rumble', (_event, deviceKey: string, low: number, high: number, durationMs: number) =>
    sdl3Source.rumble(deviceKey, low, high, durationMs));

  handle('controller:vibrate-pattern', (_event, deviceKey: string, pattern: { durationMs: number; intensity: number }[], gapMs: number) =>
    hapticPatternPlayer.play(deviceKey, pattern, gapMs));

  handle('controller:add-mapping', (_event, mapping: string) => addUserMapping(mapping));

  handle('controller:write-debug-capture', async (_event, name: string, data: unknown) => {
    const filename = `${sanitizeFileStem(name)}-${Date.now()}.json`;
    const filePath = getUserDataPath('debug', filename);
    await writeJson(filePath, data);
    return filePath;
  });

  handle('controller:start-raw-capture', (_event, vendorId: number, productId: number) =>
    sdl3Source.startRawCapture(vendorId, productId));

  handle('controller:stop-raw-capture', () => {
    sdl3Source.stopRawCapture();
  });

  handle('controller:start-joystick-capture', (_event, joystickId: number) =>
    sdl3Source.startJoystickCapture(joystickId));

  handle('controller:stop-joystick-capture', () => {
    sdl3Source.stopJoystickCapture();
  });

  handle('controller:list-joysticks', () => sdl3Source.listJoysticks());

  handle('controller:mapping-for-guid', (_event, guid: string) => sdl3Source.mappingForGuid(guid));

  handle('controller:sdl-version', () => sdl3.version());

  handle('controller:release-hold', () => sdl3Source.releaseHold());

  handle('controller:restore-hold', () => sdl3Source.restoreHold());

  // ── Start SDL3 transport + mapping db ──

  loadMappingDatabases();
  sdl3Source.start(mainWindow);
};

const stopInputHandlers = (): void => {
  sdl3Source.stop();
};

export { registerInputHandlers, stopInputHandlers };
