/* @layer bridge-wasm @kind logic */
import {
  FAMILIES, REFERENCE_CAPACITY_BONUS, WALLET, maxTierOf, planOf, startTierOf,
} from '@shared/randomizer/world/capacity';
import { walletJumpTableOf } from '@rotp/game-data';
import type { CapacityBonusSetting, CapacityProfile } from '@shared/randomizer/world/capacity';
import type { CapacityFamilyArm } from '../../capacity-profile';
import type { CapacityLadderArm, CapacitySessionPlan } from './capacity-session.type';

const capacitySessionOf = (
  profile: CapacityProfile, progressive = false, bonus: CapacityBonusSetting = REFERENCE_CAPACITY_BONUS,
): CapacitySessionPlan => {
  const families = FAMILIES.map((family): CapacityFamilyArm => {
    const setting = profile[family.id];
    return {
      family: family.id,
      custom: setting.mode === 'custom',
      startTier: startTierOf(family, setting),
      maxTier: maxTierOf(family, setting),
    };
  });
  const walletTable = walletJumpTableOf(planOf(WALLET, profile.wallet).jumps);
  const ladders = FAMILIES.flatMap((capacityFamily): CapacityLadderArm[] => {
    const setting = profile[capacityFamily.id];
    return setting.mode === 'custom' ? [{ family: capacityFamily.id, jumps: planOf(capacityFamily, setting).jumps }] : [];
  });
  const bonusArmed = FAMILIES.some((family) => profile[family.id].mode !== 'vanilla');
  return {
    profile, families, walletTable, armed: families.some((arm) => arm.custom), ladders, progressive, bonus, bonusArmed,
  };
};

export { capacitySessionOf };
