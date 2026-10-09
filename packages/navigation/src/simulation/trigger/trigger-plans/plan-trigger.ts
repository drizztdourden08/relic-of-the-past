/* @layer shared-game @kind logic */
import type { SimChest, SimSprite, TriggerAction } from '../../types';
import { planChestTrigger } from './plan-chest-trigger';
import { planSpriteTrigger } from './plan-sprite-trigger';

const planTrigger = (interactable: SimChest | SimSprite): TriggerAction | null => {
  if ('chestIndex' in interactable) return planChestTrigger(interactable);
  return planSpriteTrigger(interactable);
};

export { planTrigger };
