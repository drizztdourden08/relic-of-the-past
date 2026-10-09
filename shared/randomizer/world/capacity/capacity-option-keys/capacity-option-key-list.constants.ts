/* @layer shared-game @kind constants */
import { CAPACITY_FAMILY_IDS } from '@shared/game/data/capacity-upgrade-names.data';
import { CAPACITY_FIELDS_OF } from './capacity-option-keys.constants';
import { capacityKeyOf } from './capacity-key-of';

const CAPACITY_OPTION_KEYS: readonly string[] = CAPACITY_FAMILY_IDS.flatMap((family) =>
  CAPACITY_FIELDS_OF[family].map((field) => capacityKeyOf(family, field)));

export { CAPACITY_OPTION_KEYS };
