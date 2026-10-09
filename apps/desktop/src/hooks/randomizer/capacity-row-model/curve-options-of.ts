/* @layer renderer-lib @kind logic */
import { CURVE_IDS, CURVE_LABELS } from '@rotp/randomizer';
import type { CapacityFamily } from '@rotp/randomizer';
import type { SelectGroup } from '@drizztdourden08/tessera/primitives';
import { offeredPresetsOf } from '../capacity-row-state';

const curveOptionsOf = (capacityFamily: CapacityFamily): readonly SelectGroup[] => [
  {
    label: 'Curves',
    options: [...CURVE_IDS, 'free' as const].map((curve) => ({ value: curve, label: CURVE_LABELS[curve] })),
  },
  {
    label: 'Presets',
    options: offeredPresetsOf(capacityFamily).map((preset) => ({ value: `preset:${preset.id}`, label: `Preset · ${preset.label}` })),
  },
];

export { curveOptionsOf };
