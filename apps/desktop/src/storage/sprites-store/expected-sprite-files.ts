/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { SPRITE_DEFS } from './sprites-store.constants';

const expectedSpriteFiles = (): string[] => sprites.extractedFileNames(SPRITE_DEFS);

export { expectedSpriteFiles };
