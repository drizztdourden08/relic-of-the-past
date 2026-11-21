/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { DEFAULT_CAPACITY_PROFILE } from '../capacity/capacity-profile-defaults';
import { capacityValuesOf } from '../capacity/capacity-profile-from-snapshot';
import { CURVE_LABELS } from '../capacity/curves/curve-ids.constants';
import type { OptionChoice } from '../options.type';

const CAPACITY_MODE_CHOICES: readonly OptionChoice[] = [
  { value: 'vanilla', sourceValue: 0, label: msg('randomizer:capacityMode.vanilla') },
  { value: 'vanilla-in-pool', sourceValue: 1, label: msg('randomizer:capacityMode.vanillaInPool') },
  { value: 'custom', sourceValue: 2, label: msg('randomizer:capacityMode.custom') },
];

const WALLET_MODE_CHOICES: readonly OptionChoice[] = CAPACITY_MODE_CHOICES
  .filter((choice) => choice.value !== 'vanilla-in-pool');

const CAPACITY_CURVE_CHOICES: readonly OptionChoice[] = (
  ['equal', 'front', 'ramp', 'reverse-fib', 'geometric', 'free'] as const
).map((curve, index) => ({ value: curve, sourceValue: index, label: CURVE_LABELS[curve] }));

const DEFAULT_CAPACITY_ROWS = capacityValuesOf(DEFAULT_CAPACITY_PROFILE);

export { CAPACITY_CURVE_CHOICES, CAPACITY_MODE_CHOICES, DEFAULT_CAPACITY_ROWS, WALLET_MODE_CHOICES };
