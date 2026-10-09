/* @layer electron-main @kind logic */
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

  const silent = true;
  const restart = true;
  manager.waitExitThenApplyUpdate(update, silent, restart);
  app.quit();
};

const applyVersion = async (option: VersionCandidate): Promise<void> => {
  await downloadAndApply(asUpdateInfo(option));
};

export { applyVersion };
