/* @layer shared-types @kind types */
import type { TargetCompat } from '@shared/game/save-state';

interface UpdateInfo {
  version: string;
  releaseNotes: string;
  releaseDate: string;
  saveStates: TargetCompat;
}

interface VersionOption {
  version: string;
  releaseNotes: string;
  releaseDate: string;
  size: number;
  downloadSize: number;
  prerelease: boolean;
  downgrade: boolean;
  installed: boolean;
  saveStates: TargetCompat;
}

interface UpdaterCapabilities {
  canCheck: boolean;
  canInstall: boolean;
}

interface UpdaterPrefs {
  allowPrerelease: boolean;
}

export type { TargetCompat, UpdateInfo, UpdaterCapabilities, UpdaterPrefs, VersionOption };
