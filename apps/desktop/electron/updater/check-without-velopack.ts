/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { emit } from '../lib/ipc/handle';
import { findNewerRelease } from './latest-release';
import { canCheckForUpdates, currentVersion } from './update-manager';
import { readPrefs } from './updater-prefs';
import { updaterState } from './updater-state';
import type { UpdateInfo } from './updater.type';

const checkWithoutVelopack = async (mainWindow: BrowserWindow): Promise<UpdateInfo | null> => {
  if (!canCheckForUpdates()) return null;
  try {
    updaterState.available = await findNewerRelease(currentVersion(), readPrefs().allowPrerelease);
    if (updaterState.available) emit(mainWindow, 'updater:update-available', updaterState.available);
    else emit(mainWindow, 'updater:up-to-date');
    return updaterState.available;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    emit(mainWindow, 'updater:error', message);
    return null;
  }
};

export { checkWithoutVelopack };
