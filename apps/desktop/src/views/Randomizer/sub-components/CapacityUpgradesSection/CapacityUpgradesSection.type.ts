/* @layer renderer-components @kind types */
import type { CapacityBonusSetting, CapacityFamilyId, CapacityProfile, WalletFloor } from '@rotp/randomizer';
import type { CapacityChangeHandlers } from '@app/compounds/CapacityUpgradesBlock/CapacityUpgradesBlock.type';

interface CapacityUpgradesSectionProps extends CapacityChangeHandlers {
  profile: CapacityProfile;
  fillerHeadroom: number | null;
  notes: readonly string[];
  enabled?: boolean;
  progressive: boolean;
  forced?: ReadonlyMap<CapacityFamilyId, string>;
  walletFloor?: WalletFloor;
  bonus?: CapacityBonusSetting;
  readOnly?: boolean;
  onReset?: () => void;
}

export type { CapacityUpgradesSectionProps };
