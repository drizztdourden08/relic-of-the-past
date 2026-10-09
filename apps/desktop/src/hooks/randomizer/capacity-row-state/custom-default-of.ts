/* @layer renderer-lib @kind logic */
import { maxSpanOf } from '@shared/randomizer/world/capacity';
import type { CapacityFamily, CustomFamilySetting } from '@shared/randomizer/world/capacity';

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
