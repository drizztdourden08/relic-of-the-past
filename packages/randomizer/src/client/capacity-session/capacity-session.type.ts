/* @layer bridge-wasm @kind types */
import type { CapacityBonusSetting, CapacityFamilyId, CapacityProfile } from '../../world/capacity';
import type { CapacityFamilyArm } from '../../capacity-profile/capacity-profile.type';

interface CapacityLadderArm {
  family: CapacityFamilyId;
  jumps: readonly number[];
}

interface CapacitySessionPlan {
  profile: CapacityProfile;
  families: readonly CapacityFamilyArm[];
  walletTable: readonly number[];
  armed: boolean;
  ladders: readonly CapacityLadderArm[];
  progressive: boolean;
  bonus: CapacityBonusSetting;
  bonusArmed: boolean;
}

export type { CapacityLadderArm, CapacitySessionPlan };
