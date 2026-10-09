/* @layer shared-game @kind logic */
import type { SimChest, TriggerAction } from '../../types';

const planChestTrigger = (chest: SimChest): TriggerAction => ({
  type: 'chest',
  roomId: chest.roomId,
  chestIndex: chest.chestIndex,
  itemId: chest.itemId ?? 0,
});

export { planChestTrigger };
