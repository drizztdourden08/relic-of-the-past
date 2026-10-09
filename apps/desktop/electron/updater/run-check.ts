/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { emit } from '../lib/ipc/handle';
import { checkWithoutVelopack } from './check-without-velopack';
import { refreshVersions } from './refresh-versions';
import { toUpdateInfo } from './to-update-info';
import { currentVersion, getUpdateManager } from './update-manager';
import { updaterState } from './updater-state';
import type { UpdateInfo } from './updater.type';
import { compareVersions } from './version-compare';

const runCheck = async (mainWindow: BrowserWindow): Promise<UpdateInfo | null> => {
  const manager = getUpdateManager();
  if (!manager) return checkWithoutVelopack(mainWindow);

  try {
    const found = await manager.checkForUpdatesAsync();
    if (!found) {
      updaterState.available = null;
      emit(mainWindow, 'updater:up-to-date');
      return null;
    }

    const target = found.TargetFullRelease;
    const targetIsNotNewer = compareVersions(target.Version, currentVersion()) <= 0;
    if (targetIsNotNewer) {
      updaterState.available = null;
      await refreshVersions();
      emit(mainWindow, 'updater:up-to-date');
      return null;
    }

    updaterState.available = {
      version: target.Version,
      releaseNotes: target.NotesMarkdown ?? '',
      releaseDate: '',
      saveStates: { kind: 'unverifiable', why: 'not-published' },
    };
    await refreshVersions();
    const listed = updaterState.versions.find((v) => v.version === target.Version);
    if (listed) updaterState.available = toUpdateInfo(listed);

    emit(mainWindow, 'updater:update-available', updaterState.available);
    return updaterState.available;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    emit(mainWindow, 'updater:error', message);
    return null;
  }
};

export { runCheck };
