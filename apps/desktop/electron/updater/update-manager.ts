/* @layer electron-main @kind logic */
/**
 * The Velopack UpdateManager, built on demand.
 *
 * Two reasons it is never constructed at import time. It throws outright when the app
 * was not installed by Velopack ("Could not auto-locate app manifest"), which is every
 * dev run and every portable copy. And the pre-release preference is part of the
 * source, so switching that preference has to build a new one.
 */
import { app } from 'electron';
import { UpdateManager, GithubSource, FileSource } from 'velopack';
import { FEED_REPO_URL, MAX_DELTAS } from './updater.constants';
import { readPrefs } from './updater-prefs';

let cached: UpdateManager | null = null;
let cachedPrerelease: boolean | null = null;

/**
 * `--update-source=<dir>` points the updater at a local folder of packed releases
 * instead of the release page. This is how the whole install-and-update path gets
 * exercised before anything is published: pack two versions into a folder, install
 * the first, and take the update from there.
 */
const localSourceDir = (): string | null => {
  const arg = process.argv.find((a) => a.startsWith('--update-source='));
  return arg ? arg.slice('--update-source='.length) : null;
};

/**
 * Null when this build cannot update itself: a dev run, a portable copy, or anything
 * else Velopack does not recognise as one of its installs. Callers treat null as
 * "updating is not available here" rather than an error.
 */
const getUpdateManager = (): UpdateManager | null => {
  const { allowPrerelease } = readPrefs();
  if (cached && cachedPrerelease === allowPrerelease) return cached;

  try {
    const local = localSourceDir();
    const source = local
      ? new FileSource(local)
      : new GithubSource(FEED_REPO_URL, undefined, allowPrerelease);
    // Downgrades are allowed because the version picker offers older builds on
    // purpose; without this, stepping back off a bad release is refused.
    cached = new UpdateManager(source, { AllowVersionDowngrade: true, MaximumDeltasBeforeFallback: MAX_DELTAS });
    cachedPrerelease = allowPrerelease;
    return cached;
  } catch {
    cached = null;
    cachedPrerelease = null;
    return null;
  }
};

/** Whether this build can download and apply an update on its own. */
const canSelfUpdate = (): boolean => getUpdateManager() !== null;

/**
 * Whether it is worth asking what the newest version is. True for any packaged build,
 * including the ones that cannot install what they find: knowing an update exists is
 * useful even when applying it means visiting the release page.
 */
const canCheckForUpdates = (): boolean => app.isPackaged;

const currentVersion = (): string => {
  const manager = getUpdateManager();
  return manager ? manager.getCurrentVersion() : app.getVersion();
};

export { canCheckForUpdates, canSelfUpdate, currentVersion, getUpdateManager };
