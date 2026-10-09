/* @layer renderer-lib @kind logic */
import { assets } from '@rotp/roms';
import { isCurrentBakeVersion } from '@rotp/asset-extraction';
import { platformFiles } from '../platform-files';

const checkAssetsStale = async (romFile: string): Promise<boolean> => {
  const bytes = await assets.load(platformFiles(), romFile);
  return bytes !== null && !isCurrentBakeVersion(bytes);
};

export { checkAssetsStale };
