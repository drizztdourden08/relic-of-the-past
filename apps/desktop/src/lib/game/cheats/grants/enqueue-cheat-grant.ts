/* @layer bridge-wasm @kind logic */
import { enqueue } from '../../delivery-queue';
import type { DeliveryAction } from '../../delivery-queue';
import { cheatItemGrantAllowed } from '../gate/cheat-item-grant-allowed';
import { itemName } from './item-name';

const enqueueCheatGrant = (itemId: number, action: DeliveryAction): void => {
  if (!cheatItemGrantAllowed()) return;
  enqueue(itemName(itemId), 'cheat', action);
};

export { enqueueCheatGrant };
