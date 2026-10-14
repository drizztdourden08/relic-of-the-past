/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { deliveryQueue } from '../../../game';
import { useDeliveryQueueStore } from '../../../stores/delivery-queue-store';

const useDeliveryQueueSync = (): void => {
  useEffect(() => {
    const unsub = deliveryQueue.subscribe(useDeliveryQueueStore.getState()._sync);
    return unsub;
  }, []);
};

export { useDeliveryQueueSync };
