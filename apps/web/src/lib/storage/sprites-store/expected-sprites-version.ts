/* @layer renderer-lib @kind logic */
import { extractionVersionOf } from '@shared/asset-extraction/item-sprites/extraction-stamp';
import { SPRITE_DEFS } from './sprites-store.constants';

const expectedSpritesVersion = (): string => extractionVersionOf(SPRITE_DEFS);

export { expectedSpritesVersion };
