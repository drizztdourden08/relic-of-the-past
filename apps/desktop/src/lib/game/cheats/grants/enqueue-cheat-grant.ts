/* @layer bridge-wasm @kind logic */
import { enqueue } from '../../delivery-queue';
import type { DeliveryAction } from '../../delivery-queue';
import { cheatItemGrantAllowed } from '@rotp/game-core';
import { itemName } from '@rotp/game-core';

const enqueueCheatGrant = (itemId: number, action: DeliveryAction): void => {
  if (!cheatItemGrantAllowed()) return;
  enqueue(itemName(itemId), 'cheat', action);
};

export { enqueueCheatGrant };
