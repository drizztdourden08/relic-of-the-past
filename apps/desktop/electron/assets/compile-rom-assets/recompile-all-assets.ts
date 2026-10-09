/* @layer electron-main @kind logic */
import { hasAssetForRom, listRoms } from '../../roms/store';
import { compileRomAssets } from './compile-rom-assets';

const recompileAllAssets = async (): Promise<void> => {
  const roms = await listRoms();
  for (const romFile of roms) {
    if (await hasAssetForRom(romFile)) {
      await compileRomAssets(romFile);
    }
  }
};

export { recompileAllAssets };
