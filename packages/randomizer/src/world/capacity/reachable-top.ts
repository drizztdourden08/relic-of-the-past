/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import { planOf, startTierOf } from './family-plan';
import type { CapacityFamily } from './capacity-family';
import type { CapacityProfile } from './capacity-profile.type';

const reachableTopOf = (family: CapacityFamily, profile: CapacityProfile): number => {
  const setting = profile[family.id];
  if (setting.mode !== 'custom') return itemAt(family.ladder, family.vanillaRung);
  const jumps = planOf(family, setting).jumps;
  const rung = Math.min(
    family.ladder.length - 1,
    startTierOf(family, setting) + jumps.reduce((sum, jump) => sum + jump, 0),
  );
  return itemAt(family.ladder, rung);
};

export { reachableTopOf };
