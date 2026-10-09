/* @layer bridge-wasm @kind logic */
import type { SimSprite } from '@shared/game/simulation';
import { SPRITE_KINDS } from './sprite-kinds.constants';

const spriteKindFor = (spriteType: number): SimSprite['kind'] => SPRITE_KINDS[spriteType] ?? 'other';

export { spriteKindFor };
