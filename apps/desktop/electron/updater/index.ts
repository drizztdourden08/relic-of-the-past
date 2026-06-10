/* @layer electron-main @kind logic */
import { autoUpdater } from 'electron-updater';
import type { BrowserWindow } from 'electron';
import { is } from '@electron-toolkit/utils';
import { handle, emit } from '../lib/ipc/handle';

interface UpdateInfo {
  version: string;
  releaseNotes: string;
  releaseDate: string;
}

let updateAvailable: UpdateInfo | null = null;

const isPortable = !!process.env.PORTABLE_EXECUTABLE_DIR;

const initAutoUpdater = (mainWindow: BrowserWindow): void => {
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

    emit(mainWindow, 'updater:update-available', updateAvailable);
  });

  autoUpdater.on('update-not-available', () => {
    emit(mainWindow, 'updater:up-to-date');
  });

  autoUpdater.on('download-progress', (progress) => {
    emit(mainWindow, 'updater:download-progress', {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on('update-downloaded', () => {
    emit(mainWindow, 'updater:download-complete');
  });

  autoUpdater.on('error', (err) => {
    emit(mainWindow, 'updater:error', err.message);
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('[updater] check failed:', err);
    });
  }, 5000);
};

const registerUpdaterHandlers = (): void => {
  handle('updater:isPortable', () => isPortable);

  handle('updater:check', async () => {
    if (is.dev || isPortable) return null;
    try {
      const result = await autoUpdater.checkForUpdates();
      return result?.updateInfo ?? null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(message);
    }
  });

  handle('updater:getAvailable', () => {
    return updateAvailable;
  });

  handle('updater:download', async () => {
    await autoUpdater.downloadUpdate();
  });

  handle('updater:install', () => {
    autoUpdater.quitAndInstall(false, true);
  });

  handle('updater:getVersion', () => {
    const { app } = require('electron');
    return app.getVersion();
  });
};

export { isPortable, initAutoUpdater, registerUpdaterHandlers };
export type { UpdateInfo };
