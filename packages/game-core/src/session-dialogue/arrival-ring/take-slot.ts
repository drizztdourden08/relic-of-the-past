/* @layer bridge-wasm @kind logic */
import { ARRIVAL_SLOTS } from './arrival-ring.constants';
import type { ArrivalRing } from './arrival-ring.type';
import type { ReceiptLine } from '../../receipt-text/receipt-line.type';

const takeSlot = (ring: ArrivalRing, line: ReceiptLine): number | null => {
  for (let step = 0; step < ARRIVAL_SLOTS; step += 1) {
    const slot = (ring.next + step) % ARRIVAL_SLOTS;
    if (ring.busy[slot]) continue;
    ring.busy[slot] = true;
    ring.lines[slot] = line;
    ring.next = (slot + 1) % ARRIVAL_SLOTS;
    return slot;
  }
  return null;
};

export { takeSlot };
