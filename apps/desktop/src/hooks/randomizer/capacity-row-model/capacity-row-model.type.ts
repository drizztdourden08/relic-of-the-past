/* @layer renderer-lib @kind types */
import type { I18n, Text } from '@drizztdourden08/brock-core/i18n';
import type { CapacityFamily, FamilyBonus, FamilySetting, WalletFloor } from '@rotp/randomizer';

interface CapacityRowInput {
  family: CapacityFamily;
  setting: FamilySetting;
  fillerHeadroom: number | null;
  progressive?: boolean;
  forced?: string;
  walletFloor?: WalletFloor;
  bonus?: FamilyBonus;
  t: I18n['t'];
  text: (text: Text) => string;
}

export type { CapacityRowInput };
