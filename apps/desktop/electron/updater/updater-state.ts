/* @layer electron-main @kind logic */
import type { UpdateInfo, VersionCandidate } from './updater.type';

const updaterState = {
  available: null as UpdateInfo | null,
  versions: [] as VersionCandidate[],
};

export { updaterState };
