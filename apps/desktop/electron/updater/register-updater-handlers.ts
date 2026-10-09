/* @layer electron-main @kind logic */
import { shell } from 'electron';
import { handle, emit, getMainWindow } from '@drizztdourden08/brock-electron/main';
import { applyVersion } from './apply-update';
import { refreshVersions } from './refresh-versions';
import { releasePageUrl } from './release-page-url';
import { runCheck } from './run-check';
import { canCheckForUpdates, canSelfUpdate, currentVersion, isUpdateHarness } from './update-manager';
import { readPrefs, writePrefs } from './updater-prefs';
import { updaterState } from './updater-state';
import type { UpdaterPrefs } from './updater.type';

const applyPickedVersion = async (version: string | null): Promise<void> => {
  try {
    if (!canSelfUpdate()) throw new Error('This build cannot install updates itself');
    const list = updaterState.versions.length ? updaterState.versions : await refreshVersions();
    const option = version
      ? list.find((v) => v.version === version)
      : list[0];
    if (!option) {
      throw new Error(version
        ? `Version ${version} is not in the release feed`
        : 'The release feed listed no installable version');
    }
    await applyVersion(option);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const win = getMainWindow();
    if (win) emit(win, 'updater:error', message);
  }
};

const registerUpdaterHandlers = (): void => {
  handle('updater:capabilities', () => ({
    canCheck: canSelfUpdate() || canCheckForUpdates(),
    canInstall: canSelfUpdate() || isUpdateHarness(),
  }));

  handle('updater:openReleasePage', async (_event, version: string | null) => {
    await shell.openExternal(releasePageUrl(version ?? undefined));
  });
  handle('updater:getVersion', () => currentVersion());
  handle('updater:getAvailable', () => updaterState.available);

  handle('updater:check', async () => {
    const win = getMainWindow();
    if (!win) return null;
    return runCheck(win);
  });

  handle('updater:listVersions', async () => {
    if (!canSelfUpdate() && !isUpdateHarness()) return [];
    const list = await refreshVersions();
    return list.map(({ plan: _plan, ...rest }) => rest);
  });

  handle('updater:getPrefs', () => readPrefs());
  handle('updater:setPrefs', async (_event, prefs: UpdaterPrefs) => {
    writePrefs(prefs);
    await refreshVersions();
  });

  handle('updater:apply', async (_event, version: string | null) => applyPickedVersion(version));
};

export { registerUpdaterHandlers };
