/* @layer renderer-lib @kind logic */
import { CURVE_PRESETS } from '@shared/randomizer/world/capacity';
import type { CapacityFamily } from '@shared/randomizer/world/capacity';
import { hiddenPresetsOf } from './hidden-presets-of';

const offeredPresetsOf = (capacityFamily: CapacityFamily) =>
  CURVE_PRESETS.filter((preset) => !hiddenPresetsOf(capacityFamily).includes(preset.id));

export { offeredPresetsOf };
