/* @layer bridge-wasm @kind logic */
/**
 * The received-item lines of a session: a fixed ring of ARRIVAL_SLOTS slots at the front of the
 * session pool. A slot is taken when an online receipt reaches the front of the delivery queue
 * and handed back once the queue reports that delivery complete, so its id is reused by a later
 * arrival and the pool never grows past the ring, however long the session runs or however many
 * items arrive at once: only the delivery in flight holds a slot. The ring's size never changes,
 * so no set of the planned lines behind it can move an arrival a delivery still holds.
 */
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';

const ARRIVAL_SLOTS = 32;

/** What a free slot holds: an empty line, never shown because no delivery holds its id. */
const FREE_LINE: ReceiptLine = '';

interface ArrivalRing {
  readonly lines: ReceiptLine[];
  readonly busy: boolean[];
  /** Where the search for the next free slot starts, so a released id is the last one reused. */
  next: number;
}

const createArrivalRing = (): ArrivalRing => ({
  lines: Array.from({ length: ARRIVAL_SLOTS }, () => FREE_LINE),
  busy: Array.from({ length: ARRIVAL_SLOTS }, () => false),
  next: 0,
});

/** Takes the next free slot for |line|; null while every slot is held by a pending delivery. */
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

/** Frees |slot|; its line stays until a later arrival takes the slot. */
const releaseSlot = (ring: ArrivalRing, slot: number): void => {
  if (slot >= 0 && slot < ARRIVAL_SLOTS) ring.busy[slot] = false;
};

export { ARRIVAL_SLOTS, createArrivalRing, releaseSlot, takeSlot };
export type { ArrivalRing };
