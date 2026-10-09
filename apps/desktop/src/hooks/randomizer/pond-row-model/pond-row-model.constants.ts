/* @layer renderer-hooks @kind constants */
import { POND_PRICE_LADDER } from '@shared/randomizer/world/pond/pond-ladder.data';
import { CURVE_LABELS } from '@shared/randomizer/world/capacity';
import type { PondSetting } from '@shared/randomizer/world/pond/pond-profile.type';

const MODE_LABELS: Readonly<Record<PondSetting['mode'], string>> = {
  capacity: 'Vanilla grants',
  'vanilla-cost': 'Vanilla cost',
  custom: 'Custom',
};

const PRICE_STOPS: readonly string[] = POND_PRICE_LADDER.map((price) => (price === 0 ? 'free' : String(price)));

const CURVE_OPTIONS = (['equal', 'front', 'ramp', 'reverse-fib', 'geometric', 'free'] as const)
  .map((curve) => ({ value: curve, label: CURVE_LABELS[curve] }));

export { CURVE_OPTIONS, MODE_LABELS, PRICE_STOPS };
