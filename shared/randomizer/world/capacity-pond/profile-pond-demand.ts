/* @layer shared-game @kind logic */
import { pondDemandOf } from './pond-demand-of';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondDemand, PondFedFamily } from './capacity-pond-rule.type';

const profilePondDemand = (capacity: CapacityProfile, fed: readonly PondFedFamily[]): PondDemand => {
  const demands = fed.map((family) => pondDemandOf(capacity[family]));
  if (demands.includes('legacy')) return 'legacy';
  if (demands.includes('active')) return 'active';
  return undefined;
};

export { profilePondDemand };
