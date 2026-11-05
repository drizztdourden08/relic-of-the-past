/* @layer bridge-wasm @kind logic */
import type { DeliveryEntry, StateListener } from './delivery-queue.type';

const queueState = {
  queue: [] as DeliveryEntry[],
  delivering: null as DeliveryEntry | null,
  listeners: new Set<StateListener>(),
  nextId: 0,
};

export { queueState };
