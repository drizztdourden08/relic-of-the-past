/* @layer renderer-lib @kind logic */
import * as sprites from '@shared/storage/sprites';
import { SPRITE_DEFS } from './sprites-store.constants';

const expectedSpriteFiles = (): string[] => sprites.extractedFileNames(SPRITE_DEFS);

export { expectedSpriteFiles };
