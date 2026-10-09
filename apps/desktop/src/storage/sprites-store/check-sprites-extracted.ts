/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const checkSpritesExtracted = (romFile: string) => sprites.check(platformFiles(), romFile);

export { checkSpritesExtracted };
