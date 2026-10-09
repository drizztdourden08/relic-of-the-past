/* @layer renderer-lib @kind logic */
import { CURVE_PRESETS } from '@rotp/randomizer';
import type { CapacityFamily } from '@rotp/randomizer';
import { hiddenPresetsOf } from './hidden-presets-of';

const offeredPresetsOf = (capacityFamily: CapacityFamily) =>
  CURVE_PRESETS.filter((preset) => !hiddenPresetsOf(capacityFamily).includes(preset.id));

export { offeredPresetsOf };
