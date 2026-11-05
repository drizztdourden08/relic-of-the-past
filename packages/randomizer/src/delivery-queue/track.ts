/* @layer bridge-wasm @kind logic */
import type { DeliveryRequest } from '@drizztdourden08/brock-randomizer/session';
import { cancelledActions } from './cancelled-actions';
import type { DeliveryAction, DeliveryEntry, EnqueueParams } from './delivery-queue.type';
import { notify } from './notify';
import { queueState } from './queue-state';

const generateId = (): string => `dlv_${Date.now()}_${queueState.nextId++}`;

const settle = (entry: DeliveryEntry): void => {
  const idx = queueState.queue.indexOf(entry);
  if (idx !== -1) queueState.queue.splice(idx, 1);
  if (queueState.delivering === entry) queueState.delivering = null;
  notify();
};

const track = (params: EnqueueParams): { id: string; request: DeliveryRequest<DeliveryAction> } => {
  const { message, source, action, onComplete, onGranted } = params;
  const entry: DeliveryEntry = { id: generateId(), message, source, action, enqueuedAt: Date.now(), onComplete, onGranted };
  queueState.queue.push(entry);
  notify();
  const request: DeliveryRequest<DeliveryAction> = {
    message,
    source,
    action,
    onGranted: () => {
      if (cancelledActions.has(action)) return;
      const idx = queueState.queue.indexOf(entry);
      if (idx !== -1) queueState.queue.splice(idx, 1);
      queueState.delivering = entry;
      notify();
      onGranted?.();
    },
    onComplete: () => {
      settle(entry);
      if (!cancelledActions.has(action)) onComplete?.();
    },
  };
  return { id: entry.id, request };
};

export { track };
