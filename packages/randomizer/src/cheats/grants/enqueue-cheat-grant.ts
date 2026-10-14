/* @layer bridge-wasm @kind logic */
import { enqueue } from '../../delivery-queue/enqueue';
import type { DeliveryAction } from '../../delivery-queue/delivery-queue.type';
import { cheatItemGrantAllowed, itemName } from '@rotp/game-core';

const enqueueCheatGrant = (itemId: number, action: DeliveryAction): void => {
  if (!cheatItemGrantAllowed()) return;
  enqueue({ message: itemName(itemId), source: 'cheat', action });
};

export { enqueueCheatGrant };
