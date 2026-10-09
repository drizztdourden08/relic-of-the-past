/* @layer renderer-lib @kind logic */
import * as assets from '@shared/storage/assets';
import { platformFiles } from '../platform-files';

const checkAssets = (romFile: string): Promise<boolean> => assets.check(platformFiles(), romFile);

export { checkAssets };
