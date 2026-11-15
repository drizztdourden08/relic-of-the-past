/* @layer renderer-lib @kind logic */
import { assets } from '@rotp/roms';
import { listRomsWithStatus } from '../roms-store';
import { platformFiles } from '../platform-files';

const libraryRomBytes = async (): Promise<Uint8Array[]> => {
  const out: Uint8Array[] = [];
  for (const { romFile } of await listRomsWithStatus()) {
    const bytes = await assets.readRomBytes(platformFiles(), romFile);
    if (bytes !== null) out.push(bytes);
  }
  return out;
};

export { libraryRomBytes };
