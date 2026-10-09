/* @layer electron-main @kind logic */
import type { StoreUninstallResult } from '@shared/ipc';
import { logToRenderer } from '../../lib/renderer-log';
import { assertItemId } from '../catalog';
import { isInstalling } from '../install-jobs';
import { errorText } from '../store-result';
import { uninstallItem } from '../uninstall';

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

export { runUninstall };
