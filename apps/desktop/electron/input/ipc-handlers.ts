/**
 * Input IPC handlers — registers all input-related IPC handlers on the main process.
 */

import { ipcMain, type BrowserWindow } from 'electron';
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

/**
 * Register all input-related IPC handlers and set up device permissions.
 * Call once after the main window is created.
 */
export function registerInputHandlers(mainWindow: BrowserWindow): void {
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

  ipcMain.handle('inputProfiles:read', async (_event, profileId: string) => {
    return readInputProfiles(profileId);
  });

  ipcMain.handle('inputProfiles:write', async (_event, profileId: string, profiles: unknown[]) => {
    await writeInputProfiles(profileId, profiles);
  });

  // ── Calibration handlers ──

  ipcMain.handle('stickCalibration:read', async () => {
    return readStickCalibration();
  });

  ipcMain.handle('stickCalibration:write', async (_event, store: Record<string, unknown>) => {
    await writeStickCalibration(store as StickCalibrationStore);
  });

  ipcMain.handle('triggerCalibration:read', async () => {
    return readTriggerCalibration();
  });

  ipcMain.handle('triggerCalibration:write', async (_event, deviceKey: string, axisIndex: number, cal: { base: number; max: number; deadzone: number }) => {
    await writeTriggerCalibration(deviceKey, axisIndex, cal);
  });

  // ── HID device handlers ──

  ipcMain.handle('hid:enumerate', async () => {
    try {
      const rawDevices = await hidInputReader.enumerateDevicesAsync();
      return enumerateControllers(rawDevices);
    } catch {
      return enumerateControllers();
    }
  });

  ipcMain.handle('hid:get-open-keys', () => {
    return hidInputReader.getOpenDeviceKeys();
  });

  ipcMain.handle('hid:write', (_event, deviceKey: string, data: number[]) => {
    return hidInputReader.write(deviceKey, data);
  });

  ipcMain.handle('hid:vibrate', (_event, deviceKey: string, durationMs: number, intensity: number) => {
    return hidInputReader.vibrate(deviceKey, durationMs, intensity);
  });

  ipcMain.handle('hid:vibrate-pattern', (_event, deviceKey: string, pattern: { durationMs: number; intensity: number }[], gapMs: number) => {
    return hidInputReader.vibratePattern(deviceKey, pattern, gapMs);
  });

  // ── Start HID reader ──

  hidInputReader.start(mainWindow);
}

/**
 * Stop input subsystem. Call on app quit.
 */
export function stopInputHandlers(): void {
  hidInputReader.stop();
}
