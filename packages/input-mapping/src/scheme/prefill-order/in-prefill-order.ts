/* @layer shared-input @kind logic */
import { PREFILL_ORDER } from './prefill-order.constants';
import type { Positioned } from './prefill-order.type';

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

export { inPrefillOrder };
