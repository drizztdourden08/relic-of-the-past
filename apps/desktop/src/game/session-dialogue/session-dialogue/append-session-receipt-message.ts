/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { releaseSlot, takeSlot, sessionPool } from '@rotp/game-core';
import { compose } from './compose';
import type { ReceiptLine } from '@rotp/game-core';

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
