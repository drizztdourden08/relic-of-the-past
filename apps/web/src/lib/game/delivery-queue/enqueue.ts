/* @layer bridge-wasm @kind logic */
import type { DeliveryAction, DeliveryEntry } from './delivery-queue.type';
import { notify } from './notify';
import { queueState } from './queue-state';

const generateId = (): string => `dlv_${Date.now()}_${queueState.nextId++}`;

const enqueue = (
  message: string, source: string, action: DeliveryAction, onComplete?: () => void, onGranted?: () => void,
): string => {
  const entry: DeliveryEntry = { id: generateId(), message, source, action, enqueuedAt: Date.now(), onComplete, onGranted };
  queueState.queue.push(entry);
  notify();
  return entry.id;
};

export { enqueue };
