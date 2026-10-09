/* @layer renderer-lib @kind logic */
import * as sprites from '@shared/storage/sprites';
import { platformFiles } from '../platform-files';
import { hasSpriteDefinitions } from './has-sprite-definitions';
import { expectedSpriteFiles } from './expected-sprite-files';
import { expectedSpritesVersion } from './expected-sprites-version';

const checkSpritesStale = async (romFile: string): Promise<boolean> => {
  if (!hasSpriteDefinitions()) return false;
  return sprites.isStale(platformFiles(), romFile, expectedSpriteFiles(), expectedSpritesVersion());
};

export { checkSpritesStale };
