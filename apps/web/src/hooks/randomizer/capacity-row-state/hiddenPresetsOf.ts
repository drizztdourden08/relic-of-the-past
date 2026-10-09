/* @layer renderer-lib @kind logic */
import type { CapacityFamily, CurvePresetId } from '@shared/randomizer/world/capacity';

const hiddenPresetsOf = (capacityFamily: CapacityFamily): readonly CurvePresetId[] =>
  capacityFamily.id === 'wallet' ? ['reference'] : [];

export { hiddenPresetsOf };
