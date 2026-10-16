/* @layer electron-main @kind logic */
import { listRomInfos } from '@app/game/port';
import { createNodeFileStore } from '../../lib/node-file-store';
import { compileRomAssets } from './compile-rom-assets';

const recompileAllAssets = async (): Promise<void> => {
  for (const rom of await listRomInfos(createNodeFileStore())) {
    if (rom.hasAssets) await compileRomAssets(rom.romFile);
  }
};

export { recompileAllAssets };
