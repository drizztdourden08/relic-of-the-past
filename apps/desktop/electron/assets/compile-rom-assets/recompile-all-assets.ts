/* @layer electron-main @kind logic */
import { listWithStatus } from '@shared/storage/roms';
import { createNodeFileStore } from '../../lib/node-file-store';
import { compileRomAssets } from './compile-rom-assets';

const recompileAllAssets = async (): Promise<void> => {
  for (const rom of await listWithStatus(createNodeFileStore())) {
    if (rom.hasAssets) await compileRomAssets(rom.romFile);
  }
};

export { recompileAllAssets };
