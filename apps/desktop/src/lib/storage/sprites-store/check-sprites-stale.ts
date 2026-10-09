/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { platformFiles } from '../platform-files';
import { hasSpriteDefinitions } from './has-sprite-definitions';
import { expectedSpriteFiles } from './expected-sprite-files';
import { expectedSpritesVersion } from './expected-sprites-version';

const checkSpritesStale = async (romFile: string): Promise<boolean> => {
  if (!hasSpriteDefinitions()) return false;
  return sprites.isStale(platformFiles(), romFile, expectedSpriteFiles(), expectedSpritesVersion());
};

export { checkSpritesStale };
