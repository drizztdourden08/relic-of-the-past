/* @layer renderer-lib @kind logic */
import * as assets from '@shared/storage/assets';
import { isCurrentBakeVersion } from '@rotp/asset-extraction';
import { platformFiles } from '../platform-files';

const checkAssetsStale = async (romFile: string): Promise<boolean> => {
  const bytes = await assets.load(platformFiles(), romFile);
  return bytes !== null && !isCurrentBakeVersion(bytes);
};

export { checkAssetsStale };
