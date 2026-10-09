/* @layer shared-game @kind logic */
import type { SimSprite, TriggerAction } from '../../types';
import { OW_PICKUP_MASK } from './trigger-plans.constants';
import { npcConfigForSprite } from './npc-config-for-sprite';
import { indoorPickupSlot } from './indoor-pickup-slot';

const planNpcTrigger = (sprite: SimSprite): TriggerAction | null => {
  const check = npcConfigForSprite(sprite.spriteType, sprite.roomId, sprite.outdoor);
  const cfg = check?.gameId;
  if (!cfg || cfg.itemId === undefined || cfg.flagType === undefined || cfg.flagMask === undefined) return null;
  if (cfg.roomFlag) {
    return { type: 'chest', roomId: cfg.roomFlag.roomId, chestIndex: cfg.roomFlag.chestIndex, itemId: cfg.itemId };
  }
  return { type: 'npc', flagType: cfg.flagType, flagMask: cfg.flagMask, itemId: cfg.itemId };
};

const planPickupTrigger = (sprite: SimSprite): TriggerAction | null => {
  if (sprite.itemId === undefined) return null;
  if (sprite.outdoor) {
    return { type: 'overworld', screen: sprite.roomId, mask: OW_PICKUP_MASK, itemId: sprite.itemId };
  }
  return { type: 'chest', roomId: sprite.roomId, chestIndex: indoorPickupSlot(sprite), itemId: sprite.itemId };
};

const planSpriteTrigger = (sprite: SimSprite): TriggerAction | null => {
  if (sprite.kind === 'npc') return planNpcTrigger(sprite);
  if (sprite.kind === 'standing' || sprite.kind === 'overworld') return planPickupTrigger(sprite);
  return null;
};

export { planSpriteTrigger };
