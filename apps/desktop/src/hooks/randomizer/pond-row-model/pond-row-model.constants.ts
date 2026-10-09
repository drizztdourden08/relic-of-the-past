/* @layer renderer-hooks @kind constants */
import { POND_PRICE_LADDER } from '@rotp/randomizer';
import { CURVE_LABELS } from '@rotp/randomizer';
import type { PondSetting } from '@rotp/randomizer';

const MODE_LABELS: Readonly<Record<PondSetting['mode'], string>> = {
  capacity: 'Vanilla grants',
  'vanilla-cost': 'Vanilla cost',
  custom: 'Custom',
};

const PRICE_STOPS: readonly string[] = POND_PRICE_LADDER.map((price) => (price === 0 ? 'free' : String(price)));

const CURVE_OPTIONS = (['equal', 'front', 'ramp', 'reverse-fib', 'geometric', 'free'] as const)
  .map((curve) => ({ value: curve, label: CURVE_LABELS[curve] }));

export { CURVE_OPTIONS, MODE_LABELS, PRICE_STOPS };
