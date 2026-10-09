/* @layer electron-main @kind logic */
import type { UpdateInfo, VersionCandidate } from './updater.type';

const toUpdateInfo = (option: VersionCandidate): UpdateInfo => ({
  version: option.version,
  releaseNotes: option.releaseNotes,
  releaseDate: option.releaseDate,
  saveStates: option.saveStates,
});

export { toUpdateInfo };
