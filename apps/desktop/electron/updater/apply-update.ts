/* @layer electron-main @kind logic */
/**
 * Downloading and applying, for the newest release or a version the user picked.
 *
 * The download runs here so its progress can be reported into the app's own UI, and
 * the swap runs in Velopack's Update.exe after we exit, which is what lets it replace
 * the files we are running from.
 */
import { app } from 'electron';
import type { UpdateInfo as VelopackUpdateInfo } from 'velopack';
import { emit } from '../lib/ipc/handle';
import { getMainWindow } from '../window';
import { getUpdateManager } from './update-manager';
import type { VersionCandidate } from './updater.type';

const reportProgress = (percent: number): void => {
  const win = getMainWindow();
  if (win) emit(win, 'updater:download-progress', { percent });
};

/**
 * The plan from the feed, handed over in Velopack's own shape: the base release and the
 * ordered deltas that walk to the target, or an empty list when the plan decided a full
 * install is the only option.
 *
 * This used to pass no deltas at all, so every explicitly picked version downloaded a
 * whole package while the picker advertised the delta size. Both now read the same plan.
 */
const asUpdateInfo = (option: VersionCandidate): VelopackUpdateInfo => ({
  TargetFullRelease: option.plan.target,
  BaseRelease: option.plan.base,
  DeltasToTarget: option.plan.deltas,
  IsDowngrade: option.downgrade,
});

const downloadAndApply = async (update: VelopackUpdateInfo): Promise<void> => {
  const manager = getUpdateManager();
  if (!manager) throw new Error('This build cannot update itself');

  await manager.downloadUpdateAsync(update, reportProgress);

  const win = getMainWindow();
  if (win) emit(win, 'updater:download-complete');

  // silent: no Velopack UI for an update, since the app has already shown its own
  // progress. restart: it brings the app back once the swap is done.
  manager.waitExitThenApplyUpdate(update, true, true);
  app.quit();
};

/**
 * Any version from the picker, newer or older than the one running.
 *
 * There is deliberately no separate "install the newest" path. That one asked Velopack
 * to work out the target itself, which could answer nothing while the picker's list was
 * perfectly populated, and it reported that as "there is no newer version to install".
 */
const applyVersion = async (option: VersionCandidate): Promise<void> => {
  await downloadAndApply(asUpdateInfo(option));
};

export { applyVersion };
