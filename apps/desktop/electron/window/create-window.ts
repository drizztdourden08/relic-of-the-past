import { BrowserWindow } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';

let mainWindow: BrowserWindow | null = null;

function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

function createWindow(): BrowserWindow {
  const noFocus = process.argv.includes('--no-focus');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 360,
    minHeight: 280,
    frame: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    title: 'Relic of the Past',
    icon: is.dev
      ? join(__dirname, '../../apps/desktop/public/logos/logo-256.png')
      : join(__dirname, '../renderer/logos/logo-256.png'),
    backgroundColor: '#000000',
    show: !noFocus,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (noFocus) {
    mainWindow.showInactive();
  }

  // Let F1-F12 (and Tab) pass through to the renderer instead of being
  // consumed by Electron menu accelerators.
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.type === 'keyDown' && (
      /^F([1-9]|1[0-2])$/.test(input.key) ||
      input.key === 'Tab'
    )) {
      mainWindow!.webContents.setIgnoreMenuShortcuts(true);
    } else {
      mainWindow!.webContents.setIgnoreMenuShortcuts(false);
    }
  });

  // Allow gamepad and other device permissions for the renderer
  mainWindow.webContents.session.setPermissionCheckHandler(() => true);
  mainWindow.webContents.session.setPermissionRequestHandler((_wc, _perm, callback) => {
    callback(true);
  });

  if (process.argv.includes('--muted')) {
    mainWindow.webContents.setAudioMuted(true);
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const { shell } = require('electron');
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
}

export { createWindow, getMainWindow };
