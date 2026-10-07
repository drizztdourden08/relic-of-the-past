/* @layer electron-main @kind logic */
/**
 * The updater's IPC surface and its startup check.
 *
 * Velopack owns the download, the verification and the swap. What lives here is the
 * decision to check, the list of versions the picker offers, and the hand-off.
 */
import { shell } from 'electron';
import type { BrowserWindow } from 'electron';
import { handle, emit } from '../lib/ipc/handle';
import { getMainWindow } from '../window';
import { applyVersion } from './apply-update';
import { canCheckForUpdates, canSelfUpdate, currentVersion, getUpdateManager, isUpdateHarness } from './update-manager';
import { findNewerRelease, releasePageUrl } from './latest-release';
import { readPrefs, writePrefs } from './updater-prefs';
import { FIRST_CHECK_DELAY_MS } from './updater.constants';
import { compareVersions, listVersions } from './version-feed';
import type { UpdateInfo, UpdaterPrefs, VersionCandidate } from './updater.type';

let available: UpdateInfo | null = null;
let versions: VersionCandidate[] = [];

const asUpdateInfo = (option: VersionCandidate): UpdateInfo => ({
  version: option.version,
  releaseNotes: option.releaseNotes,
  releaseDate: option.releaseDate,
  saveStates: option.saveStates,
});

/** Refreshes the picker's list and returns it. Empty when the feed cannot be read. */
const refreshVersions = async (): Promise<VersionCandidate[]> => {
  try {
    versions = await listVersions(currentVersion(), readPrefs().allowPrerelease);
  } catch {
    versions = [];
  }
  return versions;
};

const runCheck = async (mainWindow: BrowserWindow): Promise<UpdateInfo | null> => {
  const manager = getUpdateManager();

  // Without Velopack there is nothing to install with, but the release list still
  // answers the only question the badge asks. macOS lives here.
  if (!manager) {
    if (!canCheckForUpdates()) return null;
    try {
      available = await findNewerRelease(currentVersion(), readPrefs().allowPrerelease);
      if (available) emit(mainWindow, 'updater:update-available', available);
      else emit(mainWindow, 'updater:up-to-date');
      return available;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      emit(mainWindow, 'updater:error', message);
      return null;
    }
  }

  try {
    const found = await manager.checkForUpdatesAsync();
    if (!found) {
      available = null;
      emit(mainWindow, 'updater:up-to-date');
      return null;
    }

    // AllowVersionDowngrade also makes this check answer with an older build, so a
    // machine on the newest release was told an earlier version "is available".
    const target = found.TargetFullRelease;
    if (compareVersions(target.Version, currentVersion()) <= 0) {
      available = null;
      await refreshVersions();
      emit(mainWindow, 'updater:up-to-date');
      return null;
    }

    // The version list is fetched alongside so the picker is populated when it opens.
    available = {
      version: target.Version,
      releaseNotes: target.NotesMarkdown ?? '',
      releaseDate: '',
      // Velopack's result carries no asset list; the release listing below fills it in.
      saveStates: { kind: 'unverifiable', why: 'not-published' },
    };
    await refreshVersions();
    const listed = versions.find((v) => v.version === target.Version);
    if (listed) available = asUpdateInfo(listed);

    emit(mainWindow, 'updater:update-available', available);
    return available;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    emit(mainWindow, 'updater:error', message);
    return null;
  }
};

const initAutoUpdater = (mainWindow: BrowserWindow): void => {
  if (!canSelfUpdate() && !canCheckForUpdates()) return;
  setTimeout(() => {
    runCheck(mainWindow).catch((err) => console.error('[updater] check failed:', err));
  }, FIRST_CHECK_DELAY_MS);
};

const registerUpdaterHandlers = (): void => {
  handle('updater:capabilities', () => ({
    canCheck: canSelfUpdate() || canCheckForUpdates(),
    // The harness claims the picker so every version can be inspected side by side.
    // Pressing the button there still fails at Velopack, which is the truth.
    canInstall: canSelfUpdate() || isUpdateHarness(),
  }));

  // The way out for a build that can see an update but not apply one.
  handle('updater:openReleasePage', async (_event, version: string | null) => {
    await shell.openExternal(releasePageUrl(version ?? undefined));
  });
  handle('updater:getVersion', () => currentVersion());
  handle('updater:getAvailable', () => available);

  handle('updater:check', async () => {
    const win = getMainWindow();
    if (!win) return null;
    return runCheck(win);
  });

  handle('updater:listVersions', async () => {
    // Only meaningful when this build can install, or the harness is up to look at choices.
    if (!canSelfUpdate() && !isUpdateHarness()) return [];
    const list = await refreshVersions();
    // The plan is main-process detail; the renderer picks by version string.
    return list.map(({ plan: _plan, ...rest }) => rest);
  });

  handle('updater:getPrefs', () => readPrefs());
  handle('updater:setPrefs', async (_event, prefs: UpdaterPrefs) => {
    writePrefs(prefs);
    // The preference is part of the update source, so the list is now stale.
    await refreshVersions();
  });

  /** `null` means the newest release; a version string means that exact build. */
  handle('updater:apply', async (_event, version: string | null) => {
    try {
      if (!canSelfUpdate()) throw new Error('This build cannot install updates itself');
      // null means the newest, resolved from the same list the picker shows.
      const list = versions.length ? versions : await refreshVersions();
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
  });
};

export { initAutoUpdater, registerUpdaterHandlers };
export type { UpdateInfo };
