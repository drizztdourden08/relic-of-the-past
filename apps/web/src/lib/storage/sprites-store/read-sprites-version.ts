/* @layer renderer-lib @kind logic */
import * as sprites from '@shared/storage/sprites';
import { platformFiles } from '../platform-files';

const readSpritesVersion = (romFile: string): Promise<string | null> => sprites.readStampVersion(platformFiles(), romFile);

export { readSpritesVersion };
