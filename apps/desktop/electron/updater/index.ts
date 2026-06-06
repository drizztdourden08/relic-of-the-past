import { autoUpdater } from 'electron-updater';
import type { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
import { is } from '@electron-toolkit/utils';

export interface UpdateInfo {
  version: string;
  releaseNotes: string;
  releaseDate: string;
}

let updateAvailable: UpdateInfo | null = null;

export const isPortable = !!process.env.PORTABLE_EXECUTABLE_DIR;

export function initAutoUpdater(mainWindow: BrowserWindow): void {
  if (is.dev || isPortable) return;

  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'drizztdourden08',
    repo: 'relic-of-the-past',
  });

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('update-available', async (info) => {
    // Fetch release notes from GitHub API (electron-updater doesn't include them)
    let notes = '';
    try {
      const res = await fetch(
        `https://api.github.com/repos/drizztdourden08/relic-of-the-past/releases/tags/v${info.version}`,
        { headers: { Accept: 'application/vnd.github.v3+json' } },
      );
      if (res.ok) {
        const release = await res.json();
        notes = release.body ?? '';
      }
    } catch {
      // Silently fail — notes are optional
    }

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

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('[updater] check failed:', err);
    });
  }, 5000);
}

export function registerUpdaterHandlers(): void {
  ipcMain.handle('updater:isPortable', () => isPortable);

  ipcMain.handle('updater:check', async () => {
    if (is.dev || isPortable) return null;
    try {
      const result = await autoUpdater.checkForUpdates();
      return result?.updateInfo ?? null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(message);
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
