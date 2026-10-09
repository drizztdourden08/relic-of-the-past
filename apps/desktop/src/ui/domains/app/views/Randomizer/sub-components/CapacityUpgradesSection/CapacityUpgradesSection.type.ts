/* @layer renderer-components @kind types */
import type { CapacityBonusSetting, CapacityFamilyId, CapacityProfile, FamilyBonus, WalletFloor } from '@rotp/randomizer';
import type { CapacityRowState } from '@domains/app/compounds/CapacityFamilyRow';

interface CapacityUpgradesSectionProps {
  profile: CapacityProfile;
  fillerHeadroom: number | null;
  notes: readonly string[];
  enabled?: boolean;
  progressive: boolean;
  forced?: ReadonlyMap<CapacityFamilyId, string>;
  walletFloor?: WalletFloor;
  bonus?: CapacityBonusSetting;
  readOnly?: boolean;
  onChange?: (family: CapacityFamilyId, next: CapacityRowState) => void;
  onBonusChange?: (family: CapacityFamilyId, next: FamilyBonus) => void;
  onEnabledChange?: (enabled: boolean) => void;
  onProgressiveChange?: (progressive: boolean) => void;
  onReset?: () => void;
}

export type { CapacityUpgradesSectionProps };
