/* @layer electron-main @kind types */
import type { UpdateInfo, UpdaterPrefs, VersionOption } from '@shared/ipc/updater-contract';
import type { UpdatePlan } from './version-feed.type';

interface VersionCandidate extends VersionOption {
  plan: UpdatePlan;
}

export type { UpdateInfo, UpdaterPrefs, VersionCandidate, VersionOption };
