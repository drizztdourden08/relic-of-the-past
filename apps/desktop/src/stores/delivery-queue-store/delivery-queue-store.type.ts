/* @layer renderer-stores @kind types */
import type { DeliveryEntry, DeliveryQueueState } from '../../game/delivery-queue';

interface DeliveryQueueStore {
  pending: DeliveryEntry[];
  delivering: DeliveryEntry | null;
  _sync: (state: DeliveryQueueState) => void;
}

export type { DeliveryQueueStore };
