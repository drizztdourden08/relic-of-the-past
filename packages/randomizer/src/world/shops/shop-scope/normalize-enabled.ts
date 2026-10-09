/* @layer shared-game @kind logic */
import { STANDARD_SHOP_SLOT_COUNT } from '../shop-slot-facts';

const normalizeEnabled = (enabled: Iterable<number>): number[] =>
  [...new Set(enabled)]
    .filter((index) => Number.isInteger(index) && index >= 0 && index < STANDARD_SHOP_SLOT_COUNT)
    .sort((a, b) => a - b);

export { normalizeEnabled };
