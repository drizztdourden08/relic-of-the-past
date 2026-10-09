/* @layer renderer-lib @kind logic */
import { extractionVersionOf } from '@rotp/asset-extraction';
import { SPRITE_DEFS } from './sprites-store.constants';

const expectedSpritesVersion = (): string => extractionVersionOf(SPRITE_DEFS);

export { expectedSpritesVersion };
