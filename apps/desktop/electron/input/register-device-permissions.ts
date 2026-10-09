/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { NINTENDO_VENDOR_ID } from './device-permissions.constants';

const registerDevicePermissions = (mainWindow: BrowserWindow): void => {
  const { session } = mainWindow.webContents;

  session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    callback(details.deviceList[0]?.deviceId ?? '');
  });

  session.on('select-usb-device', (event, details, callback) => {
    event.preventDefault();
    const device = details.deviceList.find((d) => d.vendorId === NINTENDO_VENDOR_ID) ?? details.deviceList[0];
    if (device) callback(device.deviceId);
    else callback();
  });

  session.setDevicePermissionHandler(() => true);
};

export { registerDevicePermissions };
