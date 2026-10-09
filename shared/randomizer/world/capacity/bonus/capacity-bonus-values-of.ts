/* @layer shared-game @kind logic */
import { CAPACITY_FAMILY_IDS } from '@shared/game/data/capacity-upgrade-names.data';
import { capacityBonusBaseKeyOf } from './capacity-bonus-base-key-of';
import { capacityBonusKeyOf } from './capacity-bonus-key-of';
import { clampBonusPercent } from './clamp-bonus-percent';
import type { OptionValue } from '../../options.type';
import type { CapacityBonusSetting } from './capacity-bonus.type';

const capacityBonusValuesOf = (setting: CapacityBonusSetting): Record<string, OptionValue> => {
  const values: Record<string, OptionValue> = {};
  for (const family of CAPACITY_FAMILY_IDS) {
    values[capacityBonusKeyOf(family)] = clampBonusPercent(setting[family].percent);
    values[capacityBonusBaseKeyOf(family)] = setting[family].stepBase;
  }
  return values;
};

export { capacityBonusValuesOf };
