/* @layer renderer-lib @kind constants */
import type { SpriteDef } from '@rotp/asset-extraction';
import { SPRITE_DEFINITIONS } from '@rotp/game-data';
import { toSpriteDefs } from './to-sprite-defs';

const SPRITE_DEFS: SpriteDef[] = toSpriteDefs(SPRITE_DEFINITIONS);

export { SPRITE_DEFS };
