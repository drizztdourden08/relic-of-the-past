/* @layer renderer-lib @kind logic */
import { listRomsWithStatus } from '../roms-store';
import { extractAssets } from './extract-assets';

const recompileAll = async (): Promise<void> => {
  for (const rom of await listRomsWithStatus()) {
    if (rom.hasAssets) await extractAssets(rom.romFile);
  }
};

export { recompileAll };
