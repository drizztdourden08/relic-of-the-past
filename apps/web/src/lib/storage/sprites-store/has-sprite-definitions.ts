/* @layer renderer-lib @kind logic */
import { SPRITE_DEFS } from './sprites-store.constants';

const hasSpriteDefinitions = (): boolean => SPRITE_DEFS.length > 0;

export { hasSpriteDefinitions };
