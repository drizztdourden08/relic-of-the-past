/* @layer electron-main @kind logic */
/**
 * The Velopack UpdateManager, built on demand: it throws when the app was not
 * installed by Velopack (every dev run and portable copy), and the pre-release
 * preference is part of the source, so switching it has to build a new one.
 */
import { app } from 'electron';
import { UpdateManager, GithubSource, FileSource } from 'velopack';
import { FEED_REPO_URL, MAX_DELTAS } from './updater.constants';
import { readPrefs } from './updater-prefs';

let cached: UpdateManager | null = null;
let cachedPrerelease: boolean | null = null;

/**
 * `--update-source=<dir>` points the updater at a local folder of packed releases,
 * so the install-and-update path can be exercised before anything is published.
 */
const localSourceDir = (): string | null => {
  const arg = process.argv.find((a) => a.startsWith('--update-source='));
  return arg ? arg.slice('--update-source='.length) : null;
};

/**
 * Null when this build cannot update itself (a dev run, a portable copy, anything
 * Velopack does not recognise). Callers treat null as "not available", not an error.
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
 * True when a developer has pointed the updater at a fixture origin. Makes a dev run
 * behave like a packaged one for CHECKING and LISTING, so the dialog can be looked at
 * without publishing. Applying still goes through Velopack and still fails here.
 */
const isUpdateHarness = (): boolean => !!process.env.ROTP_UPDATE_API_ORIGIN;

/**
 * True for any packaged build, including ones that cannot install what they find:
 * knowing an update exists is useful even when applying means the release page.
 */
const canCheckForUpdates = (): boolean => app.isPackaged || isUpdateHarness();

const currentVersion = (): string => {
  const manager = getUpdateManager();
  return manager ? manager.getCurrentVersion() : app.getVersion();
};

export { canCheckForUpdates, canSelfUpdate, currentVersion, getUpdateManager, isUpdateHarness };
