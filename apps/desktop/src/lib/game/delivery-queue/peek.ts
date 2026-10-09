/* @layer bridge-wasm @kind logic */
import type { DeliveryEntry } from './delivery-queue.type';
import { queueState } from './queue-state';

const peek = (): DeliveryEntry | undefined => queueState.queue[0];

export { peek };
