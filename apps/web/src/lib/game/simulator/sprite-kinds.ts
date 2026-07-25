/* @layer bridge-wasm @kind logic */
/**
 * Static-sprite type → SimSprite kind. Only NPCs that hand out a check need to
 * be classified 'npc' (the trigger planner then resolves their flag payload from
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
};

const spriteKindFor = (spriteType: number): SimSprite['kind'] => SPRITE_KINDS[spriteType] ?? 'other';

export { SPRITE_KINDS, spriteKindFor };
