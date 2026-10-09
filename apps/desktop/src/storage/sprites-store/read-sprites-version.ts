/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const readSpritesVersion = (romFile: string): Promise<string | null> => sprites.readStampVersion(platformFiles(), romFile);

export { readSpritesVersion };
