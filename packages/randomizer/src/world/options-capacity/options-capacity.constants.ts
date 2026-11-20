/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { FAMILIES } from '../capacity/capacity-family';
import { CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY, capacityFieldsOf } from '../capacity/capacity-option-keys';
import { capacitySeedOf } from './capacity-seed-of';
import type { OptionSeed } from '../options.type';

const CAPACITY_ENABLED_SEED: OptionSeed = {
  key: CAPACITY_ENABLED_KEY, displayName: msg('randomizer-world:option.capacity_enabled'), group: 'items', kind: 'toggle',
  implementation: 'active', locked: false, synthetic: true, sourceDefault: true, baseline: true,
};

const CAPACITY_PROGRESSIVE_SEED: OptionSeed = {
  key: CAPACITY_PROGRESSIVE_KEY, displayName: msg('randomizer-world:option.capacity_progressive'), group: 'items', kind: 'toggle',
  implementation: 'active', locked: false, synthetic: true, sourceDefault: true, baseline: true,
};

const CAPACITY_OPTION_SEEDS: readonly OptionSeed[] = [
  CAPACITY_ENABLED_SEED,
  ...FAMILIES.flatMap((capacityFamily) =>
    capacityFieldsOf(capacityFamily.id).map((field) => capacitySeedOf(capacityFamily, field))),
  CAPACITY_PROGRESSIVE_SEED,
];

export { CAPACITY_OPTION_SEEDS };
