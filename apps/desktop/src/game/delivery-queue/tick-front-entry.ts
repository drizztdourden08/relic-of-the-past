/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { executeEntry } from '@rotp/randomizer';
import { DELIVERY_COOLDOWN, REFUSAL_RETRY_COOLDOWN, REFUSAL_WARN_EVERY } from '@rotp/randomizer';
import { canReceive } from '@rotp/randomizer';
import { fireComplete } from '@rotp/randomizer';
import { notify } from '@rotp/randomizer';
import { queueState } from '@rotp/randomizer';

const tickFrontEntry = (): void => {
  if (queueState.queue.length === 0) return;
  if (!canReceive()) return;

  const entry = queueState.queue[0];
  const outcome = executeEntry(entry);
  if (outcome === 'refused') {
    entry.refusals = (entry.refusals ?? 0) + 1;
    if (entry.refusals % REFUSAL_WARN_EVERY === 0) {
      log.app(`Delivery "${entry.message}" refused ${entry.refusals} times, retrying until the player can receive`, 'warn');
    }
    queueState.cooldownFrames = REFUSAL_RETRY_COOLDOWN;
    return;
  }
  queueState.queue.shift();
  if (outcome === 'settled') {
    queueState.cooldownFrames = DELIVERY_COOLDOWN;
    notify();
    fireComplete(entry);
    return;
  }
  queueState.delivering = entry;
  queueState.deliveringBecameBusy = false;
  queueState.deliveringFrames = 0;
  notify();
};

export { tickFrontEntry };
