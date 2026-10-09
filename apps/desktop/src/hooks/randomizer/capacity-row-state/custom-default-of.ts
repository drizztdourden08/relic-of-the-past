/* @layer renderer-lib @kind logic */
import { maxSpanOf } from '@rotp/randomizer';
import type { CapacityFamily, CustomFamilySetting } from '@rotp/randomizer';

const customDefaultOf = (capacityFamily: CapacityFamily): CustomFamilySetting => {
  const { ladder, defaultCount, vanillaRung } = capacityFamily;
  return {
    mode: 'custom',
    start: ladder[vanillaRung],
    max: ladder[ladder.length - 1],
    count: Math.min(defaultCount, maxSpanOf(capacityFamily) - vanillaRung),
    shape: { curve: 'equal' },
  };
};

export { customDefaultOf };
