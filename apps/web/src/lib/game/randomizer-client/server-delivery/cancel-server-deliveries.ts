/* @layer bridge-wasm @kind logic */
import { remove } from '../../delivery-queue';
import { waitingDeliveries } from './waiting-deliveries';

const cancelServerDeliveries = (): void => {
  for (const [entryId, freeLine] of waitingDeliveries) {
    if (remove(entryId)) freeLine();
  }
  waitingDeliveries.clear();
};

export { cancelServerDeliveries };
