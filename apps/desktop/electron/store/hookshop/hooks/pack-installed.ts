/* @layer electron-main @kind logic */
import type { InstalledRecord } from '@drizztdourden08/brock-catalog/main';
import { recompileAllAssets } from '../../../assets/compile-rom-assets';
import { logToRenderer } from '../../../lib/renderer-log';

const packInstalled = async (record: InstalledRecord): Promise<void> => {
  const { kind, installedName, meta } = record;
  if (kind === 'language') await recompileAllAssets();
  logToRenderer('app', 'info', `[Hookshop] Installed ${kind ?? 'pack'} "${installedName}" ${String(meta.semver)}`);
};

export { packInstalled };
