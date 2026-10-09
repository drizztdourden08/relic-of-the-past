/* @layer bridge-wasm @kind logic */
import type { DeliveryEntry } from './delivery-queue.type';
import { DELIVERY_COOLDOWN } from './delivery-queue.constants';
import { notify } from './notify';
import { queueState } from './queue-state';

const releaseInFlight = (done: DeliveryEntry): DeliveryEntry => {
  queueState.delivering = null;
  queueState.cooldownFrames = DELIVERY_COOLDOWN;
  notify();
  return done;
};

export { releaseInFlight };
