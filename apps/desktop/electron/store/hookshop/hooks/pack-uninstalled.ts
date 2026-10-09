/* @layer electron-main @kind logic */
import type { InstalledRecord } from '@drizztdourden08/brock-catalog/main';
import { recompileAllAssets } from '../../../assets/compile-rom-assets';
import { logToRenderer } from '../../../lib/renderer-log';

const packUninstalled = async (record: InstalledRecord): Promise<void> => {
  if (record.kind === 'language') await recompileAllAssets();
  logToRenderer('app', 'info', `[Hookshop] Uninstalled ${record.itemId}`);
};

export { packUninstalled };
