/* @layer shared-game @kind logic */
import { RUPEE_DENOMINATIONS } from '../rupee-gems.data';
import type { RupeeDenomination } from '../pond.type';

const decomposeRupees = (amount: number): RupeeDenomination[] => {
  const gems: RupeeDenomination[] = [];
  let left = Math.max(0, Math.floor(amount));
  for (const denomination of RUPEE_DENOMINATIONS) {
    while (left >= denomination.value) {
      gems.push(denomination);
      left -= denomination.value;
    }
  }
  return gems;
};

export { decomposeRupees };
