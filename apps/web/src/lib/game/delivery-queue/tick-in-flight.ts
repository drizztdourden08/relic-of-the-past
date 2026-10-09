/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { isReceiptGrant } from '../delivery-execute';
import type { DeliveryEntry } from './delivery-queue.type';
import { DELIVERY_TIMEOUT_FRAMES } from './delivery-queue.constants';
import { canReceive } from './can-receive';
import { fireComplete } from './fire-complete';
import { queueState } from './queue-state';
import { releaseInFlight } from './release-in-flight';

const tickInFlight = (delivering: DeliveryEntry): void => {
  queueState.deliveringFrames++;
  const ready = canReceive();
  if (!ready) queueState.deliveringBecameBusy = true;
  if (ready && queueState.deliveringBecameBusy) {
    fireComplete(releaseInFlight(delivering));
    return;
  }
  if (queueState.deliveringFrames < DELIVERY_TIMEOUT_FRAMES) return;
  if (isReceiptGrant(delivering.action)) {
    log.app(`Delivery "${delivering.message}" still waiting for its pickup to finish, keeping it in flight`, 'warn');
    queueState.deliveringFrames = 0;
    return;
  }
  const done = releaseInFlight(delivering);
  log.app(`Delivery "${done.message}" timed out waiting for pickup to finish`, 'warn');
  fireComplete(done);
};

export { tickInFlight };
