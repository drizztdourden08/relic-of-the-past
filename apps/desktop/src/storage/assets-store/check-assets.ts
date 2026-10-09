/* @layer renderer-lib @kind logic */
import { assets } from '@rotp/roms';
import { platformFiles } from '../platform-files';

const checkAssets = (romFile: string): Promise<boolean> => assets.check(platformFiles(), romFile);

export { checkAssets };
