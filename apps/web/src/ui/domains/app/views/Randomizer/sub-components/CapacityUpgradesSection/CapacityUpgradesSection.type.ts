/* @layer renderer-components @kind types */
import type {
  CapacityBonusSetting, CapacityFamilyId, CapacityProfile, FamilyBonus, WalletFloor,
} from '@shared/randomizer/ap-world/capacity';
import type { CapacityRowState } from '@domains/app/compounds/CapacityFamilyRow';

interface CapacityUpgradesSectionProps {
  profile: CapacityProfile;
  /** Filler still in the pool; null when the pool could not be built. */
  fillerHeadroom: number | null;
  /** Every fallback the profile reader applied, plus whatever the pond rule forces. */
  notes: readonly string[];
  /** The master switch: off greys and freezes the four families. */
  enabled?: boolean;
  /** Pickups climb each Custom family's ladder in order (one progressive item per family). */
  progressive: boolean;
  /** Families a sibling setting pinned, each with the sentence its card shows in red. */
  forced?: ReadonlyMap<CapacityFamilyId, string>;
  /** What these settings let the seed charge at once: the wallet's own max floor. */
  walletFloor?: WalletFloor;
  /** What each family's pickups hand over beside their ceiling. */
  bonus?: CapacityBonusSetting;
  readOnly?: boolean;
  onChange?: (family: CapacityFamilyId, next: CapacityRowState) => void;
  onBonusChange?: (family: CapacityFamilyId, next: FamilyBonus) => void;
  onEnabledChange?: (enabled: boolean) => void;
  onProgressiveChange?: (progressive: boolean) => void;
  /** Offered in the notice when the rows cannot be derived: puts the profile back to a known-good one. */
  onReset?: () => void;
}

export type { CapacityUpgradesSectionProps };
