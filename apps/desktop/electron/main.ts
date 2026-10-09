/* @layer electron-main @kind logic */
import { app, BrowserWindow, session, protocol, ipcMain } from 'electron';
import { is } from '@electron-toolkit/utils';
import { initPaths, ensureDataDirectories } from './lib/paths';
import { applyPortableMode } from './app/portable-mode';
import { applyUserDataArg } from './app/user-data-arg';
import { registerInstallSize } from './app/install-size-type';
import { applyInstanceIdentity, parseInstanceConfig } from './instance';
import { createWindow, getMainWindow, setSplashStatus } from './window';
import { registerIpcHandlers } from './startup/register-ipc-handlers';
import { restoreOnShutdown } from './display/mode-switch';
import { registerSpriteProtocol } from './protocol/sprite-protocol';
import { registerDebugCaptureProtocol } from './protocol/debug-capture-protocol';
import { registerMsulOpenHandler } from './msu/open-file';
import { registerInputHandlers, stopInputHandlers } from './input';
import { rotateSessionLog } from './debug/session-log-handler';
import { initAutoUpdater } from './updater';
import { loadVelopack } from './updater/velopack-loader';
import { installDevFileLogging } from './lib/dev-file-logger';
import { installCrashForensics } from './diagnostics/crash-forensics';
import { registerDocumentAssociations, unregisterDocumentAssociations } from './documents/document-associations';
import { bootStoreLinks, listenForOpenUrl, quitIfHandedOff } from './store/boot';
import { installEditMenu } from './startup/install-edit-menu';
import { forwardWindowEvents } from './startup/forward-window-events';

const bootStart = Date.now();
const bootTimingEnabled = process.argv.includes('--boot-timing');
const logBoot = (label: string): void => {
  if (bootTimingEnabled) console.log(`[boot-timing] ${label}: +${Date.now() - bootStart}ms`);
};

const runVelopackHooksFirst = (): void => {
  loadVelopack()?.VelopackApp.build()
    .onAfterInstallFastCallback(registerDocumentAssociations)
    .onAfterUpdateFastCallback(registerDocumentAssociations)
    .onBeforeUninstallFastCallback(unregisterDocumentAssociations)
    .run();
};

runVelopackHooksFirst();

const portableData = applyPortableMode();
const userDataOverride = applyUserDataArg();

app.setName('relic-of-the-past');

installCrashForensics();

applyInstanceIdentity(parseInstanceConfig().name);

protocol.registerSchemesAsPrivileged([
  { scheme: 'app-sprite', privileges: { standard: true, secure: true, supportFetchAPI: true } },
  { scheme: 'app-debug-capture', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

listenForOpenUrl();

const prepareUserData = async (): Promise<void> => {
  const dataPath = app.getPath('userData');
  if (portableData) console.log(`[portable] user data lives beside the app: ${portableData}`);
  if (userDataOverride) console.log(`[user-data] user data redirected by flag: ${userDataOverride}`);
  if (!portableData) void registerInstallSize();
  initPaths(dataPath);
  await ensureDataDirectories();
  await rotateSessionLog();
};

const traceBoot = (mainWindow: BrowserWindow): void => {
  logBoot('window created');
  mainWindow.webContents.once('did-finish-load', () => {
    logBoot('renderer did-finish-load');
    setSplashStatus('Preparing interface...');
  });
  ipcMain.once('window:shellReady', () => logBoot('shell-ready (reveal)'));
};

const forwardRendererConsoleForDumpLayers = (mainWindow: BrowserWindow): void => {
  if (process.argv.some(a => a.startsWith('--dump-layers='))) {
    mainWindow.webContents.on('console-message', (event) => {
      console.log(`[renderer] ${event.message}`);
    });
  }
};

app.whenReady().then(async () => {
  if (await quitIfHandedOff()) return;

  registerSpriteProtocol();
  registerDebugCaptureProtocol();

  if (is.dev) {
    await session.defaultSession.clearCache();
  }

  await prepareUserData();

  registerIpcHandlers();

  createWindow();

  const mainWindow = getMainWindow()!;

  if (is.dev) {
    await installDevFileLogging(mainWindow);
  }

  traceBoot(mainWindow);

  initAutoUpdater(mainWindow);

  forwardRendererConsoleForDumpLayers(mainWindow);

  registerInputHandlers(mainWindow);

  registerMsulOpenHandler(mainWindow);
  bootStoreLinks(mainWindow);

  installEditMenu();

  forwardWindowEvents(mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  stopInputHandlers();
  restoreOnShutdown();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
