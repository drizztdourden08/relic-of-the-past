/* @layer bridge-wasm @kind logic */
import { createDeliveryQueue, createRafFrameClock } from '@drizztdourden08/brock-randomizer/session';
import { logSlot } from './log-slot';
import { queueDeliverer } from './queue-deliverer';
import type { DeliveryAction } from './delivery-queue.type';

const sharedEngine = createDeliveryQueue<DeliveryAction>({
  deliverer: queueDeliverer,
  clock: createRafFrameClock(),
  log: (message, level) => logSlot.current(message, level),
});

export { sharedEngine };
