/* @layer shared-game @kind logic */
import { familyById } from '../capacity-family';
import { planOf } from './plan-of';
import type { CapacityFamilyId, CapacityProfile, FamilyPlan } from '../capacity-profile.type';

const capacityPlansOf = (profile: CapacityProfile, progressive = false): Record<CapacityFamilyId, FamilyPlan> => ({
  explosives: planOf(familyById('explosives'), profile.explosives, progressive),
  projectiles: planOf(familyById('projectiles'), profile.projectiles, progressive),
  meter: planOf(familyById('meter'), profile.meter, progressive),
  wallet: planOf(familyById('wallet'), profile.wallet, progressive),
});

export { capacityPlansOf };
