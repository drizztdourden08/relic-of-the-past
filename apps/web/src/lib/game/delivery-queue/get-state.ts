/* @layer bridge-wasm @kind logic */
import type { DeliveryQueueState } from './delivery-queue.type';
import { queueState } from './queue-state';

const getState = (): DeliveryQueueState => ({ pending: [...queueState.queue], delivering: queueState.delivering });

export { getState };
