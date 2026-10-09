/* @layer renderer-lib @kind hook */
import { useMemo } from 'react';
import { FAMILIES, NO_WALLET_FLOOR } from '@rotp/randomizer';
import { capacityRowModelOf } from './capacity-row-model';
import type { CapacityRowModel } from '@domains/app/compounds/CapacityFamilyRow';
import type { CapacityRowsInput } from './use-capacity-rows.type';
import { NO_FORCED } from './use-capacity-rows.constants';

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
