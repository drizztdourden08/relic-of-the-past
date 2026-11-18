/* @layer renderer-lib @kind logic */
import type { I18n, Text } from '@drizztdourden08/brock-core/i18n';
import { CURVE_IDS, CURVE_LABELS } from '@rotp/randomizer';
import type { CapacityFamily } from '@rotp/randomizer';
import type { SelectGroup } from '@drizztdourden08/tessera/primitives';
import { offeredPresetsOf } from '../capacity-row-state';

const curveOptionsOf = (capacityFamily: CapacityFamily, t: I18n['t'], text: (text: Text) => string): readonly SelectGroup[] => [
  {
    label: t('randomizer:curve.group.curves'),
    options: [...CURVE_IDS, 'free' as const].map((curve) => ({ value: curve, label: text(CURVE_LABELS[curve]) })),
  },
  {
    label: t('randomizer:curve.group.presets'),
    options: offeredPresetsOf(capacityFamily).map((preset) => ({
      value: `preset:${preset.id}`,
      label: t('randomizer:curve.preset', { name: text(preset.label) }),
    })),
  },
];

export { curveOptionsOf };
