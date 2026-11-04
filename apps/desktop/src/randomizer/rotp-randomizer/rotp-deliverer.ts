/* @layer renderer-app @kind logic */
import { canReceive, executeAction, isReceiptGrant } from '@rotp/randomizer';
import type { DeliveryAction } from '@rotp/randomizer';
import type { ItemDeliverer } from '@drizztdourden08/brock-randomizer/session';

const rotpDeliverer: ItemDeliverer<DeliveryAction> = {
  isSafeFrame: canReceive,
  execute: executeAction,
  holdsInFlight: isReceiptGrant,
};

export { rotpDeliverer };
