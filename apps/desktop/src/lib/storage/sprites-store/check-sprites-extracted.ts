/* @layer renderer-lib @kind logic */
import * as sprites from '@shared/storage/sprites';
import { platformFiles } from '../platform-files';

const checkSpritesExtracted = (romFile: string) => sprites.check(platformFiles(), romFile);

export { checkSpritesExtracted };
