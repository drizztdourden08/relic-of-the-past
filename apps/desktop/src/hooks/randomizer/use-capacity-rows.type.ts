/* @layer renderer-lib @kind types */
import type { CapacityBonusSetting, CapacityFamilyId, CapacityProfile, WalletFloor } from '@rotp/randomizer';

interface CapacityRowsInput {
  profile: CapacityProfile;
  fillerHeadroom: number | null;
  progressive?: boolean;
  forced?: ReadonlyMap<CapacityFamilyId, string>;
  walletFloor?: WalletFloor;
  bonus?: CapacityBonusSetting;
}

export type { CapacityRowsInput };
