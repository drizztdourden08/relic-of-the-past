/* @layer renderer-lib @kind logic */
import { maxSpanOf } from '@rotp/randomizer';
import { itemAt } from '@app/checked-access';
import type { CapacityFamily, PlannedFamilySetting } from '@rotp/randomizer';

const customDefaultOf = (capacityFamily: CapacityFamily): PlannedFamilySetting => {
  const { ladder, defaultCount, vanillaRung } = capacityFamily;
  return {
    mode: 'custom',
    start: itemAt(ladder, vanillaRung),
    max: itemAt(ladder, ladder.length - 1),
    count: Math.min(defaultCount, maxSpanOf(capacityFamily) - vanillaRung),
    shape: { curve: 'equal' },
  };
};

export { customDefaultOf };
