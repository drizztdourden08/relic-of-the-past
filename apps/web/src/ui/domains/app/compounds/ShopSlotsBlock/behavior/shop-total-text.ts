/* @layer renderer-components @kind logic */
/**
 * The one line under the sliders: what the shops cost the seed, spelled out as
 * slots × items = locations. A sentence rather than three numbers, because the
 * multiplication is the part a player is deciding about.
 */
import { VANILLA_TOTAL } from '../ShopSlotsBlock.constants';
import type { ShopScopeSummary } from './shop-scope-edits';

const counted = (count: number, noun: string): string => `${count} ${noun}${count === 1 ? '' : 's'}`;

const shopTotalTextOf = (summary: ShopScopeSummary): string => {
  const { active, opened, depth, locations } = summary;
  if (!active) return VANILLA_TOTAL;
  return `${counted(opened, 'slot')} × ${counted(depth, 'item')} = ${counted(locations, 'shop location')}`;
};

export { shopTotalTextOf };
