/* @layer renderer-components @kind logic */
import { VANILLA_TOTAL } from '../ShopSlotsBlock.constants';
import type { ShopScopeSummary } from '../ShopSlotsBlock.type';

const counted = (count: number, noun: string): string => `${count} ${noun}${count === 1 ? '' : 's'}`;

const shopTotalTextOf = (summary: ShopScopeSummary): string => {
  const { active, opened, depth, locations } = summary;
  if (!active) return VANILLA_TOTAL;
  return `${counted(opened, 'slot')} × ${counted(depth, 'item')} = ${counted(locations, 'shop location')}`;
};

export { shopTotalTextOf };
