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
 * A picked version is described by its feed entry, which is all Velopack needs: no
 * deltas (they only exist against the immediately previous release) and a downgrade
 * flag so it knows to discard anything newer already staged on disk.
 */
const asUpdateInfo = (option: VersionCandidate): VelopackUpdateInfo => ({
  TargetFullRelease: option.asset,
  DeltasToTarget: [],
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

/** The newest release the feed offers, which is what the badge is about. */
const applyLatest = async (): Promise<void> => {
  const manager = getUpdateManager();
  if (!manager) throw new Error('This build cannot update itself');
  const found = await manager.checkForUpdatesAsync();
  if (!found) throw new Error('There is no newer version to install');
  await downloadAndApply(found);
};

/** A specific version from the picker, newer or older than the one running. */
const applyVersion = async (option: VersionCandidate): Promise<void> => {
  await downloadAndApply(asUpdateInfo(option));
};

export { applyLatest, applyVersion };
