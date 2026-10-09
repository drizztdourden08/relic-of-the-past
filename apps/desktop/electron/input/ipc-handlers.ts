/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { handle, getUserDataPath, writeJsonFile } from '@drizztdourden08/brock-electron/main';
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
import { NINTENDO_VENDOR_ID } from './ipc-handlers.constants';

const sanitizeFileStem = (name: string): string => name.replace(/[^A-Za-z0-9_-]/g, '_');

const registerDevicePermissions = (mainWindow: BrowserWindow): void => {
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
      (d) => d.vendorId === NINTENDO_VENDOR_ID
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
};

const registerProfileAndCalibrationHandlers = (): void => {
  handle('inputProfiles:read', (_event, profileId: string) => readInputProfiles(profileId));

  handle('inputProfiles:write', (_event, profileId: string, profiles: unknown[]) =>
    writeInputProfiles(profileId, profiles));

  handle('stickCalibration:read', () => readStickCalibration());

  handle('stickCalibration:write', (_event, store: Record<string, unknown>) =>
    writeStickCalibration(store as StickCalibrationStore));

  handle('triggerCalibration:read', () => readTriggerCalibration());

  handle('triggerCalibration:write', (_event, deviceKey: string, axisIndex: number, cal: { base: number; max: number; deadzone: number }) =>
    writeTriggerCalibration(deviceKey, axisIndex, cal));
};

const registerControllerHandlers = (): void => {
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
    await writeJsonFile(filePath, data);
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
};

const registerInputHandlers = (mainWindow: BrowserWindow): void => {
  registerDevicePermissions(mainWindow);
  registerProfileAndCalibrationHandlers();
  registerControllerHandlers();
  loadMappingDatabases();
  sdl3Source.start(mainWindow);
};

export { registerInputHandlers };
