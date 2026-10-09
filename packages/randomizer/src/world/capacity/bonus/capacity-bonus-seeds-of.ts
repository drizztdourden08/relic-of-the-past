/* @layer shared-game @kind logic */
import { CAPACITY_BONUS_MAX, DEFAULT_CAPACITY_BONUS } from './capacity-bonus.constants';
import { capacityBonusBaseKeyOf } from './capacity-bonus-base-key-of';
import { capacityBonusKeyOf } from './capacity-bonus-key-of';
import { CAPACITY_BONUS_ROW } from './capacity-bonus-row.constants';
import type { OptionSeed } from '../../options.type';
import type { CapacityFamily } from '../capacity-family';

const capacityBonusSeedsOf = (capacityFamily: CapacityFamily): OptionSeed[] => {
  const { id, label } = capacityFamily;
  const { percent, stepBase } = DEFAULT_CAPACITY_BONUS[id];
  return [
    {
      ...CAPACITY_BONUS_ROW, key: capacityBonusKeyOf(id), displayName: `${label} pickup bonus`, kind: 'range',
      range: { min: 0, max: CAPACITY_BONUS_MAX }, sourceDefault: percent, baseline: percent,
    },
    {
      ...CAPACITY_BONUS_ROW, key: capacityBonusBaseKeyOf(id), displayName: `${label} bonus of the gain`, kind: 'toggle',
      sourceDefault: stepBase, baseline: stepBase,
    },
  ];
};

export { capacityBonusSeedsOf };
