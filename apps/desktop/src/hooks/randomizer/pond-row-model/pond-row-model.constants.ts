/* @layer renderer-hooks @kind constants */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { POND_PRICE_LADDER, CURVE_LABELS } from '@rotp/randomizer';
import type { PondSetting } from '@rotp/randomizer';
import type { PondLadderFields } from './pond-row-model.type';

const MODE_LABELS: Readonly<Record<PondSetting['mode'], string>> = {
  capacity: 'Vanilla grants',
  'vanilla-cost': 'Vanilla cost',
  custom: 'Custom',
};

const PRICE_STOPS: readonly string[] = POND_PRICE_LADDER.map((price) => (price === 0 ? 'free' : String(price)));

const curveOptionsOf = (text: (text: Text) => string) => (['equal', 'front', 'ramp', 'reverse-fib', 'geometric', 'free'] as const)
  .map((curve) => ({ value: curve, label: text(CURVE_LABELS[curve]) }));

const DEFAULT_CUSTOM_POND: PondLadderFields ={ start: 100, max: 300, throws: 7, shape: { curve: 'equal' } };

export { curveOptionsOf, DEFAULT_CUSTOM_POND, MODE_LABELS, PRICE_STOPS };
