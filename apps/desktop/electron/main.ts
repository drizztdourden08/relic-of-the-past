/* @layer electron-main @kind logic */
import { VelopackApp } from 'velopack';
import { app, BrowserWindow, Menu, session, protocol, ipcMain } from 'electron';
import { is } from '@electron-toolkit/utils';

// Earliest main-process timestamp, for the opt-in --boot-timing diagnostic.
const BOOT_START = Date.now();
const BOOT_TIMING = process.argv.includes('--boot-timing');
const logBoot = (label: string): void => {
  if (BOOT_TIMING) console.log(`[boot-timing] ${label}: +${Date.now() - BOOT_START}ms`);
};

import { initPaths, ensureDataDirectories } from './lib/paths';
import { applyPortableMode } from './app/portable-mode';
import { applyUserDataArg } from './app/user-data-arg';
import { registerInstallSize } from './app/install-size-type';
import { applyInstanceIdentity, parseInstanceConfig } from './instance';
import { createWindow, getMainWindow, registerWindowHandlers, registerAspectRatioHandlers, setSplashStatus } from './window';
import { saveWindowState } from './window/window-state';
import { isEphemeralLaunch } from './window/startup-config';
import { registerDisplayHandlers } from './display/ipc-handlers';
import { onFullscreenChange, restoreOnShutdown } from './display/mode-switch';
import { registerDialogHandlers } from './dialogs/ipc-handlers';
import { registerProfileHandlers, migrateDataFolder } from './profiles';
import { registerRomHandlers } from './roms';
import { registerAssetHandlers } from './assets/ipc-handlers';
import { registerSaveHandlers } from './saves/ipc-handlers';
import { registerMsuHandlers } from './msu/ipc-handlers';
import { registerMsuEditHandlers } from './msu/edit-handlers';
import { registerMsuOptimizeHandlers } from './msu/optimize-handlers';
import { registerMsuResumeHandlers } from './msu/resume-handlers';
import { registerSpriteHandlers } from './sprites/ipc-handlers';
import { registerLanguageHandlers } from './languages/ipc-handlers';
import { registerSessionHandlers } from './sessions/ipc-handlers';
import { registerSpriteProtocol } from './protocol/sprite-protocol';
import { registerMsulOpenHandler } from './msu/open-file';
import { registerInputHandlers, stopInputHandlers } from './input';
import { registerTestHandlers } from './test/ipc-handlers';
import { registerDumpLayersHandler } from './debug/dump-layers-handler';
import { registerDumpNavHandler } from './debug/dump-nav-handler';
import { registerSimRunHandler } from './debug/sim-run-handler';
import { registerSimLogHandlers } from './debug/sim-log-handler';
import { registerConnectionHandlers } from './connections/ipc-handlers';
import { registerScreenEditorHandlers } from './screen-editor/ipc-handlers';
import { registerShadowCastingHandlers } from './shadow-casting';
import { registerUiViewsHandlers } from './ui-views';
import { registerReviewHandlers } from './review';
import { registerRecommendationHandlers } from './recommendations';
import { registerAppHandlers } from './app/ipc-handlers';
import { registerDiagnosticsHandlers } from './diagnostics/ipc-handlers';
import { registerWasmHandlers } from './wasm/ipc-handlers';
import { registerStorageHandlers } from './storage/ipc-handlers';
import { registerFileHandlers } from './storage/file-handlers';
import { initAutoUpdater, registerUpdaterHandlers } from './updater';
import { registerGithubHandlers } from './github/ipc-handlers';
import { registerFfmpegHandlers } from './tools/ipc-handlers';
import { emit } from './lib/ipc/handle';
import { installDevFileLogging } from './lib/dev-file-logger';
import { registerMsulAssociation, unregisterMsulAssociation } from './msu/msul-association';

// Velopack first: its install/update/uninstall hooks may restart the process, so
// nothing of ours may happen before it. The `.msul` document type rides on those
// hooks (registered after install and every update, removed before uninstall).
// Windows only; the other platforms get it from the package.
VelopackApp.build()
  .onAfterInstallFastCallback(registerMsulAssociation)
  .onAfterUpdateFastCallback(registerMsulAssociation)
  .onBeforeUninstallFastCallback(unregisterMsulAssociation)
  .run();

// Portable `data` folder first (every other location derives from userData), then
// --user-data, which outranks it.
const portableData = applyPortableMode();
const userDataOverride = applyUserDataArg();

