/* @layer electron-main @kind logic */
import { selectInstaller } from '@shared/store/install/select-installer';
import type { InstalledPack } from '@shared/store/installed-types';
import { repointProfiles } from '../repoint-profiles';
import { storeFiles } from '../store-files';

const retirePack = async (pack: InstalledPack, replacement: string | null): Promise<string[]> => {
  const changed = await repointProfiles(storeFiles, pack, replacement);
  await selectInstaller(pack.container).uninstall(pack.installedName, storeFiles);
  return changed;
};

export { retirePack };
