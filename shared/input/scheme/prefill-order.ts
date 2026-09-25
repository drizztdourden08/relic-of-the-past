/* @layer shared-input @kind logic */
/**
 * THE CANONICAL SLOT ORDER, and the one place it is written down.
 *
 * The shipped HUD documents place slot 1 on the north face button, slot 2 west,
 * slot 3 east, slot 4 south, then the d-pad up, left, right, down. A layout and
 * a scheme are joined by the slot NUMBER and by nothing else, so if a list came
 * out in some other order every shipped layout would draw the right shape with
 * the wrong letters in it.
 *
 * TWO CALLERS NEED THE SAME ANSWER, which is why this is not private to either:
 *
 *  - `derive-slots.ts` imposes it on the PREFILL, so a freshly dropped pad is
 *    correct whatever order its driver reports controls in (SDL's own starts at
 *    SOUTH, and is not guaranteed across drivers).
 *  - `migrate-slots.ts` imposes it on a list stored BEFORE slots were numbers.
 *    Such a list was written by that same derivation, in the device's order, and
 *    was never something the player arranged, so sorting it loses nothing of
 *    theirs and is the only way slot 1 comes out as NORTH, not SOUTH.
 *    A list that already carries numbers is the player's and is never re-sorted.
 *
 * Anything the order does not name keeps the position it was reported at, after
 * everything it does.
 */
import type { ModernSlot } from '../../types/controls/scheme';

const PREFILL_ORDER: readonly string[] = [
  'NORTH', 'WEST', 'EAST', 'SOUTH',
  'DPAD_UP', 'DPAD_LEFT', 'DPAD_RIGHT', 'DPAD_DOWN',
];

/** What a slot has to say about itself for the order to rank it. */
interface Positioned { position?: string }

/** Stable: ranked positions first in `PREFILL_ORDER`, everything else after in
 *  the order it arrived in. */
const inPrefillOrder = <T extends Positioned>(slots: readonly T[]): T[] => {
  const rank = (slot: T): number => {
    const at = slot.position ? PREFILL_ORDER.indexOf(slot.position) : -1;
    return at === -1 ? PREFILL_ORDER.length : at;
  };
  return slots
    .map((slot, at) => ({ slot, rank: rank(slot), at }))
    .sort((a, b) => (a.rank - b.rank) || (a.at - b.at))
    .map((entry) => entry.slot);
};

/**
 * Was this list written before slots were numbers?
 *
 * The test is the absence of a real `index` on every entry, which is exactly
 * what "pre-§19" means on disk. It is also what keeps the sort idempotent: the
 * moment a list has been migrated its entries carry numbers, so a second read
 * leaves the player's own order alone.
 */
const isLegacySlotList = (raw: readonly unknown[]): boolean =>
  raw.every((entry) => {
    const index = (entry as Partial<ModernSlot> | null)?.index;
    return !(typeof index === 'number' && Number.isInteger(index) && index > 0);
  });

export { PREFILL_ORDER, inPrefillOrder, isLegacySlotList };
