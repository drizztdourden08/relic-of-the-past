/* @layer renderer-lib @kind types */
import type { CapacityFamily, FamilyBonus, FamilySetting, WalletFloor } from '@rotp/randomizer';

interface CapacityRowInput {
  family: CapacityFamily;
  setting: FamilySetting;
  fillerHeadroom: number | null;
  progressive?: boolean;
  forced?: string;
  walletFloor?: WalletFloor;
  bonus?: FamilyBonus;
}

export type { CapacityRowInput };
