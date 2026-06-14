/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { DeliveryEntry, DeliveryQueueState } from '../lib/game/delivery-queue';

interface DeliveryQueueStore {
  pending: DeliveryEntry[];
  delivering: DeliveryEntry | null;
  _sync: (state: DeliveryQueueState) => void;
}

const useDeliveryQueueStore = create<DeliveryQueueStore>()((set) => ({
  pending: [],
  delivering: null,
  _sync: (state: DeliveryQueueState) => set({ pending: state.pending, delivering: state.delivering }),
}));

export { useDeliveryQueueStore };
