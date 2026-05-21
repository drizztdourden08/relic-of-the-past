import { app, BrowserWindow, Menu, session, protocol } from 'electron';
import { is } from '@electron-toolkit/utils';

import { initPaths, ensureDataDirectories } from './lib/paths';
import { createWindow, getMainWindow, registerWindowHandlers, registerAspectRatioHandlers } from './window';
import { saveWindowState } from './window/window-state';
import { registerDialogHandlers } from './dialogs/ipc-handlers';
import { registerProfileHandlers, migrateDataFolder } from './profiles';
import { registerRomHandlers } from './roms';
import { registerAssetHandlers } from './assets/ipc-handlers';
import { registerSaveHandlers } from './saves/ipc-handlers';
import { registerMsuHandlers } from './msu/ipc-handlers';
import { registerSpriteHandlers } from './sprites/ipc-handlers';
import { registerLanguageHandlers } from './languages/ipc-handlers';
import { registerSessionHandlers } from './sessions/ipc-handlers';
import { registerSpriteProtocol } from './protocol/sprite-protocol';
import { registerInputHandlers, stopInputHandlers, initCalibrationStore, initProfileStore } from './input';
import { registerTestHandlers } from './test/ipc-handlers';
import { registerConnectionHandlers } from './connections/ipc-handlers';
import { ipcMain } from 'electron';
import { extractAllItemSprites } from '../../../shared/asset-extraction/item-sprites/extract-items';
import spriteDefinitions from '../../../shared/game/sprites/definitions.json';
import { loadRom } from '../../../shared/asset-extraction/rom/rom-loader';
import { compileResources } from '../../../shared/asset-extraction/compile-resources';
import { decodeStrings, formatDialogueText } from '../../../shared/asset-extraction/text/dialogue-decoder';

// Ensure consistent userData path across dev and production
app.setName('relic-of-the-past');

// Register custom protocol for serving sprite images from userData
protocol.registerSchemesAsPrivileged([
  { scheme: 'app-sprite', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

// Allow gamepad enumeration without requiring a button press first
app.commandLine.appendSwitch('disable-features', 'RestrictGamepadAccess');

app.whenReady().then(async () => {
  // Register protocol handler
  registerSpriteProtocol();

  // In dev mode, clear HTTP cache so static asset changes are picked up immediately
  if (is.dev) {
    await session.defaultSession.clearCache();
  }

  // Initialize paths and data directories
  const dataPath = app.getPath('userData');
  initPaths(dataPath);
  await migrateDataFolder();
  await ensureDataDirectories();

  // Register all IPC handlers
  registerWindowHandlers();
  registerAspectRatioHandlers();
  registerDialogHandlers();
  registerProfileHandlers();
  registerRomHandlers();
  registerAssetHandlers();
  registerSaveHandlers();
  registerMsuHandlers();
  registerSpriteHandlers();
  registerLanguageHandlers();
  registerSessionHandlers();
  registerTestHandlers();
  registerConnectionHandlers();

  // App info handler
  ipcMain.handle('app:getUserDataPath', () => app.getPath('userData'));

  // Create the main window
  createWindow();

  const mainWindow = getMainWindow()!;

  // Initialize input subsystem (HID, USB, calibration, profiles)
  initCalibrationStore(dataPath);
  initProfileStore(dataPath);
  registerInputHandlers(mainWindow);

  // Set up application menu for clipboard shortcuts only (debug items moved to in-app Advanced menu)
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
  ]));

  // Forward window state events to renderer
  mainWindow.on('maximize', () => mainWindow.webContents.send('window:maximized', true));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window:maximized', false));
  mainWindow.on('enter-full-screen', () => mainWindow.webContents.send('window:fullscreen', true));
  mainWindow.on('leave-full-screen', () => mainWindow.webContents.send('window:fullscreen', false));

  // Persist window size/position/mode on close
  mainWindow.on('close', () => {
    saveWindowState(mainWindow);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  stopInputHandlers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
