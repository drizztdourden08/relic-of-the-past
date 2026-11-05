/* @layer renderer-app @kind logic */
import { queueDeliverer } from '@rotp/randomizer';
import type { DeliveryAction } from '@rotp/randomizer';
import type { ItemDeliverer } from '@drizztdourden08/brock-randomizer/session';

const rotpDeliverer: ItemDeliverer<DeliveryAction> = queueDeliverer;

export { rotpDeliverer };
