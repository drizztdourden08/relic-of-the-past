/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { isReceiptGrant, DELIVERY_TIMEOUT_FRAMES, canReceive, fireComplete, queueState, releaseInFlight } from '@rotp/randomizer';
import type { DeliveryEntry } from '@rotp/randomizer';

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
