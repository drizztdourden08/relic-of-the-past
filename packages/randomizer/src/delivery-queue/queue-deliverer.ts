/* @layer bridge-wasm @kind logic */
import type { ItemDeliverer } from '@drizztdourden08/brock-randomizer/session';
import { executeAction } from '../delivery-execute/execute-action';
import { isReceiptGrant } from '../delivery-execute/is-receipt-grant';
import { canReceive } from './can-receive';
import { cancelledActions } from './cancelled-actions';
import type { DeliveryAction } from './delivery-queue.type';

const queueDeliverer: ItemDeliverer<DeliveryAction> = {
  isSafeFrame: canReceive,
  execute: (action) => (cancelledActions.has(action) ? 'settled' : executeAction(action)),
  holdsInFlight: isReceiptGrant,
};

export { queueDeliverer };
