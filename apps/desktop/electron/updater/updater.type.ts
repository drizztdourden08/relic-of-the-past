/* @layer electron-main @kind types */
import type { VelopackAsset } from 'velopack';
import type { UpdateInfo, UpdaterPrefs, VersionOption } from '@shared/ipc/updater-contract';

/**
 * A version the picker offers, plus the feed entry it was built from. The asset is
 * what actually gets installed and stays in the main process: the renderer picks by
 * version string and never sees it.
 */
interface VersionCandidate extends VersionOption {
  asset: VelopackAsset;
}

export type { UpdateInfo, UpdaterPrefs, VersionCandidate, VersionOption };
