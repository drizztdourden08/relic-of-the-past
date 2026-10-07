/* @layer electron-main @kind logic */
/**
 * Removing what the Hookshop installed. The profiles let go of the pack first, then its
 * installer removes exactly what it wrote, then the record goes. A language change is baked
 * into the game assets after, the way the language editor's save does it.
 */
import { selectInstaller } from '@shared/store/install/select-installer';
import type { InstalledPack } from '@shared/store/installed-types';
import { recompileAllAssets } from '../assets/compile-rom-assets';
import { repointProfiles } from './repoint-profiles';
import { installedRegistry, storeFiles } from './store-files';

/**
 * Points every profile that selects the pack at `replacement` (null: back to the default),
 * then removes the pack's files. Returns the profiles that changed.
 */
const retirePack = async (pack: InstalledPack, replacement: string | null): Promise<string[]> => {
  const changed = await repointProfiles(storeFiles, pack, replacement);
  await selectInstaller(pack.container).uninstall(pack.installedName, storeFiles);
  return changed;
};

const uninstallItem = async (itemId: string): Promise<string[]> => {
  const pack = await installedRegistry.get(itemId);
  if (!pack) return [];
  const released = await retirePack(pack, null);
  await installedRegistry.remove(itemId);
  if (pack.kind === 'language') await recompileAllAssets();
  return released;
};

export { uninstallItem, retirePack };
