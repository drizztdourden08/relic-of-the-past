/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { releaseSlot, takeSlot } from '../arrival-ring';
import { compose } from './compose';
import { sessionPool } from './session-pool';
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';

const appendSessionReceiptMessage = (line: ReceiptLine): number | null => {
  const { arrivals } = sessionPool;
  const previous = [...arrivals.lines];
  const slot = takeSlot(arrivals, line);
  if (slot === null) {
    log.randomizer('[Randomizer] Session dialogue: every received-item line is still pending', 'warn');
    return null;
  }
  if (!compose()) {
    releaseSlot(arrivals, slot);
    arrivals.lines[slot] = previous[slot];
    return null;
  }
  return (sessionPool.baseId as number) + slot;
};

export { appendSessionReceiptMessage };
