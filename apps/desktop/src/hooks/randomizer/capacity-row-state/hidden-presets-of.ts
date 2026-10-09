/* @layer renderer-lib @kind logic */
import type { CapacityFamily, CurvePresetId } from '@rotp/randomizer';

const hiddenPresetsOf = (capacityFamily: CapacityFamily): readonly CurvePresetId[] =>
  capacityFamily.id === 'wallet' ? ['reference'] : [];

export { hiddenPresetsOf };
