/* @layer electron-main @kind types */
import type { UpdateInfo, UpdaterPrefs, VersionOption } from '@shared/ipc/updater-contract';
import type { UpdatePlan } from './version-feed';

/**
 * A version the picker offers, plus how to actually get there: the base release and the
 * ordered deltas Velopack walks. The plan stays in the main process, since the renderer
 * picks by version string and never sees a feed entry.
 */
interface VersionCandidate extends VersionOption {
  plan: UpdatePlan;
}

export type { UpdateInfo, UpdaterPrefs, VersionCandidate, VersionOption };