// ipcMain.handle order is irrelevant. Wiring that needs the live BrowserWindow
// stays inline below after createWindow().
const IPC_HANDLERS: Array<{ register: () => void; devOnly?: boolean }> = [
  { register: registerWindowHandlers },
  { register: registerAspectRatioHandlers },
  { register: registerDisplayHandlers },
  { register: registerDialogHandlers },
  { register: registerProfileHandlers },
  { register: registerRomHandlers },
  { register: registerAssetHandlers },
  { register: registerSaveHandlers },
  { register: registerMsuHandlers },
  { register: registerMsuEditHandlers },
  { register: registerMsuOptimizeHandlers },
  { register: registerMsuResumeHandlers },
  { register: registerSpriteHandlers },
  { register: registerLanguageHandlers },
  { register: registerSessionHandlers },
  { register: registerTestHandlers },
  { register: registerDumpLayersHandler },
  { register: registerDumpNavHandler },
  { register: registerSimRunHandler },
  { register: registerSimLogHandlers },
  { register: registerConnectionHandlers },
  { register: registerUiViewsHandlers },
  { register: registerReviewHandlers },
  { register: registerRecommendationHandlers },
  // Writes to source files: never registered in a packaged build.
  { register: registerScreenEditorHandlers, devOnly: true },
  { register: registerShadowCastingHandlers },
  { register: registerUpdaterHandlers },
  { register: registerAppHandlers },
  { register: registerDiagnosticsHandlers },
  { register: registerWasmHandlers },
  { register: registerStorageHandlers },
  { register: registerFileHandlers },
  { register: registerGithubHandlers },
  { register: registerFfmpegHandlers },
];

// Same userData path in dev and production.
app.setName('relic-of-the-past');

// Must run before the first window exists. No-op on a normal launch.
applyInstanceIdentity(parseInstanceConfig().name);

protocol.registerSchemesAsPrivileged([
  { scheme: 'app-sprite', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

// Keep rAF alive when the window is occluded (e.g. --no-focus launches behind
// other windows), or Chromium pauses frames and stalls the headless game loop.
// Multiple --disable-features values must share ONE switch, comma-separated.
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

app.whenReady().then(async () => {
  // Register protocol handler
  registerSpriteProtocol();

  // In dev mode, clear HTTP cache so static asset changes are picked up immediately
  if (is.dev) {
    await session.defaultSession.clearCache();
  }

  // Initialize paths and data directories
  const dataPath = app.getPath('userData');
  if (portableData) console.log(`[portable] user data lives beside the app: ${portableData}`);
  if (userDataOverride) console.log(`[user-data] user data redirected by flag: ${userDataOverride}`);
  // Velopack writes the size in a type Windows ignores. Not awaited: it is cosmetic.
  if (!portableData) void registerInstallSize();
  initPaths(dataPath);
  await migrateDataFolder();
  await ensureDataDirectories();

  // Register all IPC handlers (see IPC_HANDLERS above)
  for (const { register, devOnly } of IPC_HANDLERS) {
    if (!devOnly || is.dev) register();
  }

  // Create the main window
  createWindow();

  const mainWindow = getMainWindow()!;

  // Dev-only: mirror console output to disk so a hard crash leaves a trace.
  if (is.dev) {
    await installDevFileLogging(mainWindow);
  }

  logBoot('window created');
  mainWindow.webContents.once('did-finish-load', () => {
    logBoot('renderer did-finish-load');
    setSplashStatus('Preparing interface...');
  });
  ipcMain.once('window:shellReady', () => logBoot('shell-ready (reveal)'));

  // Initialize auto-updater (handlers registered above)
  initAutoUpdater(mainWindow);

  // Forward renderer console to stdout when --dump-layers is active
  if (process.argv.some(a => a.startsWith('--dump-layers='))) {
    mainWindow.webContents.on('console-message', (event) => {
      console.log(`[renderer] ${event.message}`);
    });
  }

  // After initPaths: calibration/profile stores resolve paths via getUserDataPath.
  registerInputHandlers(mainWindow);

  // A .msul pack the app was launched with (file association) reaches the renderer's importer.
  registerMsulOpenHandler(mainWindow);

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
  mainWindow.on('maximize', () => emit(mainWindow, 'window:maximized', true));
  mainWindow.on('unmaximize', () => emit(mainWindow, 'window:maximized', false));
  // The synced-rate switch rides on these transitions, not renderer state, so the
  // display is handed back even if the window is closed straight out of fullscreen.
  mainWindow.on('enter-full-screen', () => {
    onFullscreenChange(true);
    emit(mainWindow, 'window:fullscreen', true);
  });
  mainWindow.on('leave-full-screen', () => {
    onFullscreenChange(false);
    emit(mainWindow, 'window:fullscreen', false);
  });

  // Test/automation launches (--window-size / --fresh) must not overwrite saved bounds.
  mainWindow.on('close', () => {
    if (!isEphemeralLaunch()) saveWindowState(mainWindow);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  stopInputHandlers();
  // Quitting from fullscreen must not leave the player's display on a rate they did not pick.
  restoreOnShutdown();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
