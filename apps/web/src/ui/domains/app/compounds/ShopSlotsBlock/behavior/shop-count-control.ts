/* @layer renderer-components @kind logic */
import { SLOT_COUNT_FOLLOWS_TICKS, SLOT_COUNT_INERT } from '../ShopSlotsBlock.constants';
import type {
  ShopCountControl, ShopCountReadout, ShopCountSlider, ShopScopeSummary,
} from '../ShopSlotsBlock.type';
import { slotCountCeiling } from './slot-count-ceiling';

const shopCountControlOf = (summary: ShopScopeSummary): ShopCountControl => {
  const { active, counts, opened, ticked } = summary;
  if (counts) {
    return { kind: 'slider', value: opened, max: Math.max(ticked, 1), description: slotCountCeiling(ticked) };
  }
  return {
    kind: 'readout',
    value: `${opened} of ${ticked}`,
    description: active ? SLOT_COUNT_FOLLOWS_TICKS : SLOT_COUNT_INERT,
  };
};

export { shopCountControlOf };
export type { ShopCountControl, ShopCountReadout, ShopCountSlider };
