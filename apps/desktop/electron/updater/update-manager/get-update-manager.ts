/* @layer electron-main @kind logic */
import type { UpdateManager } from 'velopack';
import { FEED_REPO_URL, MAX_DELTAS } from '../updater.constants';
import { readPrefs } from '../updater-prefs';
import { loadVelopack } from '../velopack-loader';
import { localSourceDir } from './local-source-dir';
import { updateManagerState } from './update-manager-state';

const getUpdateManager = (): UpdateManager | null => {
  const { allowPrerelease } = readPrefs();
  const state = updateManagerState;
  if (state.cached && state.cachedPrerelease === allowPrerelease) return state.cached;
  const velopack = loadVelopack();
  if (!velopack) return null;
  const { UpdateManager, GithubSource, FileSource } = velopack;

  try {
    const local = localSourceDir();
    const source = local
      ? new FileSource(local)
      : new GithubSource(FEED_REPO_URL, undefined, allowPrerelease);
    state.cached = new UpdateManager(source, { AllowVersionDowngrade: true, MaximumDeltasBeforeFallback: MAX_DELTAS });
    state.cachedPrerelease = allowPrerelease;
    return state.cached;
  } catch {
    state.cached = null;
    state.cachedPrerelease = null;
    return null;
  }
};

export { getUpdateManager };
