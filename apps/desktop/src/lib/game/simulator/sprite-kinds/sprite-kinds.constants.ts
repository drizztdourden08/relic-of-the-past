/* @layer bridge-wasm @kind constants */
import type { SimSprite } from '@shared/game/simulation';

const SPRITE_KINDS: Record<number, SimSprite['kind']> = {
  0x16: 'npc',
  0x1a: 'npc',
  0x1f: 'npc',
  0x28: 'npc',
  0x2b: 'npc',
  0x2e: 'npc',
  0x36: 'npc',
  0x39: 'npc',
  0x3a: 'npc',
  0x52: 'npc',
  0x73: 'npc',
  0x75: 'npc',
  0xad: 'npc',
  0xbb: 'npc',
  0xe7: 'standing',
  0xeb: 'standing',
};

const STANDING_ITEM_IDS: Record<number, number> = {
  0xe7: 0x29,
  0xeb: 0x17,
};

export { SPRITE_KINDS, STANDING_ITEM_IDS };
