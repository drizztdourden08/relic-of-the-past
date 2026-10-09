/* @layer shared-game @kind constants */
import { CURVE_LABELS } from '../capacity/curves/curves.data';
import { POND_PRICE_LADDER } from '../pond/pond-ladder.data';
import type { OptionChoice } from '../options.type';

const POND_MODE_CHOICES: readonly OptionChoice[] = [
  { value: 'capacity', sourceValue: 0, label: 'Vanilla grants' },
  { value: 'vanilla-cost', sourceValue: 1, label: 'Vanilla cost' },
  { value: 'custom', sourceValue: 2, label: 'Custom' },
];

const POND_CURVE_CHOICES: readonly OptionChoice[] = (
  ['equal', 'front', 'ramp', 'reverse-fib', 'geometric', 'free'] as const
).map((curve, index) => ({ value: curve, sourceValue: index, label: CURVE_LABELS[curve] }));

const POND_PRICE_CHOICES: readonly OptionChoice[] = POND_PRICE_LADDER.map((value) => ({
  value: String(value),
  sourceValue: value,
  label: value === 0 ? 'free' : `${value} rupees`,
}));

export { POND_CURVE_CHOICES, POND_MODE_CHOICES, POND_PRICE_CHOICES };
