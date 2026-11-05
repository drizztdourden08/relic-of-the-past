/* @layer bridge-wasm @kind logic */
import type { DeliveryAction } from './delivery-queue.type';

const cancelledActions = new WeakSet<DeliveryAction>();

export { cancelledActions };
