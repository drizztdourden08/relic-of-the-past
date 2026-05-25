import { autoUpdater } from 'electron-updater';
import { ipcMain, BrowserWindow } from 'electron';
import { is } from '@electron-toolkit/utils';

export interface UpdateInfo {
  version: string;
  releaseNotes: string;
  releaseDate: string;
}

let updateAvailable: UpdateInfo | null = null;

export function initAutoUpdater(mainWindow: BrowserWindow): void {
  // Don't check for updates in dev mode
  if (is.dev) return;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('update-available', (info) => {
    const notes = typeof info.releaseNotes === 'string'
      ? info.releaseNotes
      : Array.isArray(info.releaseNotes)
        ? info.releaseNotes.map((n) => (typeof n === 'string' ? n : n.note)).join('\n')
        : '';

    updateAvailable = {
      version: info.version,
      releaseNotes: notes,
      releaseDate: info.releaseDate ?? new Date().toISOString(),
    };

    mainWindow.webContents.send('updater:update-available', updateAvailable);
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('updater:up-to-date');
  });

  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('updater:download-progress', {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('updater:download-complete');
  });

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('updater:error', err.message);
  });

  // Check for updates after a short delay
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 5000);
}

export function registerUpdaterHandlers(): void {
  ipcMain.handle('updater:check', async () => {
    if (is.dev) return null;
    try {
      const result = await autoUpdater.checkForUpdates();
      return result?.updateInfo ?? null;
    } catch {
      return null;
    }
  });

  ipcMain.handle('updater:getAvailable', () => {
    return updateAvailable;
  });

  ipcMain.handle('updater:download', async () => {
    await autoUpdater.downloadUpdate();
  });

  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall(false, true);
  });

  ipcMain.handle('updater:getVersion', () => {
    const { app } = require('electron');
    return app.getVersion();
  });
}
