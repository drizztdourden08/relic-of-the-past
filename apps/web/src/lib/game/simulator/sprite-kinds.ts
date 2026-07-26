/* @layer bridge-wasm @kind logic */
/**
 * Static-sprite type → SimSprite kind. NPCs that hand out a check are 'npc' (the trigger planner then resolves their flag payload from
 * CHECK_NPC_FLAGS by sprite type); everything else falls back to 'other', which
 * is non-triggerable and simply feeds coarse reachability. The union has no
 * 'enemy'/'item' member, so 'other' is the neutral default here. This map starts
 * small and grows as vanilla runs surface more check-giving NPC ids.
 */
import type { SimSprite } from '@shared/game/simulation';

const SPRITE_KINDS: Record<number, SimSprite['kind']> = {
  0x16: 'npc', // the first sage
  0x1a: 'npc', // Blind's Hut / hint NPC
  0x1f: 'npc', // Sick Kid
  0x28: 'npc', // Gets bombable-wall room flag on trigger
  0x2b: 'npc', // Dwarf / smithy
  0x2e: 'npc', // Named villager (progress flag)
  0x36: 'npc', // Mad Batter / potion NPC
  0x39: 'npc', // Hint / storyteller NPC
  0x3a: 'npc', // Half-magic bat NPC
  0x52: 'npc', // King Zora
  0x73: 'npc', // Link's Uncle (UncleAndPriest)
  0x75: 'npc', // Bottle Merchant
  0xad: 'npc', // Old Man (Death Mountain)
  // Standing items — collected by walking onto them, not by talking. The pair
  // that matters before the first dungeon: the fungus in the woods and the
  // loose heart pieces (`Sprite_E7_*` / `Sprite_HeartPiece`, sprite_main.c:705).
  0xe7: 'standing',
  0xeb: 'standing',
};

/** What a standing sprite hands over (Link_ReceiveItem argument, id-map.ts). */
const STANDING_ITEM_IDS: Record<number, number> = {
  0xe7: 0x29,
  0xeb: 0x17,
};

const standingItemId = (spriteType: number): number | undefined => STANDING_ITEM_IDS[spriteType];

const spriteKindFor = (spriteType: number): SimSprite['kind'] => SPRITE_KINDS[spriteType] ?? 'other';

export { SPRITE_KINDS, spriteKindFor, standingItemId };
