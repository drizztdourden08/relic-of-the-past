/* @layer electron-main @kind logic */
import type { StoreInstallRequest, StoreInstallResult } from '@shared/ipc';
import type { InstallProgress } from '@shared/store/install/installer.type';
import { emit } from '../../lib/ipc/handle';
import { logToRenderer } from '../../lib/renderer-log';
import { getMainWindow } from '../../window';
import { assertItemId } from '../catalog';
import { installItem } from '../install';
import { beginJob, endJob } from '../install-jobs';
import { isSignedOut } from '../store-client';
import { errorText } from '../store-result';

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

export { runInstall };
