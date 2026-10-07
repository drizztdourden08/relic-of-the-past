/* @layer shared-game @kind data */
/**
 * The eight pickup-bonus rows of the option catalog: synthetic, unlocked,
 * group 'items', two per family: the percentage a capacity upgrade hands over
 * beside the ceiling it raises, and the switch that says what the percentage
 * is of. Rendered on each family's own row in the capacity block, never as
 * plain rows. Descriptions merge in from options-descriptions.data.ts.
 */
import { FAMILIES } from '../capacity-family';
import {
  CAPACITY_BONUS_MAX, DEFAULT_CAPACITY_BONUS, capacityBonusBaseKeyOf, capacityBonusKeyOf,
} from './capacity-bonus.data';
import type { ApOptionDef } from '../../options.type';
import type { CapacityFamily } from '../capacity-family';

type Seed = Omit<ApOptionDef, 'description'>;

const base = {
  group: 'items' as const,
  implementation: 'active' as const,
  locked: false,
  synthetic: true,
};

const seedsOf = (capacityFamily: CapacityFamily): Seed[] => {
  const { id, label } = capacityFamily;
  const { percent, stepBase } = DEFAULT_CAPACITY_BONUS[id];
  return [
    {
      ...base, key: capacityBonusKeyOf(id), displayName: `${label} pickup bonus`, kind: 'range',
      range: { min: 0, max: CAPACITY_BONUS_MAX }, apDefault: percent, baseline: percent,
    },
    {
      ...base, key: capacityBonusBaseKeyOf(id), displayName: `${label} bonus of the gain`, kind: 'toggle',
      apDefault: stepBase, baseline: stepBase,
    },
  ];
};

const CAPACITY_BONUS_OPTION_SEEDS: readonly Seed[] = FAMILIES.flatMap(seedsOf);

export { CAPACITY_BONUS_OPTION_SEEDS };
