/* @layer shared-game @kind constants */
import { FAMILIES } from '../capacity-family';
import { capacityBonusSeedsOf } from './capacity-bonus-seeds-of';
import type { OptionSeed } from '../../options.type';

const CAPACITY_BONUS_OPTION_SEEDS: readonly OptionSeed[] = FAMILIES.flatMap(capacityBonusSeedsOf);

export { CAPACITY_BONUS_OPTION_SEEDS };
