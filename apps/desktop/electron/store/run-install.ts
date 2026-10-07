/* @layer electron-main @kind logic */
/**
 * The install and uninstall channels around installItem and uninstallItem: the request from
 * the renderer is checked, one install per item runs at a time, each step is sent to the
 * window as `store:installProgress`, and the outcome becomes the channel's answer.
 */
import type { StoreInstallRequest, StoreInstallResult, StoreUninstallResult } from '@shared/ipc';
import type { InstallProgress } from '@shared/store/install/installer.type';
import { emit } from '../lib/ipc/handle';
import { logToRenderer } from '../lib/renderer-log';
import { getMainWindow } from '../window';
import { assertItemId } from './catalog';
import { installItem } from './install';
import { beginJob, endJob, isInstalling } from './install-jobs';
import { isSignedOut } from './store-client';
import { errorText } from './store-result';
import { uninstallItem } from './uninstall';

const isVersion = (value: unknown): value is number | null =>
  value === null || (typeof value === 'number' && Number.isInteger(value) && value > 0);

const sendProgress = (itemId: string, progress: InstallProgress): void => {
  const window = getMainWindow();
  if (window) emit(window, 'store:installProgress', { itemId, progress });
};

const failure = (err: unknown, cancelled: boolean): StoreInstallResult =>
  ({ ok: false, error: errorText(err), signedOut: isSignedOut(err), cancelled });

const runInstall = async (request: StoreInstallRequest): Promise<StoreInstallResult> => {
  const { itemId, version } = request;
  try {
    assertItemId(itemId);
    if (!isVersion(version)) throw new Error('Not a version of this item.');
  } catch (err) {
    return failure(err, false);
  }
  const signal = beginJob(itemId);
  if (!signal) return failure(new Error('This pack is already installing.'), false);
  try {
    const pack = await installItem({ itemId, version, signal, onProgress: (p) => sendProgress(itemId, p) });
    logToRenderer('app', 'info', `[Hookshop] Installed ${pack.kind} "${pack.installedName}" ${pack.semver}`);
    return { ok: true, pack };
  } catch (err) {
    if (!signal.aborted) logToRenderer('error', 'error', `[Hookshop] Install failed: ${errorText(err)}`);
    return failure(err, signal.aborted);
  } finally {
    endJob(itemId);
  }
};

const runUninstall = async (itemId: string): Promise<StoreUninstallResult> => {
  try {
    assertItemId(itemId);
    if (isInstalling(itemId)) throw new Error('Wait for the install to finish first.');
    const releasedProfiles = await uninstallItem(itemId);
    logToRenderer('app', 'info', `[Hookshop] Uninstalled ${itemId}`);
    return { ok: true, releasedProfiles };
  } catch (err) {
    logToRenderer('error', 'error', `[Hookshop] Uninstall failed: ${errorText(err)}`);
    return { ok: false, error: errorText(err) };
  }
};

export { runInstall, runUninstall };
