/* @layer renderer-lib @kind hook */
/**
 * The four capacity family rows of a profile, derived once per input. The
 * creation panel and the Run tab both render them through
 * CapacityUpgradesBlock. `forced` carries the sentence a sibling setting put
 * on a family's card (the rule's own reading), so a row the player cannot set
 * right now renders inert with the reason on it; `walletFloor` what these
 * settings let the seed charge at once, which is where the wallet's final cap
 * stops going down; `bonus` what each family's pickups hand over.
 */
import { useMemo } from 'react';
import { FAMILIES, NO_WALLET_FLOOR } from '@shared/randomizer/ap-world/capacity';
import { capacityRowModelOf } from './capacity-row-model';
import type {
  CapacityBonusSetting, CapacityFamilyId, CapacityProfile, WalletFloor,
} from '@shared/randomizer/ap-world/capacity';
import type { CapacityRowModel } from '@domains/app/compounds/CapacityFamilyRow';

interface CapacityRowsInput {
  profile: CapacityProfile;
  fillerHeadroom: number | null;
  progressive?: boolean;
  forced?: ReadonlyMap<CapacityFamilyId, string>;
  walletFloor?: WalletFloor;
  bonus?: CapacityBonusSetting;
}

const NO_FORCED: ReadonlyMap<CapacityFamilyId, string> = new Map();

const useCapacityRows = (input: CapacityRowsInput): readonly CapacityRowModel[] => {
  const { profile, fillerHeadroom, progressive = false, forced = NO_FORCED, walletFloor = NO_WALLET_FLOOR, bonus } = input;
  return useMemo(
    () => FAMILIES.map((family) => capacityRowModelOf({
      family, setting: profile[family.id], fillerHeadroom, progressive,
      forced: forced.get(family.id), walletFloor, bonus: bonus?.[family.id],
    })),
    [profile, fillerHeadroom, progressive, forced, walletFloor, bonus],
  );
};

export { useCapacityRows };
export type { CapacityRowsInput };
