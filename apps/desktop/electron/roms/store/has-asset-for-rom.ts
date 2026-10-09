/* @layer electron-main @kind logic */
import { stat } from 'fs/promises';
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';
import { getAssetFileName } from './get-asset-file-name';

const hasAssetForRom = async (romFile: string): Promise<boolean> => {
  const assetFile = getAssetFileName(romFile);
  try {
    const s = await stat(getUserDataPath('assets', assetFile));
    return s.size > 0;
  } catch {
    return false;
  }
};

export { hasAssetForRom };
