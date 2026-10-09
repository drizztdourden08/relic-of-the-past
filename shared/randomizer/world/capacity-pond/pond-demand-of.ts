/* @layer shared-game @kind logic */
import { isInPool } from './is-in-pool';
import type { FamilySetting } from '../capacity/capacity-profile.type';
import type { PondDemand } from './capacity-pond-rule.type';

const pondDemandOf = (setting: FamilySetting): PondDemand => {
  if (setting.mode === 'vanilla') return 'legacy';
  if (isInPool(setting)) return 'active';
  return undefined;
};

export { pondDemandOf };
