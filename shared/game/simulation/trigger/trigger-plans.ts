/* @layer shared-game @kind logic */
/**
 * Maps a discovered interactable (chest / NPC sprite / standing or overworld
 * item) to the `TriggerAction` that fires the real check through the delivery
 * queue. NPC sprites resolve their flag/item payload from CHECK_NPC_FLAGS by
 * sprite type; everything else is derived from the interactable itself.
 */
import type { SimChest, SimSprite, TriggerAction } from '../types';
import { CHECK_NPC_FLAGS } from '../../checks/flags';

const planChestTrigger = (chest: SimChest): TriggerAction => ({
  type: 'chest',
  roomId: chest.roomId,
  chestIndex: chest.chestIndex,
  itemId: chest.itemId ?? 0,
});

/**
 * NPC config matching a discovered sprite. Configs are matched by sprite type;
 * a config that pins a `room` matches only when the sprite's live room equals it
 * (disambiguates a type that spawns in several rooms — see NpcCheckConfig.room).
 * Room-less configs keep matching by type alone.
 */
const npcConfigForSprite = (spriteType: number, roomId?: number) =>
  Object.values(CHECK_NPC_FLAGS).find(
    cfg => cfg.spriteType === spriteType && (cfg.room === undefined || cfg.room === roomId),
  );

const planSpriteTrigger = (sprite: SimSprite): TriggerAction | null => {
  if (sprite.kind === 'npc') {
    const cfg = npcConfigForSprite(sprite.spriteType, sprite.roomId);
    if (!cfg) return null;
    return { type: 'npc', flagType: cfg.flagType, flagMask: cfg.flagMask, itemId: cfg.itemId };
  }
  if (sprite.kind === 'standing' || sprite.kind === 'overworld') {
    return { type: 'overworld', screen: sprite.roomId, mask: 0x40, itemId: sprite.itemId ?? 0 };
  }
  return null;
};

/** Dispatch by interactable shape. */
const planTrigger = (interactable: SimChest | SimSprite): TriggerAction | null => {
  if ('chestIndex' in interactable) return planChestTrigger(interactable);
  return planSpriteTrigger(interactable);
};

export { planTrigger, planChestTrigger, planSpriteTrigger, npcConfigForSprite };
