/* @layer electron-main @kind logic */
/**
 * Input IPC handlers — registers all input-related IPC handlers on the main process.
 */

import type { BrowserWindow } from 'electron';
import { handle } from '../lib/ipc/handle';
import { hidInputReader } from './hid-reader';
import { enumerateControllers } from './hid-devices';
import { readInputProfiles, writeInputProfiles } from './profile-store';
import {
  readStickCalibration,
  writeStickCalibration,
  readTriggerCalibration,
  writeTriggerCalibration,
  type StickCalibrationStore,
} from './calibration-store';

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

  // ── HID device handlers ──

  handle('hid:enumerate', async () => {
    try {
      const rawDevices = await hidInputReader.enumerateDevicesAsync();
      return enumerateControllers(rawDevices);
    } catch {
      return enumerateControllers();
    }
  });

  handle('hid:get-open-keys', () => {
    return hidInputReader.getOpenDeviceKeys();
  });

  handle('hid:write', (_event, deviceKey: string, data: number[]) => {
    return hidInputReader.write(deviceKey, data);
  });

  handle('hid:vibrate', (_event, deviceKey: string, durationMs: number, intensity: number) => {
    return hidInputReader.vibrate(deviceKey, durationMs, intensity);
  });

  handle('hid:vibrate-pattern', (_event, deviceKey: string, pattern: { durationMs: number; intensity: number }[], gapMs: number) => {
    return hidInputReader.vibratePattern(deviceKey, pattern, gapMs);
  });

  // ── Start HID reader ──

  hidInputReader.start(mainWindow);
};

const stopInputHandlers = (): void => {
  hidInputReader.stop();
};

export { registerInputHandlers, stopInputHandlers };
