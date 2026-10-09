/* @layer bridge-wasm @kind logic */
import { locationKeyOfCheck } from '@shared/randomizer/world/location-record';
import { virtualChecksOf } from './virtual-checks-of';
import type { CheckRecord } from '@shared/game/data';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

const placementCheckRecords = (checkRecords: readonly CheckRecord[], placement: Placement): CheckRecord[] => {
  const real = checkRecords.filter((check) => placement.locations[locationKeyOfCheck(check.id)] !== undefined);
  return [...real, ...virtualChecksOf(placement)];
};

export { placementCheckRecords };
