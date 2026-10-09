/* @layer electron-main @kind logic */
import { currentVersion } from './update-manager';
import { readPrefs } from './updater-prefs';
import { updaterState } from './updater-state';
import type { VersionCandidate } from './updater.type';
import { listVersions } from './version-feed';

const refreshVersions = async (): Promise<VersionCandidate[]> => {
  try {
    updaterState.versions = await listVersions(currentVersion(), readPrefs().allowPrerelease);
  } catch {
    updaterState.versions = [];
  }
  return updaterState.versions;
};

export { refreshVersions };
