/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { DeliveryQueueState } from '../../game/delivery-queue';
import type { DeliveryQueueStore } from './delivery-queue-store.type';

const useDeliveryQueueStore = create<DeliveryQueueStore>()((set) => ({
  pending: [],
  delivering: null,
  _sync: (state: DeliveryQueueState) => set({ pending: state.pending, delivering: state.delivering }),
}));

export { useDeliveryQueueStore };
