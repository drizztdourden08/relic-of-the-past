/* @layer bridge-wasm @kind logic */
import type { DeliveryEntry, EnqueueParams } from './delivery-queue.type';
import { notify } from './notify';
import { queueState } from './queue-state';

const generateId = (): string => `dlv_${Date.now()}_${queueState.nextId++}`;

const enqueue = (params: EnqueueParams): string => {
  const { message, source, action, onComplete, onGranted } = params;
  const entry: DeliveryEntry = { id: generateId(), message, source, action, enqueuedAt: Date.now(), onComplete, onGranted };
  queueState.queue.push(entry);
  notify();
  return entry.id;
};

export { enqueue };
