/* @layer renderer-lib @kind constants */
import type { SpriteDef } from '@shared/asset-extraction/item-sprites/extract-items';
import { SPRITE_DEFINITIONS } from '@shared/game/data/sprite-manifest/manifest';

const SPRITE_DEFS = SPRITE_DEFINITIONS as unknown as SpriteDef[];

export { SPRITE_DEFS };
