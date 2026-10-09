/* @layer electron-main @kind logic */
import { recompileAllAssets } from '../../assets/compile-rom-assets';
import { installedRegistry } from '../store-files';
import { retirePack } from './retire-pack';

const uninstallItem = async (itemId: string): Promise<string[]> => {
  const pack = await installedRegistry.get(itemId);
  if (!pack) return [];
  const released = await retirePack(pack, null);
  await installedRegistry.remove(itemId);
  if (pack.kind === 'language') await recompileAllAssets();
  return released;
};

export { uninstallItem };
