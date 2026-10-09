/* @layer shared-game @kind logic */
import { IN_POOL_SETTING, VANILLA_SETTING } from './capacity-pond.constants';
import { pondDemandOf } from './pond-demand-of';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondFedFamily } from './capacity-pond-rule.type';

const alignFamilies = (
  capacity: CapacityProfile, fed: readonly PondFedFamily[], pooled: boolean, keep?: PondFedFamily,
): CapacityProfile => {
  const next = { ...capacity };
  for (const family of fed) {
    if (family === keep) continue;
    const demand = pondDemandOf(next[family]);
    if (demand === undefined) continue;
    if (pooled && demand === 'legacy') next[family] = IN_POOL_SETTING;
    if (!pooled && demand === 'active') next[family] = VANILLA_SETTING;
  }
  return next;
};

export { alignFamilies };
