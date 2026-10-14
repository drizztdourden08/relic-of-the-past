/* @layer shared-game @kind logic */
import { REFERENCE_CAPACITY_PROFILE } from '../../../capacity/capacity-profile-defaults';
import { REFERENCE_CAPACITY_BONUS } from '../../../capacity/bonus/capacity-bonus.constants';
import type { FillWorldOptions } from '../../fill-world.type';
import type { ScopeDefaults } from './fill-defaults.type';

const scopeDefaultsOf = (options: FillWorldOptions): ScopeDefaults => {
  const {
    includeNpcChecks = true, includeWorldItems = includeNpcChecks,
    capacity = REFERENCE_CAPACITY_PROFILE, capacityProgressive = false, capacityBonus = REFERENCE_CAPACITY_BONUS,
  } = options;
  return { includeNpcChecks, includeWorldItems, capacity, capacityProgressive, capacityBonus };
};

export { scopeDefaultsOf };
